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

describe('physicalInventoryDraftFactory', function() {

    var $q, $rootScope, physicalInventoryService, physicalInventoryFactory,
        draft;

    beforeEach(function() {
        module('stock-physical-inventory', function($provide) {
            physicalInventoryService = jasmine.createSpyObj('physicalInventoryService', ['saveDraft']);
            $provide.factory('physicalInventoryService', function() {
                return physicalInventoryService;
            });
        });

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            physicalInventoryFactory = $injector.get('physicalInventoryFactory');
        });

        draft = {
            id: 'draft-1',
            lineItems: [
                {
                    orderable: {
                        id: 'orderable-1'
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
                        id: 'orderable-2'
                    },
                    quantity: null,
                    vvmStatus: null,
                    isAdded: true
                }
            ]
        };

        physicalInventoryService.saveDraft.andCallFake(function(passedDraft) {
            return $q.when(passedDraft);
        });
    });

    describe('init', function() {
        it('should expose saveDraft method', function() {
            expect(angular.isFunction(physicalInventoryFactory.saveDraft)).toBe(true);
        });
    });

    describe('saveDraft', function() {
        it('should return promise', function() {
            var result = physicalInventoryFactory.saveDraft(draft);
            $rootScope.$apply();

            expect(result.then).not.toBeUndefined();
            expect(angular.isFunction(result.then)).toBe(true);
        });

        it('should call physicalInventoryService', function() {
            physicalInventoryFactory.saveDraft(draft);
            expect(physicalInventoryService.saveDraft).toHaveBeenCalled();
        });

        it('should save draft with changed lineItems', function() {
            var savedDraft = undefined;

            physicalInventoryFactory.saveDraft(draft).then(function(response) {
                savedDraft = response;
            });
            $rootScope.$apply();

            expect(savedDraft).toBeDefined();
            expect(savedDraft.id).toEqual(draft.id);
            angular.forEach(savedDraft.lineItems, function(lineItem, index) {
                expect(lineItem.lotId).toEqual(draft.lineItems[index].lot ? draft.lineItems[index].lot.id : null);
                expect(lineItem.orderableId).toEqual(draft.lineItems[index].orderable.id);
                expect(lineItem.quantity).toEqual(draft.lineItems[index].isAdded ? -1 : draft.lineItems[index].quantity);
                expect(lineItem.extraData.vvmStatus).toEqual(draft.lineItems[index].vvmStatus);
            });
        });
    });
});
