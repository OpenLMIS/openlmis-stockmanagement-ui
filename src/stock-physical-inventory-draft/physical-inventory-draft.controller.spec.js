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

describe('PhysicalInventoryDraftController', function() {

    var chooseDateModalService;

    beforeEach(function() {

        module('stock-physical-inventory-draft', function($provide) {
            chooseDateModalService = jasmine.createSpyObj('chooseDateModalService', ['show']);

            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });
        module('admin-lot-edit');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.scope = this.$rootScope.$new();
            this.$window = $injector.get('$window');
            this.PhysicalInventoryDataBuilder = $injector.get('PhysicalInventoryDataBuilder');
            this.PhysicalInventoryLineItemDataBuilder = $injector.get('PhysicalInventoryLineItemDataBuilder');
            this.PhysicalInventoryLineItemAdjustmentDataBuilder = $injector
                .get('PhysicalInventoryLineItemAdjustmentDataBuilder');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.LotDataBuilder = $injector.get('LotDataBuilder');
            this.$state = $injector.get('$state');
            this.stockmanagementUrlFactory = $injector.get('stockmanagementUrlFactory');
            this.draftFactory = $injector.get('physicalInventoryFactory');
            this.addProductsModalService = $injector.get('addProductsModalService');
            this.accessTokenFactory = $injector.get('accessTokenFactory');
            this.physicalInventoryService = $injector.get('physicalInventoryService');
            this.confirmService = $injector.get('confirmService');
            this.physicalInventoryDraftCacheService = $injector.get('physicalInventoryDraftCacheService');
            this.alertService = $injector.get('alertService');
            this.stockCardService = $injector.get('stockCardService');
            this.loadingModalService = $injector.get('loadingModalService');
            this.LotResource = $injector.get('LotResource');
            this.editLotModalService = $injector.get('editLotModalService');
            this.quantityUnitCalculateService = $injector.get('quantityUnitCalculateService');
            this.QUANTITY_UNIT = $injector.get('QUANTITY_UNIT');
        });

        spyOn(this.physicalInventoryService, 'submitPhysicalInventory');
        spyOn(this.physicalInventoryService, 'deleteDraft');
        spyOn(this.confirmService, 'confirm');
        spyOn(this.confirmService, 'confirmDestroy');
        spyOn(this.addProductsModalService, 'show');
        spyOn(this.$state, 'go');
        spyOn(this.draftFactory, 'saveDraft');
        spyOn(this.physicalInventoryDraftCacheService, 'cacheDraft');
        spyOn(this.alertService, 'error');
        spyOn(this.stockCardService, 'deactivateStockCard');
        spyOn(this.editLotModalService, 'show');

        this.program = new this.ProgramDataBuilder()
            .withId('1')
            .withName('HIV')
            .build();

        this.facility = new this.FacilityDataBuilder()
            .withId('10134')
            .withName('National Warehouse')
            .buildJson();

        this.lineItem1 = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(1)
            .withActive(true)
            .withOrderable(new this.OrderableDataBuilder()
                .withProductCode('C100')
                .withFullProductName('a')
                .build())
            .withStockAdjustments([
                new this.PhysicalInventoryLineItemAdjustmentDataBuilder()
                    .withQuantity(1)
                    .build()
            ])
            .build();

        this.lineItem2 = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(null)
            .withActive(true)
            .withOrderable(new this.OrderableDataBuilder()
                .withProductCode('C300')
                .withFullProductName('b')
                .build())
            .build();

        this.lineItem3 = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(null)
            .withOrderable(new this.OrderableDataBuilder()
                .withProductCode('C200')
                .withFullProductName('b')
                .build())
            .withLot(new this.LotDataBuilder()
                .build())
            .withActive(true)
            .buildAsAdded();

        this.lineItem4 = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(null)
            .withOrderable(new this.OrderableDataBuilder()
                .withProductCode('C300')
                .withFullProductName('b')
                .build())
            .withLot(new this.LotDataBuilder()
                .build())
            .build();

        this.lineItem = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(20)
            .withStockOnHand(10)
            .withStockAdjustments([
                new this.PhysicalInventoryLineItemAdjustmentDataBuilder()
                    .withQuantity(10)
                    .build()
            ])
            .build();

        this.draft = new this.PhysicalInventoryDataBuilder()
            .withProgramId(this.program.id)
            .withFacilityId(this.facility.id)
            .withLineItems([
                this.lineItem1,
                this.lineItem2,
                this.lineItem3,
                this.lineItem4
            ])
            .build();

        this.reasons = [
            new this.ReasonDataBuilder().buildCreditReason(),
            new this.ReasonDataBuilder().buildDebitReason()
        ];

        this.stateParams = {
            id: this.draft.id
        };

        this.quantityUnit = undefined;

        this.vm = this.$controller('PhysicalInventoryDraftController', {
            facility: this.facility,
            program: this.program,
            state: this.$state,
            $scope: this.scope,
            $stateParams: this.stateParams,
            displayLineItemsGroup: [
                [this.lineItem1],
                [this.lineItem3]
            ],
            draft: this.draft,
            addProductsModalService: this.addProductsModalService,
            editLotModalService: this.editLotModalService,
            chooseDateModalService: chooseDateModalService,
            reasons: this.reasons,
            physicalInventoryService: this.physicalInventoryService,
            stockmanagementUrlFactory: this.stockmanagementUrlFactory,
            accessTokenFactory: this.accessTokenFactory,
            confirmService: this.confirmService,
            stockCardService: this.stockCardService,
            LotResource: this.LotResource
        });

        this.vm.$onInit();
        this.vm.quantityUnit = this.QUANTITY_UNIT.DOSES;
    });

    describe('onInit', function() {
        it('should init displayLineItemsGroup and sort by product code properly', function() {
            expect(this.vm.displayLineItemsGroup).toEqual([
                [this.lineItem1],
                [this.lineItem3]
            ]);
        });

        it('should set showVVMStatusColumn to true if any orderable use vvm', function() {
            this.draft.lineItems[0].orderable.extraData = {
                useVVM: 'true'
            };

            this.vm.$onInit();

            expect(this.vm.showVVMStatusColumn).toBe(true);
        });

        it('should set showVVMStatusColumn to false if no orderable use vvm', function() {
            this.draft.lineItems.forEach(function(card) {
                card.orderable.extraData = {
                    useVVM: 'false'
                };
            });

            this.vm.$onInit();

            expect(this.vm.showVVMStatusColumn).toBe(false);
        });

        it('should watch paged list to group items', function() {
            this.vm.pagedLineItems = [[this.lineItem1]];
            this.vm.program.id = this.lineItem1.orderable.programs[0].programId;
            this.$rootScope.$apply();

            expect(this.vm.groupedCategories[this.lineItem1.orderable.programs[0].orderableCategoryDisplayName])
                .toEqual([[this.lineItem1]]);
        });

        it('should cache draft', function() {
            this.vm.$onInit();

            expect(this.physicalInventoryDraftCacheService.cacheDraft).toHaveBeenCalledWith(this.draft);
        });
    });

    it('should reload with page and keyword when search', function() {
        this.vm.keyword = '200';
        this.vm.search();

        var params = {
            page: 0,
            keyword: '200',
            id: this.draft.id,
            noReload: true,
            program: this.program,
            facility: this.facility
        };

        expect(this.$state.go).toHaveBeenCalledWith('', params, {
            reload: ''
        });
    });

    it('should only pass items not added yet to add products modal', function() {
        var deferred = this.$q.defer();
        deferred.resolve();
        this.addProductsModalService.show.andReturn(deferred.promise);

        this.vm.addProducts();

        expect(this.addProductsModalService.show).toHaveBeenCalledWith([
            this.lineItem2,
            this.lineItem4,
            asd(this.lineItem1.orderable),
            asd(this.lineItem3.orderable)
        ], this.draft, true);
    });

    function asd(orderable) {
        return {
            lot: null,
            orderable: orderable,
            quantity: null,
            stockAdjustments: [],
            stockOnHand: null,
            vvmStatus: null,
            $allLotsAdded: true
        };
    }

    describe('saveDraft', function() {

        it('should open confirmation modal', function() {
            this.confirmService.confirmDestroy.andReturn(this.$q.resolve());
            this.draftFactory.saveDraft.andReturn(this.$q.defer().promise);

            this.vm.saveDraft();
            this.$rootScope.$apply();

            expect(this.confirmService.confirmDestroy).toHaveBeenCalledWith(
                'stockPhysicalInventoryDraft.saveDraft',
                'stockPhysicalInventoryDraft.save'
            );
        });

        it('should save draft', function() {
            this.confirmService.confirmDestroy.andReturn(this.$q.resolve());
            this.draftFactory.saveDraft.andReturn(this.$q.defer().promise);
            this.draftFactory.saveDraft.andReturn(this.$q.resolve());
            spyOn(this.LotResource.prototype, 'create');

            this.vm.saveDraft();
            this.$rootScope.$apply();

            expect(this.draftFactory.saveDraft).toHaveBeenCalledWith(this.draft);
        });

        it('should cache draft', function() {
            this.confirmService.confirmDestroy.andReturn(this.$q.resolve());
            this.draftFactory.saveDraft.andReturn(this.$q.resolve());

            this.$rootScope.$apply();

            this.vm.saveDraft();

            expect(this.physicalInventoryDraftCacheService.cacheDraft).toHaveBeenCalledWith(this.draft);
        });
    });

    describe('submit', function() {

        it('should highlight empty quantities before submit', function() {
            this.lineItem1.active = true;
            this.lineItem3.active = true;
            this.vm.submit();

            expect(this.lineItem1.quantityInvalid).toBeFalsy();
            expect(this.lineItem3.quantityInvalid).toBeTruthy();
        });

        it('should not show modal for occurred date if any quantity missing', function() {
            this.lineItem1.active = true;
            this.lineItem3.active = true;
            this.vm.submit();

            expect(chooseDateModalService.show).not.toHaveBeenCalled();
        });

        it('should show modal for occurred date if no quantity missing', function() {
            this.lineItem1.active = true;
            this.lineItem3.active = true;
            this.lineItem3.quantity = 1234;
            this.lineItem3.quantity = 123;
            this.lineItem1.stockAdjustments = [{
                quantity: 1234,
                reason: {
                    reasonType: 'CREDIT'
                }
            }];
            this.lineItem3.stockAdjustments = [{
                quantity: 123,
                reason: {
                    reasonType: 'CREDIT'
                }
            }];
            this.lineItem1.unaccountedQuantity = 0;
            this.lineItem3.unaccountedQuantity = 0;
            var deferred = this.$q.defer();
            deferred.resolve();
            chooseDateModalService.show.andReturn(deferred.promise);

            this.vm.submit();

            expect(chooseDateModalService.show).toHaveBeenCalled();
        });

    });

    describe('hideLineItem', function() {

        it('should hide item', function() {
            this.draft.lineItems[0] = {
                displayLotMessage: 'product',
                orderable: {
                    fullProductName: 'product'
                }
            };

            this.confirmDeferred = this.$q.defer();
            this.deactivateStockCardDeferred = this.$q.defer();

            this.confirmService.confirm.andReturn(this.confirmDeferred.promise);
            this.stockCardService.deactivateStockCard.andReturn(this.deactivateStockCardDeferred.promise);

            this.vm.hideLineItem(this.draft.lineItems[0]);

            this.confirmDeferred.resolve();
            this.deactivateStockCardDeferred.resolve();

            this.$rootScope.$apply();

            expect(this.physicalInventoryDraftCacheService.cacheDraft).toHaveBeenCalledWith(this.draft);
        });
    });

    describe('when submit pass validations', function() {
        beforeEach(function() {
            this.lineItem1.active = true;
            this.lineItem3.active = true;
            this.lineItem3.quantity = 1234;
            this.lineItem3.quantity = 123;
            this.lineItem1.stockAdjustments = [{
                quantity: 1234,
                reason: {
                    reasonType: 'CREDIT'
                }
            }];
            this.lineItem3.stockAdjustments = [{
                quantity: 123,
                reason: {
                    reasonType: 'CREDIT'
                }
            }];
            this.lineItem1.unaccountedQuantity = 0;
            this.lineItem3.unaccountedQuantity = 0;
            spyOn(this.$window, 'open').andCallThrough();
            chooseDateModalService.show.andReturn(this.$q.when({}));
            spyOn(this.accessTokenFactory, 'addAccessToken').andCallThrough();
        });

        it('and choose "print" should open report and change state', function() {
            this.physicalInventoryService.submitPhysicalInventory
                .andReturn(this.$q.when());
            this.confirmService.confirm.andReturn(this.$q.when());

            spyOn(this.vm, 'showInDoses').andReturn(true);

            this.draft.id = 1;
            this.vm.submit();
            this.$rootScope.$apply();

            expect(this.$window.open).toHaveBeenCalledWith(
                '/openlmisServer/api/physicalInventories/1?format=pdf&showInDoses=true',
                '_blank'
            );

            expect(this.accessTokenFactory.addAccessToken).toHaveBeenCalled();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries',
                {
                    program: this.program.id,
                    facility: this.facility.id,
                    includeInactive: false
                });
        });

        it('and choose "no" should change this.$state and not open report', function() {
            this.physicalInventoryService.submitPhysicalInventory
                .andReturn(this.$q.when());
            this.confirmService.confirm.andReturn(this.$q.reject());

            this.draft.id = 1;
            this.vm.submit();
            this.$rootScope.$apply();

            expect(this.$window.open).not.toHaveBeenCalled();
            expect(this.accessTokenFactory.addAccessToken).not.toHaveBeenCalled();
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries',
                {
                    program: this.program.id,
                    facility: this.facility.id,
                    includeInactive: false
                });
        });

        it('and service call failed should not open report and not change state', function() {
            this.physicalInventoryService.submitPhysicalInventory.andReturn(this.$q.reject());

            this.vm.submit();
            this.$rootScope.$apply();

            expect(this.$window.open).not.toHaveBeenCalled();
            expect(this.accessTokenFactory.addAccessToken).not.toHaveBeenCalled();
            expect(this.$state.go).not.toHaveBeenCalled();
        });

        it('should return proper error message and remove from local storage', function() {
            spyOn(this.physicalInventoryDraftCacheService, 'removeById');

            this.physicalInventoryService.submitPhysicalInventory.andReturn(this.$q.reject({
                data: {
                    message: 'error occurred'
                }
            }));

            this.vm.submit();
            this.$rootScope.$apply();

            expect(this.alertService.error).toHaveBeenCalledWith('error occurred');
            expect(this.physicalInventoryDraftCacheService.removeById).toHaveBeenCalledWith(this.draft.id);
        });
    });

    it('should aggregate given field values', function() {
        var orderable = {
            netContent: 88
        };
        var lineItem1 = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(2)
            .withStockOnHand(233)
            .withOrderable(orderable)
            .build();

        var lineItem2 = new this.PhysicalInventoryLineItemDataBuilder()
            .withQuantity(1)
            .withStockOnHand(null)
            .build();

        var lineItems = [lineItem1, lineItem2];

        expect(this.vm.calculate(lineItems, 'quantity')).toEqual(3);
        expect(this.vm.calculate(lineItems, 'stockOnHand')).toEqual(233);
    });

    describe('checkUnaccountedStockAdjustments', function() {

        it('should assign unaccounted value to line item', function() {
            expect(this.lineItem.unaccountedQuantity).toBe(undefined);

            this.lineItem.quantity = 30;
            this.vm.checkUnaccountedStockAdjustments(this.lineItem);

            expect(this.lineItem.unaccountedQuantity).toBe(10);
        });

        it('should assign 0 as unaccounted value to line item', function() {
            expect(this.lineItem.unaccountedQuantity).toBe(undefined);

            this.lineItem.quantity = 20;
            this.vm.checkUnaccountedStockAdjustments(this.lineItem);

            expect(this.lineItem.unaccountedQuantity).toBe(0);
        });

    });

    describe('quantityChanged', function() {

        it('should update progress', function() {
            spyOn(this.vm, 'updateProgress');

            this.vm.quantityChanged(this.lineItem);

            expect(this.vm.updateProgress).toHaveBeenCalled();
        });

        it('should validate quantity', function() {
            spyOn(this.vm, 'validateQuantity');

            this.vm.quantityChanged(this.lineItem);

            expect(this.vm.validateQuantity).toHaveBeenCalledWith(this.lineItem);
        });

        it('should check unaccounted stock adjustments', function() {
            spyOn(this.vm, 'checkUnaccountedStockAdjustments');

            this.vm.quantityChanged(this.lineItem);

            expect(this.vm.checkUnaccountedStockAdjustments).toHaveBeenCalledWith(this.lineItem);
        });

    });

    describe('addProduct', function() {

        it('should reload current state after adding product', function() {
            this.addProductsModalService.show.andReturn(this.$q.resolve());

            this.vm.addProducts();
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith(this.$state.current.name, this.stateParams, {
                reload: this.$state.current.name
            });
        });

    });

    describe('delete', function() {

        it('should open confirmation modal', function() {
            this.confirmService.confirmDestroy.andReturn(this.$q.resolve());

            this.vm.delete();
            this.$rootScope.$apply();

            expect(this.confirmService.confirmDestroy).toHaveBeenCalledWith(
                'stockPhysicalInventoryDraft.deleteDraft',
                'stockPhysicalInventoryDraft.delete'
            );
        });

        it('should go to the physical inventory screen after deleting draft', function() {
            this.confirmService.confirmDestroy.andReturn(this.$q.resolve());
            this.physicalInventoryService.deleteDraft.andReturn(this.$q.resolve());

            this.vm.delete();
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith(
                'openlmis.stockmanagement.physicalInventory',
                this.stateParams, {
                    reload: true
                }
            );
        });
    });

});
