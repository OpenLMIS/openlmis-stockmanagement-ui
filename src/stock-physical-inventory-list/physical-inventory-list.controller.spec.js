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

describe('PhysicalInventoryListController', function() {

    beforeEach(function() {
        module('stock-physical-inventory-list', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$q = $injector.get('$q');
            this.$rootScope =  $injector.get('$rootScope');
            this.scope = this.$rootScope.$new();
            this.$state = $injector.get('$state');
            this.physicalInventoryService = $injector.get('physicalInventoryService');
            this.FunctionDecorator = $injector.get('FunctionDecorator');
            this.messageService = $injector.get('messageService');
            this.offlineService = $injector.get('offlineService');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.$stateParams = $injector.get('$stateParams');
        });

        this.programs = [
            new this.ProgramDataBuilder()
                .withId('1')
                .withName('HIV')
                .build(),
            new this.ProgramDataBuilder()
                .withId('2')
                .withName('TB')
                .build()
        ];

        this.facility = new this.FacilityDataBuilder()
            .withId('10134')
            .withName('National Warehouse')
            .withSupportedPrograms(this.programs)
            .buildJson();

        var context = this;
        spyOn(this.$state, 'go');
        spyOn(this.FunctionDecorator.prototype, 'decorateFunction').andCallFake(function(fn) {
            context.fn = fn;
            return this;
        });
        spyOn(this.FunctionDecorator.prototype, 'getDecoratedFunction').andCallFake(function() {
            return context.fn;
        });

        this.vm = this.$controller('PhysicalInventoryListController', {
            facility: this.facility,
            programs: this.programs,
            messageService: this.messageService,
            physicalInventoryService: this.physicalInventoryService,
            physicalInventoryFactory: this.physicalInventoryFactory,
            drafts: [{
                programId: this.programs[0].id
            }, {
                programId: this.programs[1].id
            }],
            $scope: this.scope
        });
    });

    describe('onInit', function() {

        it('should init programs and physical inventory drafts properly', function() {
            expect(this.vm.programs).toEqual(this.programs);
            expect(this.vm.drafts).toEqual([{
                programId: this.programs[0].id
            }, {
                programId: this.programs[1].id
            }]);
        });

        it('should get program name by id', function() {
            expect(this.vm.getProgramName(this.programs[0].id)).toEqual(this.programs[0].name);
            expect(this.vm.getProgramName(this.programs[1].id)).toEqual(this.programs[1].name);
        });

        it('should get physical inventory draft status', function() {
            expect(this.vm.getDraftStatus(true)).toEqual('stockPhysicalInventory.notStarted');
            expect(this.vm.getDraftStatus(false)).toEqual('stockPhysicalInventory.draft');
        });

        it('should call watch', function() {
            spyOn(this.scope, '$watch').andCallThrough();
            this.vm.$onInit();
            this.$rootScope.$apply();

            expect(this.scope.$watch).toHaveBeenCalled();
        });

        it('should call watch when isOffline is changed', function() {
            spyOn(this.scope, '$watch').andCallThrough();
            this.vm.$onInit();
            this.$rootScope.$apply();

            spyOn(this.offlineService, 'isOffline').andReturn(true);
            this.$rootScope.$apply();

            expect(this.scope.$watch).toHaveBeenCalled();
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.physicalInventory', {}, {
                reload: true
            });
        });

        it('should reload page if stateOffline has been changed', function() {
            this.$stateParams.stateOffline = false;
            this.vm.$onInit();
            this.$rootScope.$apply();

            spyOn(this.offlineService, 'isOffline').andReturn(true);
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.physicalInventory', {}, {
                reload: true
            });
        });
    });

    describe('editDraft', function() {

        it('should go to physical inventory page when proceed', function() {
            var draft = {
                id: 123,
                programId: this.programs[0].id,
                starter: false
            };

            this.vm.editDraft(draft);
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.physicalInventory.draft', {
                id: draft.id,
                program: this.programs[0],
                facility: this.facility,
                includeInactive: false
            });
        });

        it('should change isStarter property if was true', function() {
            var draft = {
                id: 123,
                programId: this.programs[0].id,
                isStarter: true
            };

            this.vm.editDraft(draft);
            this.$rootScope.$apply();

            expect(this.vm.drafts[0].isStarter).toEqual(false);
        });

        it('should create draft to get id and go to physical inventory when proceed', function() {
            var draft = {
                programId: this.programs[0].id,
                starter: false
            };
            var id = '456';

            spyOn(this.physicalInventoryService, 'createDraft').andReturn(this.$q.resolve({
                id: id
            }));

            this.vm.editDraft(draft);
            this.$rootScope.$apply();

            expect(this.physicalInventoryService.createDraft).toHaveBeenCalledWith(draft.programId, this.facility.id);
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.physicalInventory.draft', {
                id: id,
                program: this.programs[0],
                facility: this.facility,
                includeInactive: false
            });
        });

        it('should go to physical inventory page when proceed offline', function() {
            var draft = {
                id: 123,
                programId: this.programs[0].id,
                facilityId: this.facility.id,
                includeInactive: false,
                starter: false
            };
            spyOn(this.offlineService, 'isOffline').andReturn(true);

            this.vm.editDraft(draft);
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.physicalInventory.draft', {
                id: draft.id,
                program: this.programs[0],
                facility: this.facility,
                includeInactive: false
            });
        });
    });
});
