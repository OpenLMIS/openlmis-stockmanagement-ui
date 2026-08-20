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
     * @ngdoc controller
     * @name stock-transaction-history.controller:TransactionHistoryReverseController
     *
     * @description
     * Controller for the reverse view - lets the user pick the line items of an issue/receive
     * transaction to cancel, choose a cancellation reason for each of them and submit the
     * cancellation.
     */
    angular
        .module('stock-transaction-history')
        .controller('TransactionHistoryReverseController', controller);

    controller.$inject = [
        '$state', '$stateParams', 'stockEvent', 'reverseLineItems', 'reasons', 'REASON_TYPES',
        'REASON_CATEGORIES', 'CANCEL_REASON_TAG', 'STOCK_ADJUSTMENT_FREE_TEXT_MAX_LENGTH',
        'QUANTITY_UNIT', 'quantityUnitCalculateService', 'TransactionHistoryResource',
        'transactionHistoryReverseFactory', 'reverseSummaryModalService', 'signatureModalService',
        'alertService', 'loadingModalService', 'notificationService'
    ];

    function controller($state, $stateParams, stockEvent, reverseLineItems, reasons, REASON_TYPES,
                        REASON_CATEGORIES, CANCEL_REASON_TAG,
                        STOCK_ADJUSTMENT_FREE_TEXT_MAX_LENGTH, QUANTITY_UNIT,
                        quantityUnitCalculateService, TransactionHistoryResource,
                        transactionHistoryReverseFactory, reverseSummaryModalService,
                        signatureModalService, alertService, loadingModalService,
                        notificationService) {
        const vm = this;

        vm.$onInit = onInit;
        vm.showInDoses = showInDoses;
        vm.recalculateQuantity = recalculateQuantity;
        vm.reasonsFor = reasonsFor;
        vm.getNewStockOnHand = getNewStockOnHand;
        vm.selectionChanged = selectionChanged;
        vm.reasonChanged = reasonChanged;
        vm.getSelected = getSelected;
        vm.submit = submit;
        vm.goToDetail = goToDetail;

        /**
         * @ngdoc property
         * @propertyOf stock-transaction-history.controller:TransactionHistoryReverseController
         * @name quantityUnit
         * @type {String}
         *
         * @description
         * Currently selected quantity unit (PACKS or DOSES). Two-way bound to the
         * quantity-unit-toggle component, mirroring the transaction detail view.
         */
        vm.quantityUnit = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-transaction-history.controller:TransactionHistoryReverseController
         * @name typeLabels
         * @type {Object}
         *
         * @description
         * Maps the event's EventOrigin to its message key for the header, mirroring the detail view.
         */
        vm.typeLabels = {
            ISSUE: 'stockTransactionHistory.typeIssue',
            RECEIVE: 'stockTransactionHistory.typeReceive',
            ADJUSTMENT: 'stockTransactionHistory.typeAdjustment'
        };

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryReverseController
         * @name $onInit
         *
         * @description
         * Initialization method of the TransactionHistoryReverseController. Splits the cancel
         * reasons by type once, so the per row dropdowns do not have to filter on every digest.
         */
        function onInit() {
            vm.stockEventId = $stateParams.stockEventId;
            vm.stockEvent = stockEvent;
            vm.documentNumber = stockEvent ? stockEvent.documentNumber : undefined;
            vm.lineItems = reverseLineItems;
            vm.freeTextMaxLength = STOCK_ADJUSTMENT_FREE_TEXT_MAX_LENGTH;

            const cancelReasons = (reasons || []).filter(isCancelReason);

            vm.reasonsByType = {};
            vm.reasonsByType[REASON_TYPES.CREDIT] = cancelReasons.filter(function(reason) {
                return reason.reasonType === REASON_TYPES.CREDIT;
            });
            vm.reasonsByType[REASON_TYPES.DEBIT] = cancelReasons.filter(function(reason) {
                return reason.reasonType === REASON_TYPES.DEBIT;
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryReverseController
         * @name showInDoses
         *
         * @description
         * Returns whether quantities should currently be displayed in doses.
         *
         * @return {boolean} true if the selected quantity unit is doses
         */
        function showInDoses() {
            return vm.quantityUnit === QUANTITY_UNIT.DOSES;
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryReverseController
         * @name recalculateQuantity
         *
         * @description
         * Recalculates the given quantity (stored in doses) to the currently selected quantity
         * unit, so the reverse view reads the same way as the transaction detail view.
         *
         * @param  {number} quantity the quantity in doses
         * @param  {Object} lineItem the line item the quantity belongs to
         * @return {String}          the quantity in the selected unit (doses or packs)
         */
        function recalculateQuantity(quantity, lineItem) {
            return quantityUnitCalculateService.recalculateSOHQuantity(
                quantity,
                lineItem.orderable ? lineItem.orderable.netContent : undefined,
                showInDoses()
            );
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryReverseController
         * @name reasonsFor
         *
         * @description
         * Returns the cancel reasons offered for the given line item - only those whose type
         * counters the original movement.
         *
         * @param  {Object} lineItem the line item
         * @return {Array}           the reasons to offer
         */
        function reasonsFor(lineItem) {
            return vm.reasonsByType[lineItem.$reversalReasonType] || [];
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryReverseController
         * @name getNewStockOnHand
         *
         * @description
         * Returns the stock on hand the line item would be left with once cancelled, in doses.
         * Cancelling an issue credits the stock back, cancelling a receive debits it away again.
         * Selected rows sharing a stock card are applied in order, so each reads as a running
         * balance rather than every row being projected from the same base.
         *
         * @param  {Object} lineItem the line item
         * @return {Number}          the calculated stock on hand
         */
        function getNewStockOnHand(lineItem) {
            let balance = lineItem.$currentStockOnHand;

            if (balance === undefined || balance === null) {
                return undefined;
            }

            const stockCard = stockCardKeyOf(lineItem);

            for (let i = 0; i < vm.lineItems.length && vm.lineItems[i] !== lineItem; i++) {
                const earlier = vm.lineItems[i];

                if (earlier.$selected && stockCardKeyOf(earlier) === stockCard) {
                    balance = applyCancellation(earlier, balance);
                }
            }

            return applyCancellation(lineItem, balance);
        }

        function applyCancellation(lineItem, balance) {
            return lineItem.$isIssue ? balance + lineItem.quantity : balance - lineItem.quantity;
        }

        function stockCardKeyOf(lineItem) {
            return (lineItem.orderable ? lineItem.orderable.id : '')
                + '/' + (lineItem.lot ? lineItem.lot.id : '');
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryReverseController
         * @name selectionChanged
         *
         * @description
         * Clears the reason and any error of a line item that has just been unticked, so an
         * abandoned row never takes part in the validation or the request.
         *
         * @param {Object} lineItem the line item that was ticked or unticked
         */
        function selectionChanged(lineItem) {
            if (!lineItem.$selected) {
                lineItem.$reason = undefined;
                lineItem.$reasonFreeText = undefined;
                lineItem.$errors = {};
                lineItem.$lineError = undefined;
            }
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryReverseController
         * @name reasonChanged
         *
         * @description
         * Clears the missing reason error and drops free text that the newly chosen reason does not
         * allow.
         *
         * @param {Object} lineItem the line item whose reason changed
         */
        function reasonChanged(lineItem) {
            lineItem.$errors.reasonInvalid = false;
            lineItem.$lineError = undefined;
            if (!lineItem.$reason || !lineItem.$reason.isFreeTextAllowed) {
                lineItem.$reasonFreeText = undefined;
            }
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryReverseController
         * @name getSelected
         *
         * @description
         * Returns the line items ticked for cancellation.
         *
         * @return {Array} the selected line items
         */
        function getSelected() {
            return vm.lineItems.filter(function(lineItem) {
                return lineItem.$selected;
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryReverseController
         * @name submit
         *
         * @description
         * Validates the selection, collects the signature and sends the cancellation. Line items
         * the server refuses are flagged in place; on success the summary is shown and the user is
         * taken back to the transaction detail.
         *
         * @return {Promise} the promise resolved once the cancellation went through
         */
        function submit() {
            const selected = getSelected();

            if (!validate(selected)) {
                return undefined;
            }

            selected.forEach(function(lineItem) {
                lineItem.$newStockOnHand = getNewStockOnHand(lineItem);
            });

            return reverseSummaryModalService.confirm(selected, showInDoses())
                .then(collectSignatureAndSend.bind(null, selected))
                .catch(function() {
                    return undefined;
                });
        }

        function collectSignatureAndSend(selected) {
            return signatureModalService.show().then(function(resolvedData) {
                loadingModalService.open();

                return new TransactionHistoryResource()
                    .cancel(vm.stockEventId, {
                        signature: resolvedData ? resolvedData.signature : null,
                        lineItems: selected.map(toRequestLineItem)
                    })
                    .then(showSummaryAndLeave, function(response) {
                        flagLineErrors(response);
                        loadingModalService.close();
                        alertService.error(errorMessageOf(response));
                        return undefined;
                    });
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryReverseController
         * @name goToDetail
         *
         * @description
         * Leaves the reverse view without cancelling anything, discarding the selection.
         */
        function goToDetail() {
            transactionHistoryReverseFactory.clear();
            $state.go('openlmis.stockmanagement.transactionHistory.detail', {
                stockEventId: vm.stockEventId
            });
        }

        function validate(selected) {
            vm.lineItems.forEach(function(lineItem) {
                lineItem.$errors = {};
                lineItem.$lineError = undefined;
            });

            if (!selected.length) {
                alertService.error('stockTransactionHistoryReverse.noLinesSelected');
                return false;
            }

            selected.forEach(function(lineItem) {
                if (!lineItem.$reason) {
                    lineItem.$errors.reasonInvalid = true;
                }
                if (getNewStockOnHand(lineItem) < 0) {
                    lineItem.$errors.stockOnHandInvalid = true;
                }
            });

            const missingReason = selected.some(function(lineItem) {
                return lineItem.$errors.reasonInvalid;
            });
            if (missingReason) {
                alertService.error('stockTransactionHistoryReverse.reasonRequired');
                return false;
            }

            const negativeStockOnHand = selected.some(function(lineItem) {
                return lineItem.$errors.stockOnHandInvalid;
            });
            if (negativeStockOnHand) {
                alertService.error('stockTransactionHistoryReverse.negativeStockOnHand');
                return false;
            }

            return true;
        }

        function toRequestLineItem(lineItem) {
            return {
                stockEventLineItemId: lineItem.stockEventLineItemId,
                reasonId: lineItem.$reason.id,
                reasonFreeText: lineItem.$reasonFreeText
            };
        }

        function showSummaryAndLeave(cancellationEventId) {
            return new TransactionHistoryResource()
                .getLineItems(cancellationEventId, {
                    page: 0,
                    size: vm.lineItems.length
                })
                .catch(function() {
                    return undefined;
                })
                .then(function(page) {
                    loadingModalService.close();
                    return reverseSummaryModalService
                        .show(page ? page.content : [], showInDoses())
                        .catch(function() {
                            return undefined;
                        });
                })
                .then(function() {
                    transactionHistoryReverseFactory.clear();
                    notificationService.success('stockTransactionHistoryReverse.cancelled');
                    $state.go('openlmis.stockmanagement.transactionHistory.detail', {
                        stockEventId: vm.stockEventId
                    }, {
                        reload: true
                    });
                });
        }

        function flagLineErrors(response) {
            const lineErrors = response && response.data ? response.data.lineErrors : undefined;

            if (!lineErrors) {
                return;
            }

            const errorsByLineId = {};
            lineErrors.forEach(function(lineError) {
                errorsByLineId[lineError.stockEventLineItemId] = lineError;
            });

            vm.lineItems.forEach(function(lineItem) {
                lineItem.$lineError = errorsByLineId[lineItem.stockEventLineItemId];
            });
        }

        function errorMessageOf(response) {
            const data = response ? response.data : undefined;

            if (data && data.lineErrors && data.lineErrors.length) {
                return 'stockTransactionHistoryReverse.lineErrors';
            }
            if (data && data.message) {
                return data.message;
            }
            return 'stockTransactionHistoryReverse.cancelFailed';
        }

        function isCancelReason(reason) {
            return reason.reasonCategory === REASON_CATEGORIES.ADJUSTMENT
                && (reason.tags || []).indexOf(CANCEL_REASON_TAG) !== -1;
        }
    }
})();
