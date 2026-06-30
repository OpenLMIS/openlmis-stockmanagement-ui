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
     * @name stock-transaction-history.controller:TransactionHistoryListController
     *
     * @description
     * Controller for the transaction history list view. Lets the user pick facility/program,
     * filter the issue/receive stock events and open a transaction's detail.
     */
    angular
        .module('stock-transaction-history')
        .controller('TransactionHistoryListController', controller);

    controller.$inject = ['$state', '$stateParams', 'stockEvents', 'messageService'];

    function controller($state, $stateParams, stockEvents, messageService) {
        const vm = this;

        vm.$onInit = onInit;
        vm.loadTransactions = loadTransactions;
        vm.search = search;
        vm.viewTransaction = viewTransaction;

        /**
         * @ngdoc property
         * @propertyOf stock-transaction-history.controller:TransactionHistoryListController
         * @name transactionTypes
         * @type {Array}
         *
         * @description
         * Pre-translated options for the type filter select. Labels are resolved here, not in the
         * <option> tags, because select2 would otherwise display the raw expression.
         */
        vm.transactionTypes = [
            {
                value: '',
                name: messageService.get('stockTransactionHistory.typeAll')
            },
            {
                value: 'issue',
                name: messageService.get('stockTransactionHistory.typeIssue')
            },
            {
                value: 'receive',
                name: messageService.get('stockTransactionHistory.typeReceive')
            }
        ];

        /**
         * @ngdoc property
         * @propertyOf stock-transaction-history.controller:TransactionHistoryListController
         * @name typeLabels
         * @type {Object}
         *
         * @description
         * Maps a row's EventOrigin to its message key for the Type column; an unknown origin
         * renders blank.
         */
        vm.typeLabels = {
            ISSUE: 'stockTransactionHistory.typeIssue',
            RECEIVE: 'stockTransactionHistory.typeReceive'
        };

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryListController
         * @name $onInit
         *
         * @description
         * Initialization method of the TransactionHistoryListController.
         */
        function onInit() {
            vm.stockEvents = stockEvents;
            vm.type = $stateParams.type || '';
            vm.startDate = $stateParams.startDate;
            vm.endDate = $stateParams.endDate;
            vm.documentNumber = $stateParams.documentNumber;
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryListController
         * @name loadTransactions
         *
         * @description
         * Reloads the list for the selected facility and program.
         */
        function loadTransactions() {
            const stateParams = angular.copy($stateParams);
            stateParams.facility = vm.facility ? vm.facility.id : null;
            stateParams.program = vm.program ? vm.program.id : null;
            stateParams.supervised = vm.isSupervised;
            $state.go('openlmis.stockmanagement.transactionHistory', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryListController
         * @name search
         *
         * @description
         * Applies the type/date/document-number filters and reloads from the first page.
         */
        function search() {
            const stateParams = angular.copy($stateParams);
            stateParams.facility = vm.facility ? vm.facility.id : null;
            stateParams.program = vm.program ? vm.program.id : null;
            stateParams.supervised = vm.isSupervised;
            stateParams.type = vm.type;
            stateParams.startDate = vm.startDate;
            stateParams.endDate = vm.endDate;
            stateParams.documentNumber = vm.documentNumber;
            stateParams.page = 0;
            stateParams.size = 10;
            $state.go('openlmis.stockmanagement.transactionHistory', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:TransactionHistoryListController
         * @name viewTransaction
         *
         * @description
         * Opens the detail view for the given stock event.
         *
         * @param {Object} stockEvent the stock event history row
         */
        function viewTransaction(stockEvent) {
            $state.go('openlmis.stockmanagement.transactionHistory.detail', {
                stockEventId: stockEvent.id
            });
        }
    }
})();
