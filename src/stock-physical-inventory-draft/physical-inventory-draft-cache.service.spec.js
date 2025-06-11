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

describe('physicalInventoryDraftCacheService', function() {

    beforeEach(function() {
        this.draftStorage = jasmine.createSpyObj('drafts', ['put', 'removeBy', 'getBy', 'search']);

        var draftStorage = this.draftStorage;
        var context = this;
        var offlineService;
        module('stock-physical-inventory-draft', function($provide) {
            offlineService = jasmine.createSpyObj('offlineService', ['isOffline']);
            $provide.service('offlineService', function() {
                return offlineService;
            });

            $provide.factory('localStorageFactory', function() {
                return jasmine.createSpy('localStorageFactory').andReturn(draftStorage);
            });

            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.physicalInventoryDraftCacheService = $injector.get('physicalInventoryDraftCacheService');
            this.PhysicalInventoryDataBuilder = $injector.get('PhysicalInventoryDataBuilder');
            this.PhysicalInventoryLineItemDataBuilder = $injector.get('PhysicalInventoryLineItemDataBuilder');
            this.OrderableResource = $injector.get('OrderableResource');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.ProgramOrderableDataBuilder =  $injector.get('ProgramOrderableDataBuilder');
        });
        this.orderable1 = {
            id: 'orderable-1',
            versionNumber: '1'
        };
        this.orderable2 = {
            id: 'orderable-2',
            versionNumber: '1'
        };
        this.lot = {
            id: 'lot-1'
        };

        this.programs = [
            new this.ProgramOrderableDataBuilder()
                .withFullSupply()
                .buildJson(),
            new this.ProgramOrderableDataBuilder()
                .buildJson()
        ];

        this.orderables = [
            new this.OrderableDataBuilder()
                .withId('orderable-1')
                .withVersionNumber('1')
                .withPrograms([this.programs[0]])
                .buildJson(),
            new this.OrderableDataBuilder()
                .withId('orderable-2')
                .withVersionNumber('1')
                .withPrograms([this.programs[0]])
                .buildJson(),
            new this.OrderableDataBuilder()
                .withId('orderable3')
                .withVersionNumber('1')
                .withPrograms([this.programs[1]])
                .buildJson(),
            new this.OrderableDataBuilder()
                .withId('orderable3')
                .withVersionNumber('1')
                .withPrograms([this.programs[1]])
                .buildJson()
        ];

        this.physicalInventoryLineItems = [
            new this.PhysicalInventoryLineItemDataBuilder().withOrderable(this.orderable1)
                .withLot(this.lot)
                .withQuantity(3)
                .buildAsAdded(),
            new this.PhysicalInventoryLineItemDataBuilder().withOrderable(this.orderable2)
                .withQuantity(null)
                .buildAsAdded()
        ];

        this.draft1 = new this.PhysicalInventoryDataBuilder().withLineItems(this.physicalInventoryLineItems)
            .build();
        this.draft2 = new this.PhysicalInventoryDataBuilder().withLineItems(this.physicalInventoryLineItems)
            .build();
        this.programId = 'programId';
        this.facilityId = 'facilityId';

        spyOn(this.OrderableResource.prototype, 'getByVersionIdentities');

        this.OrderableResource.prototype.getByVersionIdentities.andCallFake(function() {
            return context.$q.when(context.orderables);
        });
    });

    describe('cacheDraft', function() {

        it('should cache draft', function() {
            this.physicalInventoryDraftCacheService.cacheDraft(this.draft1);

            expect(this.draftStorage.put).toHaveBeenCalledWith(this.draft1);
        });
    });

    describe('getDraft', function() {

        it('should get draft by draft id', function() {
            var result;
            var draftShouldBe = this.draft1;
            draftShouldBe.lineItems[0].orderable = this.orderables[0];

            this.draftStorage.search.andReturn([this.draft1]);
            this.physicalInventoryDraftCacheService.getDraft(this.draft1.id)
                .then(function(response) {
                    result = response;
                });
            this.$rootScope.$apply();

            expect(this.draftStorage.search).toHaveBeenCalledWith({
                id: this.draft1.id
            });

            expect(result).toEqual(draftShouldBe);
        });

        it('should return undefined if draft does not exist', function() {
            var result;

            this.draftStorage.search.andReturn([]);
            this.physicalInventoryDraftCacheService.getDraft(this.draft1.id)
                .then(function(response) {
                    result = response;
                });
            this.$rootScope.$apply();

            expect(this.draftStorage.search).toHaveBeenCalledWith({
                id: this.draft1.id
            });

            expect(result).toBeUndefined();
        });
    });

    describe('searchDraft', function() {

        it('should search drafts by programId and facilityId', function() {
            this.physicalInventoryDraftCacheService.searchDraft(this.programId, this.facilityId);

            expect(this.draftStorage.search).toHaveBeenCalledWith({
                facilityId: this.facilityId,
                programId: this.programId
            });
        });

        it('should return drafts from local storage', function() {
            var result;
            this.draftStorage.search.andReturn([this.draft1, this.draft2]);

            this.physicalInventoryDraftCacheService.searchDraft(this.programId, this.facilityId)
                .then(function(response) {
                    result = response;
                });
            this.$rootScope.$apply();

            expect(result).toEqual([this.draft1, this.draft2]);
        });
    });

    describe('removeById', function() {

        it('should remove draft by ID', function() {
            this.physicalInventoryDraftCacheService.removeById(this.draft1.id);

            expect(this.draftStorage.removeBy).toHaveBeenCalledWith('id', this.draft1.id);
        });

    });

});