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

describe("PhysicalInventoryDraftController", function() {

    var vm, $q, $rootScope, scope, state, stateParams, addProductsModalService, draftFactory,
        chooseDateModalService, facility, program, draft, lineItem, lineItem1, lineItem2, lineItem3,
        lineItem4, reasons, physicalInventoryDraftService, stockmanagementUrlFactory,
        accessTokenFactory, $window;

    beforeEach(function() {

        module('stock-physical-inventory-draft');

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            scope = $rootScope.$new();
            $window = $injector.get('$window');
            state = jasmine.createSpyObj('$state', ['go']);
            chooseDateModalService = jasmine.createSpyObj('chooseDateModalService', ['show']);
            state.current = {
                name: '/a/b'
            };
            addProductsModalService = $injector.get('addProductsModalService');
            spyOn(addProductsModalService, 'show');
            draftFactory = $injector.get('physicalInventoryDraftFactory');

            physicalInventoryDraftService = jasmine.createSpyObj('physicalInventoryDraftService', ['submitPhysicalInventory']);

            stockmanagementUrlFactory = jasmine.createSpy();
            stockmanagementUrlFactory.andCallFake(function(url) {
                return 'http://some.url' + url;
            });

            accessTokenFactory = jasmine.createSpyObj('accessTokenFactory', ['addAccessToken']);

            program = {
                name: 'HIV',
                id: '1'
            };

            facility = {
                id: "10134",
                name: "National Warehouse",
            };

            stateParams = {};

            lineItem1 = {
                quantity: 1,
                orderable: {
                    productCode: 'C100',
                    fullProductName: 'a'
                },
                stockAdjustments: [{
                    quantity: 1,
                    reason: {
                        reasonType: 'CREDIT'
                    }
                }]
            };

            lineItem2 = {
                quantity: null,
                orderable: {
                    productCode: 'C300',
                    fullProductName: 'b'
                },
                stockAdjustments: []
            };

            lineItem3 = {
                quantity: null,
                isAdded: true,
                orderable: {
                    productCode: 'C200',
                    fullProductName: 'c'
                },
                lot: {
                    lotCode: 'LC0001',
                    expirationDate: ''
                },
                stockAdjustments: []
            };

            lineItem4 = {
                quantity: null,
                orderable: {
                    productCode: 'C300',
                    fullProductName: 'b'
                },
                lot: {
                    lotCode: 'L1'
                },
                stockAdjustments: []
            };

            lineItem = {
                quantity: 20,
                stockOnHand: 10,
                stockAdjustments: [{
                    quantity: 10,
                    reason: {
                        reasonType: 'CREDIT'
                    }
                }]
            };

            draft = {
                lineItems: [
                    lineItem1, lineItem2, lineItem3, lineItem4
                ]
            };

            reasons = [{
                name: 'Reason one'
            }, {
                name: 'Reason two'
            }];

            vm = $injector.get('$controller')('PhysicalInventoryDraftController', {
                facility: facility,
                program: program,
                $state: state,
                $scope: scope,
                $stateParams: stateParams,
                displayLineItemsGroup: [
                    [lineItem1],
                    [lineItem3]
                ],
                draft: draft,
                addProductsModalService: addProductsModalService,
                chooseDateModalService: chooseDateModalService,
                reasons: reasons,
                physicalInventoryDraftService: physicalInventoryDraftService,
                stockmanagementUrlFactory: stockmanagementUrlFactory,
                accessTokenFactory: accessTokenFactory
            });
        });
    });

    it("should init displayLineItemsGroup and sort by product code properly", function() {
        expect(vm.displayLineItemsGroup).toEqual([
            [lineItem1],
            [lineItem3]
        ]);
    });

    xit("should reload with page and keyword when search", function() {
        vm.keyword = '200';
        vm.search();

        var params = {
            page: 0,
            keyword: '200',
            program: program,
            programId: '1',
            facility: facility,
            draft: draft
        };

        expect(state.go).toHaveBeenCalledWith('/a/b', params, {
            reload: '/a/b'
        })
    });

    it("should only pass items not added yet to add products modal", function() {
        var deferred = $q.defer();
        deferred.resolve();
        addProductsModalService.show.andReturn(deferred.promise);

        vm.addProducts();
        expect(addProductsModalService.show).toHaveBeenCalledWith([lineItem2, lineItem4], true);
    });

    it('should save draft', function() {
        spyOn(draftFactory, 'saveDraft');
        draftFactory.saveDraft.andReturn($q.defer().promise);
        $rootScope.$apply();

        vm.saveDraft();
        expect(draftFactory.saveDraft).toHaveBeenCalledWith(draft);
    });

    it('should highlight empty quantities before submit', function() {
        vm.submit();
        expect(lineItem1.quantityInvalid).toBeFalsy();
        expect(lineItem3.quantityInvalid).toBeTruthy();
    });

    it('should not show modal for occurred date if any quantity missing', function() {
        vm.submit();
        expect(chooseDateModalService.show).not.toHaveBeenCalled();
    });

    it('should show modal for occurred date if no quantity missing', function() {
        lineItem3.quantity = 123;
        lineItem3.stockAdjustments = [{
            quantity: 123,
            reason: {
                reasonType: 'CREDIT'
            }
        }];
        var deferred = $q.defer();
        deferred.resolve();
        chooseDateModalService.show.andReturn(deferred.promise);

        vm.submit();

        expect(chooseDateModalService.show).toHaveBeenCalled();
    });

    describe("report", function() {
        beforeEach(function() {
            lineItem3.quantity = 123;
            lineItem3.stockAdjustments = [{
                quantity: 123,
                reason: {
                    reasonType: 'CREDIT'
                }
            }];
            spyOn($window, 'open').andCallThrough();
            chooseDateModalService.show.andReturn($q.when({}));
        });

        it('should be opened when submit succeeded', function() {
            physicalInventoryDraftService.submitPhysicalInventory
                .andReturn($q.when({'physicalInventoryId': 1}));

            vm.submit();
            $rootScope.$apply();

            expect($window.open).toHaveBeenCalledWith('', '_blank');
            expect(accessTokenFactory.addAccessToken)
                .toHaveBeenCalledWith('http://some.url/api/physicalInventories/1?format=pdf');
        });

        it('should not be opened when submit failed', function() {
            physicalInventoryDraftService.submitPhysicalInventory.andReturn($q.reject());

            vm.submit();
            $rootScope.$apply();

            expect($window.open).toHaveBeenCalledWith('', '_blank');
            expect(accessTokenFactory.addAccessToken).not.toHaveBeenCalled();
        });
    });

    it('should aggregate given field values', function() {
        var lineItem1 = {
            id: "1",
            quantity: 2,
            stockOnHand: 233
        };
        var lineItem2 = {
            id: "2",
            quantity: 1,
            stockOnHand: null
        };
        var lineItems = [lineItem1, lineItem2];

        expect(vm.calculate(lineItems, 'quantity')).toEqual(3);
        expect(vm.calculate(lineItems, 'stockOnHand')).toEqual(233);
    });

    describe('validateStockAdjustments', function() {

        it('should make line item invalid if unaccounted is not 0', function() {
            lineItem.quantity = 21;
            expect(vm.validateStockAdjustments(lineItem))
                .toEqual('stockPhysicalInventoryDraft.lineItemHasUnaccountedValues');
            expect(lineItem.stockAdjustmentsInvalid).toBeTruthy();
        });

        it('should make line item valid if unaccounted is 0', function() {
            expect(vm.validateStockAdjustments(lineItem)).toBeFalsy();
            expect(lineItem.stockAdjustmentsInvalid).toBeFalsy();
        });

        it('should make line item valid after it was corrected', function() {
            lineItem.quantity = 21;
            expect(vm.validateStockAdjustments(lineItem))
                .toEqual('stockPhysicalInventoryDraft.lineItemHasUnaccountedValues');
            expect(lineItem.stockAdjustmentsInvalid).toBeTruthy();

            lineItem.quantity = 20;

            expect(vm.validateStockAdjustments(lineItem)).toBeFalsy();
            expect(lineItem.stockAdjustmentsInvalid).toBeFalsy();
        });

    });

    describe('quantityChanged', function() {

        it('should update progress', function() {
            spyOn(vm, 'updateProgress');

            vm.quantityChanged(lineItem);

            expect(vm.updateProgress).toHaveBeenCalled();
        });

        it('should validate quantity', function() {
            spyOn(vm, 'validateQuantity');

            vm.quantityChanged(lineItem);

            expect(vm.validateQuantity).toHaveBeenCalledWith(lineItem);
        });

        it('should validate stock adjustments', function() {
            spyOn(vm, 'validateStockAdjustments');

            vm.quantityChanged(lineItem);

            expect(vm.validateStockAdjustments).toHaveBeenCalledWith(lineItem);
        });

    });
});
