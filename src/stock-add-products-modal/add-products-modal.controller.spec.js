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

describe('AddProductsModalController', function() {

    var vm, deferred, $q, $rootScope, $controller, OrderableDataBuilder, orderableGroupService,
        LotDataBuilder, messageService, scope, item1, item2, lot1, lot2, selectedItems, orderable;

    beforeEach(function() {
        module('stock-add-products-modal');
        module('referencedata');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
            $controller = $injector.get('$controller');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            orderableGroupService = $injector.get('orderableGroupService');
            LotDataBuilder = $injector.get('LotDataBuilder');
            messageService = $injector.get('messageService');
        });

        deferred = $q.defer();
        scope = $rootScope.$new();
        spyOn(scope, '$broadcast').andCallThrough();

        orderable = new OrderableDataBuilder()
            .withIdentifiers({
                tradeItem: 'trade-item-id-1'
            })
            .build();
        lot1 = new LotDataBuilder().build();
        lot2 = new LotDataBuilder()
            .withCode('1234')
            .build();

        item1 = {
            orderable: orderable,
            lot: lot1
        };

        item2 = {
            isAdded: true,
            orderable: orderable,
            lot: lot2
        };

        scope.productForm = jasmine.createSpyObj('productForm', ['$setUntouched', '$setPristine']);

        selectedItems = [item1, item2];

        vm = $controller('AddProductsModalController', {
            availableItems: [item1],
            hasLot: true,
            messageService: messageService,
            modalDeferred: deferred,
            orderableGroupService: orderableGroupService,
            $scope: scope,
            hasPermissionToAddNewLot: true,
            selectedItems: selectedItems
        });
        vm.$onInit();
    });

    describe('addOneProduct', function() {

        it('should NOT add if select box is empty', function() {
            //given
            //do nothing here, to simulate that select box is empty

            //when
            vm.addOneProduct();

            //then
            expect(vm.addedItems).toEqual([]);
        });

        it('should NOT add twice if selected item already added', function() {
            //given
            vm.selectedOrderableGroup = [item1];
            vm.selectedLot = item1.lot;

            vm.addedItems = [item1];
            //when
            vm.addOneProduct();

            //then
            //only appear once, not twice
            expect(vm.addedItems).toEqual([item1]);
        });

        it('should NOT add if expirationDate is invalid', function() {
            item1.lot.expirationDate = '2019-09-09';
            vm.addOneProduct();

            expect(vm.addedItems).toEqual([]);
        });

        it('should NOT add if the same lot code has already been added', function() {
            vm.selectedOrderableGroup = [item1];
            vm.selectedLot = item1.lot;
            vm.selectedLot.lotCode = '1234';
            vm.addedItems = [];

            vm.addOneProduct();

            expect(vm.addedItems).toEqual([]);
        });

        it('should add when new lot code no added yet', function() {
            vm.selectedOrderableGroup = [item1];
            vm.selectedLot = item1.lot;
            vm.selectedLot.lotCode = '2233';
            vm.addedItems = [];
            vm.addOneProduct();

            expect(vm.addedItems).toEqual([item1]);
        });

        it('should add if selected item not added yet', function() {
            //given
            vm.selectedOrderableGroup = [item1];
            vm.selectedLot = item1.lot;

            vm.addedItems = [];

            //when
            vm.addOneProduct();

            //then
            expect(vm.addedItems).toEqual([item1]);
        });

        it('should add if missing lot provided', function() {
            vm.selectedOrderableGroup = [item1];
            vm.newLot.lotCode = 'NewLot001';

            vm.addedItems = [];

            var newLot = {
                lotCode: vm.newLot.lotCode,
                expirationDate: vm.newLot.expirationDate,
                tradeItemId: vm.selectedOrderableGroup[0].orderable.identifiers.tradeItem,
                active: true
            };

            vm.addOneProduct();

            expect(vm.addedItems).toEqual([{
                orderable: vm.selectedOrderableGroup[0].orderable,
                lot: newLot,
                id: undefined,
                displayLotMessage: 'NewLot001',
                stockOnHand: 0,
                $isNewItem: true,
                active: true
            }]);
        });
    });

    describe('removeAddedProduct', function() {

        it('should remove added product and reset its quantity value', function() {
            //given
            var item = {
                quantity: 123
            };
            vm.addedItems = [item];

            //when
            vm.removeAddedProduct(item);

            //then
            expect(item.quantity).not.toBeDefined();
            expect(vm.addedItems).toEqual([]);
        });
    });

    describe('modal close', function() {

        it('should reset all item quantities and error messages when cancel', function() {
            //given
            var item1 = {
                quantity: 123,
                quantityInvalid: 'blah'
            };
            var item2 = {
                quantity: 456
            };
            vm.addedItems = [item1, item2];

            //when
            //pretend modal was closed by user
            deferred.reject();
            $rootScope.$apply();

            //then
            expect(item1.quantity).not.toBeDefined();
            expect(item1.quantityInvalid).not.toBeDefined();

            expect(item2.quantity).not.toBeDefined();
        });
    });

    describe('validate', function() {

        it('should assign error message when quantity missing', function() {
            //given
            var item1 = {
                quantity: undefined
            };

            //when
            vm.validate(item1);

            //then
            expect(item1.quantityInvalid).toBeDefined();
        });

        it('should remove error message when quantity filled in', function() {
            //given
            var item1 = {
                quantityInvalid: 'blah'
            };

            //when
            item1.quantity = 123;
            vm.validate(item1);

            //then
            expect(item1.quantityInvalid).not.toBeDefined();
        });
    });

    describe('confirm', function() {

        it('should broadcast form submit when confirming', function() {
            vm.confirm();

            expect(scope.$broadcast).toHaveBeenCalledWith('openlmis-form-submit');
        });

        it('should confirm add products if all items have quantities', function() {
            //given
            var item1 = {
                quantity: 1
            };
            var item2 = {
                quantity: 2
            };
            vm.addedItems = [item1, item2];

            spyOn(deferred, 'resolve');

            //when
            vm.confirm();

            //then
            expect(deferred.resolve).toHaveBeenCalled();
        });

        it('should NOT confirm add products if some items have no quantity', function() {
            //given
            var item1 = {
                quantity: 1
            };
            var item2 = {
                quantity: undefined
            };
            vm.addedItems = [item1, item2];

            spyOn(deferred, 'resolve');

            //when
            vm.confirm();

            //then
            expect(deferred.resolve).not.toHaveBeenCalled();
        });
    });

    describe('orderableSelectionChanged', function() {

        it('should unselect lot', function() {
            vm.selectedLot = vm.availableItems[0].lot;

            vm.orderableSelectionChanged();

            expect(vm.selectedLot).toBe(null);
        });

        it('should clear new lot code', function() {
            vm.newLot.lotCode = 'NewLot001';
            vm.orderableSelectionChanged();

            expect(vm.newLot.lotCode).not.toBeDefined(null);
        });

        it('should clear new lot expiration date', function() {
            vm.newLot.expirationDate = '2019-08-06';
            vm.orderableSelectionChanged();

            expect(vm.newLot.expirationDate).not.toBeDefined();
        });

        it('should set canAddNewLot as false', function() {
            vm.canAddNewLot = true;
            vm.orderableSelectionChanged();

            expect(vm.canAddNewLot).toBeFalsy();
        });

        it('should clear form', function() {
            vm.selectedLot = vm.availableItems[0].lot;

            vm.orderableSelectionChanged();

            expect(scope.productForm.$setPristine).toHaveBeenCalled();
            expect(scope.productForm.$setUntouched).toHaveBeenCalled();
        });
    });

    describe('lotChanged', function() {

        it('should clear new lot code', function() {
            vm.newLot.lotCode = 'NewLot001';
            vm.lotChanged();

            expect(vm.newLot.lotCode).not.toBeDefined();
        });

        it('should clear new lot expiration date', function() {
            vm.newLot.expirationDate = '2019-08-06';
            vm.lotChanged();

            expect(vm.newLot.expirationDate).not.toBeDefined();
        });

        it('should set canAddNewLot as true', function() {
            vm.selectedLot = vm.availableItems[0].lot;
            vm.selectedLot.lotCode = 'orderableGroupService.addMissingLot';
            vm.lotChanged();

            expect(vm.canAddNewLot).toBeTruthy();
        });

        it('should set canAddNewLot as false', function() {
            vm.selectedLot = vm.availableItems[0].lot;
            vm.lotChanged();

            expect(vm.canAddNewLot).toBeFalsy();
        });
    });
});