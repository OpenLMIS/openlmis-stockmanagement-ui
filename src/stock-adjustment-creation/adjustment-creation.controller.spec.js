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

describe("StockAdjustmentCreationController", function () {

    var vm, q, rootScope, state, stateParams, facility, program, confirmService, VVM_STATUS, messageService,
    stockAdjustmentCreationService;

    beforeEach(function () {

        module('stock-adjustment-creation');

        inject(function (_messageService_, _confirmDiscardService_, _confirmService_,
            _$stateParams_, _stockAdjustmentCreationService_, $controller, $q,
            $rootScope, _orderableLotUtilService_, _ADJUSTMENT_TYPE_, $injector) {
            q = $q;
            rootScope = $rootScope;
            state = jasmine.createSpyObj('$state', ['go']);
            state.current = {name: '/a/b'};
            state.params = {page: 0};
            stateParams = _$stateParams_;
            VVM_STATUS = $injector.get('VVM_STATUS');
            messageService = $injector.get('messageService');

            program = {name: 'HIV', id: '1'};
            facility = {id: "10134", name: "National Warehouse"};
            var stockCardSummaries = [{
                orderable: {fullProductName: "Implanon", id: "a"},
                stockOnHand: 2,
                lot: null
            }];
            var reasons = [{id: "r1", name: "clinic return"}];

            confirmService = _confirmService_;
            stockAdjustmentCreationService = _stockAdjustmentCreationService_;

            vm = $controller('StockAdjustmentCreationController', {
                $scope: rootScope.$new(),
                $state: state,
                $stateParams: stateParams,
                confirmDiscardService: _confirmDiscardService_,
                program: program,
                facility: facility,
                adjustmentType: _ADJUSTMENT_TYPE_.ADJUSTMENT,
                srcDstAssignments: undefined,
                user: {},
                stockCardSummaries: stockCardSummaries,
                reasons: reasons,
                confirmService: confirmService,
                messageService: messageService,
                stockAdjustmentCreationService: stockAdjustmentCreationService,
                orderableLotUtilService: _orderableLotUtilService_
            });
        });
    });

    it('should init page properly', function () {
        expect(stateParams.page).toEqual(0);
    });

    describe('validate', function () {

        it('line item quantity is valid given positive integer', function () {
            var lineItem = {id: "1", quantity: 1, $errors: {}};
            vm.validateQuantity(lineItem);

            expect(lineItem.$errors.quantityInvalid).toBeFalsy();
        });

        it('line item quantity is invalid given 0', function () {
            var lineItem = {id: "1", quantity: 0, $errors: {}};
            vm.validateQuantity(lineItem);

            expect(lineItem.$errors.quantityInvalid).toEqual('stockAdjustmentCreation.positiveInteger')
        });

        it('line item quantity is invalid given -1', function () {
            var lineItem = {id: "1", quantity: -1, $errors: {}};
            vm.validateQuantity(lineItem);

            expect(lineItem.$errors.quantityInvalid).toEqual('stockAdjustmentCreation.positiveInteger')
        });
    });

    it('should reorder all added items when quantity validation failed', function () {
        var date1 = new Date(2017, 3, 20);
        var lineItem1 = {
            reason: {id: "123", reasonType: "DEBIT"},
            orderable: {productCode: "C100"},
            occurredDate: date1,
            $errors: {}
        };

        var lineItem2 = {
            reason: {id: "123", reasonType: "DEBIT"},
            orderable: {productCode: "C150"},
            occurredDate: date1,
            $errors: {}
        };

        var date2 = new Date(2017, 3, 25);
        var lineItem3 = {
            reason: {id: "123", reasonType: "DEBIT"},
            orderable: {productCode: "C100"},
            occurredDate: date2,
            $errors: {quantityInvalid: 'stockAdjustmentCreation.sohCanNotBeNegative'}
        };

        var lineItem4 = {
            reason: {id: "123", reasonType: "DEBIT"},
            orderable: {productCode: "C120"},
            occurredDate: date2,
            $errors: {quantityInvalid: 'stockAdjustmentCreation.sohCanNotBeNegative'}
        };

        vm.addedLineItems = [lineItem1, lineItem2, lineItem3, lineItem4];

        vm.submit();

        var expectItems = [lineItem3, lineItem1, lineItem4, lineItem2];
        expect(vm.displayItems).toEqual(expectItems);
    });

    it('should remove all line items', function () {
        var lineItem1 = {id: "1", quantity: 0};
        var lineItem2 = {id: "2", quantity: 1};
        vm.addedLineItems = [lineItem1, lineItem2];
        vm.displayItems = [lineItem1];
        spyOn(confirmService, 'confirmDestroy');
        var deferred = q.defer();
        deferred.resolve();
        confirmService.confirmDestroy.andReturn(deferred.promise);

        vm.removeDisplayItems();
        rootScope.$apply();

        expect(confirmService.confirmDestroy).toHaveBeenCalledWith('stockAdjustmentCreation.clearAll',
        'stockAdjustmentCreation.clear');
        expect(vm.addedLineItems).toEqual([lineItem2]);
        expect(vm.displayItems).toEqual([]);
    });

    it('should remove one line item from added line items', function () {
        var lineItem1 = {id: "1", quantity: 0};
        var lineItem2 = {id: "2", quantity: 1};
        vm.addedLineItems = [lineItem1, lineItem2];

        vm.remove(lineItem1);

        expect(vm.addedLineItems).toEqual([lineItem2]);
    });

    it('should add one line item to added line items', function () {
        vm.selectedOrderableGroup = [{
            orderable: {fullProductName: 'Implanon', id: 'a', productCode: 'c1'},
            stockOnHand: 2
        }];

        vm.addProduct();

        var addedLineItem = vm.addedLineItems[0];
        expect(addedLineItem.stockOnHand).toEqual(2);
        expect(addedLineItem.orderable.fullProductName).toEqual('Implanon');
    });

    it('should search from added line items', function () {
        var lineItem1 = {id: "1", quantity: 0};
        var lineItem2 = {id: "2", quantity: 1};
        vm.addedLineItems = [lineItem1, lineItem2];

        spyOn(stockAdjustmentCreationService, 'search');
        stockAdjustmentCreationService.search.andReturn([lineItem1]);
        var params = {
            page: 0,
            program: program,
            facility: facility,
            reasons: [{id: 'r1', name: 'clinic return'}],
            stockCardSummaries: [{
                orderable: {fullProductName: 'Implanon', id: 'a'},
                stockOnHand: 2,
                lot: null
            }],
            addedLineItems: [lineItem1, lineItem2],
            displayItems: [lineItem1],
            keyword: undefined
        };

        vm.search();

        expect(vm.displayItems).toEqual([lineItem1]);
        expect(state.go).toHaveBeenCalledWith('/a/b', params, {reload: true, notify: false})
    });

    describe('getStatusDisplay', function() {
        it('should expose getStatusDisplay method', function() {
            expect(angular.isFunction(vm.getStatusDisplay)).toBe(true);
        });

        it('should call messageService', function() {
            spyOn(messageService, 'get').andReturn(true);
            vm.getStatusDisplay(VVM_STATUS.STAGE_1);
            expect(messageService.get).toHaveBeenCalled();
        });
    });
});
