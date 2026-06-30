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

describe('TransactionHistoryListController', function() {

    let vm, $controller, $state, $stateParams, stockEvents, messageService;

    beforeEach(function() {
        module('stock-transaction-history');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            $state = $injector.get('$state');
            messageService = $injector.get('messageService');
        });

        spyOn(messageService, 'get').andCallFake(function(key) {
            return key;
        });

        $stateParams = {
            type: 'issue',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            documentNumber: 'DOC'
        };
        stockEvents = [{
            id: 'event-1',
            documentNumber: '2026-06-HC01-0001',
            type: 'RECEIVE',
            processedDate: '2026-06-02T08:00:00Z'
        }];
        vm = $controller('TransactionHistoryListController', {
            $state: $state,
            $stateParams: $stateParams,
            stockEvents: stockEvents,
            messageService: messageService
        });
        vm.$onInit();
    });

    it('should expose resolved stock events and filters on init', function() {
        expect(vm.stockEvents.length).toEqual(1);
        expect(vm.stockEvents[0].id).toEqual('event-1');
        expect(vm.stockEvents[0].documentNumber).toEqual('2026-06-HC01-0001');
        expect(vm.stockEvents[0].type).toEqual('RECEIVE');
        expect(vm.type).toEqual('issue');
        expect(vm.startDate).toEqual('2026-01-01');
        expect(vm.endDate).toEqual('2026-12-31');
        expect(vm.documentNumber).toEqual('DOC');
    });

    it('should map each EventOrigin to its message key for the Type column', function() {
        expect(vm.typeLabels.ISSUE).toEqual('stockTransactionHistory.typeIssue');
        expect(vm.typeLabels.RECEIVE).toEqual('stockTransactionHistory.typeReceive');
    });

    it('should leave processedDate as the raw ISO date-time for the openlmisDate filter', function() {
        expect(vm.stockEvents[0].processedDate).toEqual('2026-06-02T08:00:00Z');
    });

    it('should expose pre-translated transaction type options', function() {
        const values = vm.transactionTypes.map(function(option) {
            return option.value;
        });

        expect(values).toEqual(['', 'issue', 'receive']);
        expect(vm.transactionTypes[0].name).toEqual('stockTransactionHistory.typeAll');
        expect(vm.transactionTypes[1].name).toEqual('stockTransactionHistory.typeIssue');
        expect(vm.transactionTypes[2].name).toEqual('stockTransactionHistory.typeReceive');
    });

    it('should navigate to the detail state on viewTransaction', function() {
        spyOn($state, 'go');

        vm.viewTransaction(stockEvents[0]);

        expect($state.go).toHaveBeenCalledWith(
            'openlmis.stockmanagement.transactionHistory.detail',
            {
                stockEventId: 'event-1'
            }
        );
    });

    it('should reload with filters and reset paging on search', function() {
        spyOn($state, 'go');
        vm.facility = {
            id: 'facility-1'
        };
        vm.program = {
            id: 'program-1'
        };
        vm.type = 'receive';
        vm.documentNumber = '0001';
        vm.startDate = '2026-02-01';
        vm.endDate = '2026-02-28';

        vm.search();

        const args = $state.go.mostRecentCall.args;

        expect(args[0]).toEqual('openlmis.stockmanagement.transactionHistory');
        expect(args[1].facility).toEqual('facility-1');
        expect(args[1].program).toEqual('program-1');
        expect(args[1].type).toEqual('receive');
        expect(args[1].documentNumber).toEqual('0001');
        expect(args[1].startDate).toEqual('2026-02-01');
        expect(args[1].endDate).toEqual('2026-02-28');
        expect(args[1].page).toEqual(0);
        expect(args[1].size).toEqual(10);
        expect(args[2]).toEqual({
            reload: true
        });
    });

    it('should pass null facility and program on search when none selected', function() {
        spyOn($state, 'go');
        vm.facility = undefined;
        vm.program = undefined;

        vm.search();

        const args = $state.go.mostRecentCall.args;

        expect(args[1].facility).toBe(null);
        expect(args[1].program).toBe(null);
    });

    it('should reload the list for the selected facility and program on loadTransactions', function() {
        spyOn($state, 'go');
        vm.facility = {
            id: 'facility-1'
        };
        vm.program = {
            id: 'program-1'
        };
        vm.isSupervised = true;

        vm.loadTransactions();

        const args = $state.go.mostRecentCall.args;

        expect(args[0]).toEqual('openlmis.stockmanagement.transactionHistory');
        expect(args[1].facility).toEqual('facility-1');
        expect(args[1].program).toEqual('program-1');
        expect(args[1].supervised).toEqual(true);
        // loadTransactions preserves the active filters (that is why it is separate from search)
        expect(args[1].type).toEqual('issue');
        expect(args[1].documentNumber).toEqual('DOC');
        expect(args[2]).toEqual({
            reload: true
        });
    });
});
