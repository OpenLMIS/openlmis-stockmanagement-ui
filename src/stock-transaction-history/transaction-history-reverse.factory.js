/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name stock-transaction-history.transactionHistoryReverseFactory
     *
     * @description
     * Loads and caches the line items of a single stock event for the reverse view, decorated with
     * everything the view needs: whether the line can be reversed, which cancel reasons may be
     * offered for it and the stock on hand it would leave behind.
     *
     * The rows are cached per stock event because the reverse view paginates client side - the
     * state is re-entered on every page change, and returning the very same row objects is what
     * keeps the user's selections and chosen reasons alive across pages. Call clear() when the
     * view is opened anew or after a successful cancellation.
     */
    angular
        .module('stock-transaction-history')
        .factory('transactionHistoryReverseFactory', factory);

    factory.$inject = [
        '$q', 'TransactionHistoryResource', 'REASON_TYPES', 'REASON_CATEGORIES',
        'CANCEL_REASON_TAG', 'CANCEL_SCOPE_REASON_TAGS', 'StockCardSummaryRepository',
        'StockCardSummaryRepositoryImpl'
    ];

    function factory($q, TransactionHistoryResource, REASON_TYPES, REASON_CATEGORIES,
                     CANCEL_REASON_TAG, CANCEL_SCOPE_REASON_TAGS, StockCardSummaryRepository,
                     StockCardSummaryRepositoryImpl) {
        const ALL_ITEMS = 2147483647;

        let cache = {};

        return {
            getLineItems: getLineItems,
            clear: clear
        };

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.transactionHistoryReverseFactory
         * @name getLineItems
         *
         * @description
         * Returns the decorated line items of the given stock event, loading them on first call
         * and serving the same row objects afterwards.
         *
         * @param  {String}  stockEventId the stock event id
         * @param  {String}  facilityId   the facility the transaction belongs to
         * @param  {String}  programId    the program the transaction belongs to
         * @return {Promise}              the promise resolving to the list of rows
         */
        function getLineItems(stockEventId, facilityId, programId) {
            if (cache[stockEventId]) {
                return $q.resolve(cache[stockEventId]);
            }

            return $q
                .all({
                    page: new TransactionHistoryResource().getLineItems(stockEventId, {
                        page: 0,
                        size: ALL_ITEMS
                    }),
                    currentStockOnHand: currentStockOnHand(facilityId, programId)
                })
                .then(function(resolved) {
                    cache[stockEventId] = resolved.page.content.map(function(lineItem) {
                        return decorate(lineItem, resolved.currentStockOnHand);
                    });
                    return cache[stockEventId];
                });
        }

        function currentStockOnHand(facilityId, programId) {
            if (!facilityId || !programId) {
                return $q.resolve({});
            }

            return new StockCardSummaryRepository(new StockCardSummaryRepositoryImpl())
                .query({
                    programId: programId,
                    facilityId: facilityId,
                    page: 0,
                    size: ALL_ITEMS
                })
                .then(function(page) {
                    const byProductAndLot = {};
                    (page.content || []).forEach(function(summary) {
                        (summary.canFulfillForMe || []).forEach(function(entry) {
                            byProductAndLot[stockCardKey(entry.orderable, entry.lot)] =
                                entry.stockOnHand;
                        });
                    });
                    return byProductAndLot;
                })
                .catch(function() {
                    return {};
                });
        }

        function stockCardKey(orderable, lot) {
            return (orderable ? orderable.id : '') + '/' + (lot ? lot.id : '');
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.transactionHistoryReverseFactory
         * @name clear
         *
         * @description
         * Drops the cached rows, so the next getLineItems call reloads them from the server.
         */
        function clear() {
            cache = {};
        }

        function isReversible(lineItem) {
            if (lineItem.cancellationEventId) {
                return false;
            }
            if (lineItem.destination || lineItem.source) {
                return true;
            }
            return isManualAdjustment(lineItem.reason);
        }

        function isManualAdjustment(reason) {
            return !!reason
                && reason.reasonCategory === REASON_CATEGORIES.ADJUSTMENT
                && (reason.tags || []).indexOf(CANCEL_REASON_TAG) === -1;
        }

        function reversalReasonType(row) {
            if (row.$isIssue) {
                return REASON_TYPES.CREDIT;
            }
            if (row.$isReceive) {
                return REASON_TYPES.DEBIT;
            }
            if (!row.reason) {
                return undefined;
            }
            return row.reason.reasonType === REASON_TYPES.DEBIT
                ? REASON_TYPES.CREDIT
                : REASON_TYPES.DEBIT;
        }

        function decorate(lineItem, currentStockOnHandByCard) {
            const row = angular.copy(lineItem);

            const current = currentStockOnHandByCard[stockCardKey(row.orderable, row.lot)];
            row.$currentStockOnHand = angular.isNumber(current) ? current : row.stockOnHand;
            row.$isIssue = !!row.destination;
            row.$isReceive = !!row.source;
            row.$isMovement = row.$isIssue || row.$isReceive;
            row.$reversalReasonType = reversalReasonType(row);
            row.$reversalScopeTag = row.$isMovement
                ? CANCEL_SCOPE_REASON_TAGS.MOVEMENT
                : CANCEL_SCOPE_REASON_TAGS.ADJUSTMENT;
            row.$alreadyReversed = !!row.cancellationEventId;
            row.$reversible = isReversible(lineItem);
            row.$selected = false;
            row.$errors = {};

            return row;
        }
    }
})();
