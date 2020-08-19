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

        module('stock-physical-inventory-draft', function($provide) {
            $provide.service('offlineService', function() {
                return function() {};
            });

            $provide.factory('localStorageFactory', function() {
                return jasmine.createSpy('localStorageFactory').andReturn(draftStorage);
            });
        });

        var PhysicalInventoryDataBuilder, physicalInventoryLineItems;
        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.physicalInventoryDraftCacheService = $injector.get('physicalInventoryDraftCacheService');
            PhysicalInventoryDataBuilder = $injector.get('PhysicalInventoryDataBuilder');
        });

        physicalInventoryLineItems = [
            {
                orderable: {
                    id: 'orderable-1',
                    versionNumber: '1'
                },
                lot: {
                    id: 'lot-1'
                },
                quantity: 3,
                vvmStatus: 'STAGE_1',
                isAdded: false
            },
            {
                orderable: {
                    id: 'orderable-2',
                    versionNumber: '1'
                },
                quantity: null,
                vvmStatus: null,
                isAdded: true
            }
        ];

        this.draft1 = new PhysicalInventoryDataBuilder().withLineItems(physicalInventoryLineItems)
            .build();
        this.draft2 = new PhysicalInventoryDataBuilder().withLineItems(physicalInventoryLineItems)
            .build();
        this.programId = 'programId';
        this.facilityId = 'facilityId';
    });

    describe('cacheDraft', function() {

        it('should cache draft', function() {
            this.physicalInventoryDraftCacheService.cacheDraft(this.draft1);

            expect(this.draftStorage.put).toHaveBeenCalledWith(this.draft1);
        });
    });

    describe('getDraft', function() {

        it('should get draft by id', function() {
            this.physicalInventoryDraftCacheService.getDraft(this.draft1.id);

            expect(this.draftStorage.getBy).toHaveBeenCalledWith('id', this.draft1.id);
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