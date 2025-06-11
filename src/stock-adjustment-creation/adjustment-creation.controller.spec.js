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

describe('StockAdjustmentCreationController', function() {

    var vm, q, rootScope, state, stateParams, facility, program, confirmService, VVM_STATUS, messageService, scope,
        stockAdjustmentCreationService, reasons, $controller, ADJUSTMENT_TYPE, ProgramDataBuilder, FacilityDataBuilder,
        ReasonDataBuilder, OrderableGroupDataBuilder, OrderableDataBuilder, alertService, notificationService,
        orderableGroups, LotDataBuilder, UNPACK_REASONS, LotResource;

    beforeEach(function() {

        module('referencedata-lot');
        module('openlmis-quantity-unit-toggle');
        module('stock-adjustment-creation', function($provide) {
            var stockEventRepositoryMock = jasmine.createSpyObj('stockEventRepository', ['create']);
            $provide.factory('StockEventRepository', function() {
                return function() {
                    return stockEventRepositoryMock;
                };
            });
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            q = $injector.get('$q');
            rootScope = $injector.get('$rootScope');
            stateParams = $injector.get('$stateParams');
            $controller = $injector.get('$controller');
            VVM_STATUS = $injector.get('VVM_STATUS');
            ADJUSTMENT_TYPE = $injector.get('ADJUSTMENT_TYPE');
            messageService = $injector.get('messageService');
            confirmService = $injector.get('confirmService');
            stockAdjustmentCreationService = $injector.get('stockAdjustmentCreationService');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            OrderableGroupDataBuilder = $injector.get('OrderableGroupDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            alertService = $injector.get('alertService');
            notificationService = $injector.get('notificationService');
            LotDataBuilder = $injector.get('LotDataBuilder');
            UNPACK_REASONS = $injector.get('UNPACK_REASONS');
            LotResource = $injector.get('LotResource');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.OrderableChildrenDataBuilder = $injector.get('OrderableChildrenDataBuilder');
            this.offlineService = $injector.get('offlineService');
            this.editLotModalService = $injector.get('editLotModalService');
            this.quantityUnitCalculateService = $injector.get('quantityUnitCalculateService');
            spyOn(this.editLotModalService, 'show');

            state = jasmine.createSpyObj('$state', ['go']);
            state.current = {
                name: '/a/b'
            };
            state.params = {
                page: 0
            };

            program = new ProgramDataBuilder().build();
            facility = new FacilityDataBuilder().build();

            orderableGroups = [
                new OrderableGroupDataBuilder().build()
            ];
            reasons = [new ReasonDataBuilder().build()];

            this.kitConstituents = [
                new this.OrderableChildrenDataBuilder().withId('child_product_1_id')
                    .withQuantity(30)
                    .buildJson()
            ];

            this.kitOrderable = new this.OrderableDataBuilder().withId('kit_product_id')
                .withChildren(this.kitConstituents)
                .buildJson();

            this.orderableGroup = new OrderableGroupDataBuilder()
                .withOrderable(new OrderableDataBuilder().withExtraData({
                    useVVM: 'true'
                })
                    .build())
                .build();

            scope = rootScope.$new();
            scope.productForm = jasmine.createSpyObj('productForm', ['$setUntouched', '$setPristine']);

            vm = initController(orderableGroups);
        });
    });

    describe('onInit', function() {
        it('should init page properly', function() {
            expect(stateParams.page).toEqual(0);
        });

        it('should set showVVMStatusColumn to true if any orderable use vvm', function() {

            vm = initController([this.orderableGroup]);

            expect(vm.showVVMStatusColumn).toBe(true);
        });

        it('should set showVVMStatusColumn to false if no orderable use vvm', function() {
            var orderableGroup = new OrderableGroupDataBuilder()
                .withOrderable(new OrderableDataBuilder().withExtraData({
                    useVVM: 'false'
                })
                    .build())
                .build();

            vm = initController([orderableGroup]);

            expect(vm.showVVMStatusColumn).toBe(false);
        });
    });

    describe('validate', function() {

        it('line item quantity is valid given positive integer', function() {
            var lineItem = {
                id: '1',
                quantity: 1,
                orderable: {
                    netContent: 50
                },
                $errors: {}
            };
            vm.quantityUnit = 'DOSES';
            vm.validateQuantity(lineItem);

            expect(lineItem.$errors.quantityInvalid).toBeFalsy();
        });

        it('line item quantity is invalid given 0', function() {
            var lineItem = {
                id: '1',
                quantity: 0,
                orderable: {
                    netContent: 50
                },
                $errors: {}
            };
            vm.quantityUnit = 'DOSES';
            vm.validateQuantity(lineItem);

            expect(lineItem.$errors.quantityInvalid).toEqual('stockAdjustmentCreation.positiveInteger');
        });

        it('line item quantity is invalid when is greater than stock on hand and reason type is DEBIT', function() {
            var lineItem = {
                id: '1',
                quantity: 6,
                $previewSOH: 5,
                orderable: {
                    netContent: 50
                },
                reason: {
                    reasonType: 'DEBIT'
                },
                $errors: {}
            };
            vm.quantityUnit = 'DOSES';
            vm.validateQuantity(lineItem);

            expect(lineItem.$errors.quantityInvalid).toEqual('stockAdjustmentCreation.quantityGreaterThanStockOnHand');
        });

        it('line item quantity is invalid given -1', function() {
            var lineItem = {
                id: '1',
                quantity: -1,
                orderable: {
                    netContent: 50
                },
                $errors: {}
            };
            vm.quantityUnit = 'DOSES';
            vm.validateQuantity(lineItem);

            expect(lineItem.$errors.quantityInvalid).toEqual('stockAdjustmentCreation.positiveInteger');
        });
    });

    it('should reorder all added items when quantity validation failed', function() {
        var date1 = new Date(2017, 3, 20);
        var lineItem1 = {
            reason: {
                id: '123',
                reasonType: 'DEBIT'
            },
            orderable: {
                productCode: 'C100',
                netContent: 5
            },
            occurredDate: date1,
            $errors: {}
        };

        var lineItem2 = {
            reason: {
                id: '123',
                reasonType: 'DEBIT'
            },
            orderable: {
                productCode: 'C150',
                netContent: 5
            },
            occurredDate: date1,
            $errors: {}
        };

        var date2 = new Date(2017, 3, 25);
        var lineItem3 = {
            reason: {
                id: '123',
                reasonType: 'DEBIT'
            },
            orderable: {
                productCode: 'C100',
                netContent: 5
            },
            occurredDate: date2,
            $errors: {
                quantityInvalid: 'stockAdjustmentCreation.sohCanNotBeNegative'
            }
        };

        var lineItem4 = {
            reason: {
                id: '123',
                reasonType: 'DEBIT'
            },
            orderable: {
                productCode: 'C120',
                netContent: 20
            },
            occurredDate: date2,
            $errors: {
                quantityInvalid: 'stockAdjustmentCreation.sohCanNotBeNegative'
            }
        };

        vm.addedLineItems = [lineItem1, lineItem2, lineItem3, lineItem4];

        vm.submit();

        var expectItems = [lineItem3, lineItem1, lineItem4, lineItem2];

        expect(vm.displayItems).toEqual(expectItems);
    });

    it('should remove all line items', function() {
        var lineItem1 = {
            id: '1',
            quantity: 0
        };
        var lineItem2 = {
            id: '2',
            quantity: 1
        };
        vm.addedLineItems = [lineItem1, lineItem2];
        vm.displayItems = [lineItem1];
        vm.keyword = '1';
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

    it('should remove one line item from added line items', function() {
        var lineItem1 = {
            id: '1',
            quantity: 0
        };
        var lineItem2 = {
            id: '2',
            quantity: 1
        };
        vm.addedLineItems = [lineItem1, lineItem2];

        vm.remove(lineItem1);

        expect(vm.addedLineItems).toEqual([lineItem2]);
    });

    describe('addProduct', function() {

        beforeEach(function() {
            vm.selectedOrderableGroup = new OrderableGroupDataBuilder()
                .withOrderable(new OrderableDataBuilder().withFullProductName('Implanon')
                    .build())
                .withStockOnHand(2)
                .build();
            vm.addProduct();
        });

        it('should add one line item to addedLineItem array', function() {
            var addedLineItem = vm.addedLineItems[0];

            expect(addedLineItem.stockOnHand).toEqual(2);
            expect(addedLineItem.orderable.fullProductName).toEqual('Implanon');
            expect(typeof(addedLineItem.occurredDate)).toBe('string');
        });

        it('should properly add another line item to addedLineItem array', function() {
            vm.selectedOrderableGroup = new OrderableGroupDataBuilder()
                .withOrderable(new OrderableDataBuilder().withFullProductName('Adsorbentia')
                    .build())
                .withStockOnHand(10)
                .build();
            vm.addProduct();

            var addedLineItem = vm.addedLineItems[0];

            expect(addedLineItem.stockOnHand).toEqual(10);
            expect(addedLineItem.orderable.fullProductName).toEqual('Adsorbentia');
            expect(addedLineItem.occurredDate).toEqual(vm.addedLineItems[1].occurredDate);
        });
    });

    it('should search from added line items', function() {
        var lineItem1 = {
            id: '1',
            quantity: 0
        };
        var lineItem2 = {
            id: '2',
            quantity: 1
        };
        vm.addedLineItems = [lineItem1, lineItem2];

        spyOn(stockAdjustmentCreationService, 'search');
        stockAdjustmentCreationService.search.andReturn([lineItem1]);
        var params = {
            page: 0,
            program: program,
            facility: facility,
            reasons: reasons,
            orderableGroups: orderableGroups,
            addedLineItems: [lineItem1, lineItem2],
            displayItems: [lineItem1],
            keyword: undefined
        };

        vm.search();

        expect(vm.displayItems).toEqual([lineItem1]);
        expect(state.go).toHaveBeenCalledWith('/a/b', params, {
            reload: true,
            notify: false
        });
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

    describe('submit', function() {

        beforeEach(function() {
            spyOn(alertService, 'error');
            spyOn(confirmService, 'confirm');
            spyOn(notificationService, 'success');
            spyOn(notificationService, 'offline');
            spyOn(this.offlineService, 'isOffline').andReturn(false);
            confirmService.confirm.andReturn(q.resolve());
        });

        it('should not show success message after success if offline', function() {
            this.offlineService.isOffline.andReturn(true);
            spyOn(stockAdjustmentCreationService, 'submitAdjustments');
            stockAdjustmentCreationService.submitAdjustments.andReturn(q.resolve());

            vm.submit();
            rootScope.$apply();

            expect(notificationService.success).not.toHaveBeenCalledWith('stockAdjustmentCreation.submitted');
        });

        it('should redirect with proper state params after success', function() {
            spyOn(stockAdjustmentCreationService, 'submitAdjustments');
            stockAdjustmentCreationService.submitAdjustments.andReturn(q.resolve());

            vm.submit();
            rootScope.$apply();

            expect(state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries', {
                facility: facility.id,
                program: program.id,
                active: 'ACTIVE'
            });

            expect(notificationService.success).toHaveBeenCalledWith('stockAdjustmentCreation.submitted');
            expect(alertService.error).not.toHaveBeenCalled();
        });

        it('should not redirect after error', function() {
            spyOn(stockAdjustmentCreationService, 'submitAdjustments');
            stockAdjustmentCreationService.submitAdjustments
                .andReturn(q.reject({
                    data: {
                        message: 'error occurred'
                    }
                }));

            vm.submit();
            rootScope.$apply();

            expect(state.go).toHaveBeenCalledWith(state.current.name, stateParams, {
                reload: false,
                notify: false
            });

            expect(alertService.error).toHaveBeenCalledWith('error occurred');
            expect(notificationService.success).not.toHaveBeenCalled();
        });

        it('should not submit if new lot code exists in the database', function() {
            spyOn(LotResource.prototype, 'query').andCallFake(function(response) {
                response.numberOfElements = 1;
                return q.resolve(response);
            });
            vm.submit();
            rootScope.$apply();

            expect(state.go).toHaveBeenCalledWith(state.current.name, stateParams, {
                reload: false,
                notify: false
            });

            expect(notificationService.success).not.toHaveBeenCalled();
        });

        it('should generate kit constituent if the state is unpacking', function() {
            spyOn(stockAdjustmentCreationService, 'submitAdjustments');
            stockAdjustmentCreationService.submitAdjustments.andReturn(q.resolve());

            vm = initController([this.orderableGroup], ADJUSTMENT_TYPE.KIT_UNPACK);
            vm.quantityUnit = 'DOSES';
            vm.addedLineItems = [{
                reason: {
                    id: UNPACK_REASONS.KIT_UNPACK_REASON_ID
                },
                orderable: this.kitOrderable,
                occurredDate: new Date(),
                quantity: 2,
                $errors: {}
            }];

            vm.submit();

            rootScope.$apply();

            var unpackingLineItem = stockAdjustmentCreationService.submitAdjustments
                .mostRecentCall.args[2];

            expect(unpackingLineItem.length).toEqual(2);
            expect(unpackingLineItem[1].reason.id).toEqual(UNPACK_REASONS.UNPACKED_FROM_KIT_REASON_ID);
            expect(unpackingLineItem[0].reason.id).toEqual(UNPACK_REASONS.KIT_UNPACK_REASON_ID);
            expect(unpackingLineItem[1].quantity).toEqual(60);
            expect(unpackingLineItem[0].quantity).toEqual(2);
        });

        it('should redirect with proper state params after success in offline mode', function() {
            this.offlineService.isOffline.andReturn(true);

            spyOn(stockAdjustmentCreationService, 'submitAdjustments');
            stockAdjustmentCreationService.submitAdjustments.andReturn(q.resolve());

            vm.submit();
            rootScope.$apply();

            expect(state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries', {
                facility: facility.id,
                program: program.id,
                active: 'ACTIVE'
            });

            expect(notificationService.offline).toHaveBeenCalledWith('stockAdjustmentCreation.submittedOffline');
            expect(notificationService.success).not.toHaveBeenCalled();
            expect(alertService.error).not.toHaveBeenCalled();
        });
    });

    describe('orderableSelectionChanged', function() {

        it('should unselect lot', function() {
            vm.selectedLot = new LotDataBuilder().build();

            vm.orderableSelectionChanged();

            expect(vm.selectedLot).toBe(null);
        });

        it('should clear form', function() {
            vm.selectedLot = new LotDataBuilder().build();

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
            vm.selectedLot = new LotDataBuilder()
                .withCode('orderableGroupService.addMissingLot')
                .build();
            vm.lotChanged();

            expect(vm.canAddNewLot).toBeTruthy();
        });

        it('should set canAddNewLot as false', function() {
            vm.selectedLot = new LotDataBuilder().build();
            vm.lotChanged();

            expect(vm.canAddNewLot).toBeFalsy();
        });
    });

    function initController(orderableGroups, adjustmentType) {
        return $controller('StockAdjustmentCreationController', {
            $scope: scope,
            $state: state,
            $stateParams: stateParams,
            program: program,
            facility: facility,
            adjustmentType: adjustmentType ? adjustmentType : ADJUSTMENT_TYPE.ADJUSTMENT,
            srcDstAssignments: undefined,
            user: {},
            reasons: reasons,
            orderableGroups: orderableGroups,
            displayItems: [],
            hasPermissionToAddNewLot: true,
            editLotModalService: this.editLotModalService
        });
    }

});
