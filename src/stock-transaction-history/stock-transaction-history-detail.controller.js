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

    controller.$inject = ['lineItems', 'dateUtils'];

    function controller(lineItems, dateUtils) {
        var vm = this;

        vm.$onInit = onInit;

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryDetailController
         * @name $onInit
         *
         * @description
         * Initialization method of the TransactionHistoryDetailController. The document number is
         * read from the resolved line items rather than a state param. Lot expiry is converted to
         * a Date so openlmisDate shows the correct day.
         */
        function onInit() {
            vm.lineItems = lineItems;
            angular.forEach(vm.lineItems, function(lineItem) {
                if (lineItem.lot) {
                    lineItem.lot.expirationDate = dateUtils.toDate(lineItem.lot.expirationDate);
                }
            });
            vm.documentNumber = vm.lineItems && vm.lineItems.length
                ? vm.lineItems[0].documentNumber : undefined;
        }
    }
})();
