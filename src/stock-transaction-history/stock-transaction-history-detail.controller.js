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
     * @name stock-transaction-history.controller:TransactionHistoryDetailController
     *
     * @description
     * Controller for the transaction detail view - lists the stock card line items created by a
     * single stock event (issue/receive), with stock on hand and resolved names.
     */
    angular
        .module('stock-transaction-history')
        .controller('TransactionHistoryDetailController', controller);

    controller.$inject = [
        'stockEvent', 'lineItems', 'dateUtils', '$stateParams', '$window', 'QUANTITY_UNIT',
        'localStorageService', 'accessTokenFactory', 'stockmanagementUrlFactory',
        'quantityUnitCalculateService'
    ];

    function controller(stockEvent, lineItems, dateUtils, $stateParams, $window, QUANTITY_UNIT,
                        localStorageService, accessTokenFactory, stockmanagementUrlFactory,
                        quantityUnitCalculateService) {
        const vm = this;

        vm.$onInit = onInit;
        vm.showInDoses = showInDoses;
        vm.recalculateQuantity = recalculateQuantity;
        vm.print = print;

        /**
         * @ngdoc property
         * @propertyOf stock-transaction-history.controller:TransactionHistoryDetailController
         * @name quantityUnit
         * @type {String}
         *
         * @description
         * Currently selected quantity unit (PACKS or DOSES). Two-way bound to the
         * quantity-unit-toggle component, which is responsible for its initial value and for
         * persisting changes to local storage.
         */
        vm.quantityUnit = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-transaction-history.controller:TransactionHistoryDetailController
         * @name stockEvent
         * @type {Object}
         *
         * @description
         * The header of the stock event being viewed (type, document number, etc.), resolved from
         * GET /api/stockEvents/{id}.
         */
        vm.stockEvent = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-transaction-history.controller:TransactionHistoryDetailController
         * @name typeLabels
         * @type {Object}
         *
         * @description
         * Maps the event's EventOrigin to its message key for the header, mirroring the list view.
         */
        vm.typeLabels = {
            ISSUE: 'stockTransactionHistory.typeIssue',
            RECEIVE: 'stockTransactionHistory.typeReceive'
        };

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryDetailController
         * @name $onInit
         *
         * @description
         * Initialization method of the TransactionHistoryDetailController. The event header
         * (type, document number) is taken from the resolved stock event. Lot expiry is converted
         * to a Date so openlmisDate shows the correct day.
         */
        function onInit() {
            vm.stockEvent = stockEvent;
            vm.documentNumber = stockEvent ? stockEvent.documentNumber : undefined;
            vm.lineItems = lineItems;
            angular.forEach(vm.lineItems, function(lineItem) {
                if (lineItem.lot) {
                    lineItem.lot.expirationDate = dateUtils.toDate(lineItem.lot.expirationDate);
                }
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryDetailController
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
         * @methodOf stock-transaction-history.controller:TransactionHistoryDetailController
         * @name recalculateQuantity
         *
         * @description
         * Recalculates the given quantity (stored in doses) to the currently selected quantity
         * unit using the line item's orderable net content.
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
         * @methodOf stock-transaction-history.controller:TransactionHistoryDetailController
         * @name print
         *
         * @description
         * Opens the stock event report (PDF) for the currently viewed stock event in a new tab,
         * honoring the selected quantity unit and the user's locale.
         */
        function print() {
            var params = 'showInDoses=' + showInDoses();
            var locale = localStorageService.get('current_locale');
            if (locale) {
                params += '&lang=' + locale;
            }
            var url = stockmanagementUrlFactory(
                '/api/stockEvents/' + $stateParams.stockEventId + '/print?' + params
            );
            $window.open(accessTokenFactory.addAccessToken(url), '_blank');
        }
    }
})();
