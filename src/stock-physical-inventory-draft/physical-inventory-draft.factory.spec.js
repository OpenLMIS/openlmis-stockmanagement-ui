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

    var $q, $rootScope, physicalInventoryDraftService, physicalInventoryDraftFactory,
        draft;

    beforeEach(function() {
        module('stock-physical-inventory-draft', function($provide) {
            physicalInventoryDraftService = jasmine.createSpyObj('physicalInventoryDraftService', ['saveDraft']);
            $provide.factory('physicalInventoryDraftService', function() {
                return physicalInventoryDraftService;
            });
        });

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            physicalInventoryDraftFactory = $injector.get('physicalInventoryDraftFactory');
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
                    extraData: {
                        vvmStatus: 'STAGE_1'
                    },
                    isAdded: false
                },
                {
                    orderable: {
                        id: 'orderable-2'
                    },
                    quantity: null,
                    extraData: {},
                    isAdded: true
                }
            ]
        };

        physicalInventoryDraftService.saveDraft.andCallFake(function(passedDraft) {
            return $q.when(passedDraft);
        });
    });

    describe('init', function() {
        it('should expose saveDraft method', function() {
            expect(angular.isFunction(physicalInventoryDraftFactory.saveDraft)).toBe(true);
        });
    });

    describe('saveDraft', function() {
        it('should return promise', function() {
            var result = physicalInventoryDraftFactory.saveDraft(draft);
            $rootScope.$apply();

            expect(result.then).not.toBeUndefined();
            expect(angular.isFunction(result.then)).toBe(true);
        });

        it('should call physicalInventoryDraftService', function() {
            physicalInventoryDraftFactory.saveDraft(draft);
            expect(physicalInventoryDraftService.saveDraft).toHaveBeenCalled();
        });

        it('should save draft with changed lineItems', function() {
            var savedDraft;

            physicalInventoryDraftFactory.saveDraft(draft).then(function(response) {
                savedDraft = response;
            });
            $rootScope.$apply();

            expect(savedDraft.id).toEqual(draft.id);
            angular.forEach(savedDraft.lineItems, function(lineItem, index) {
                expect(lineItem.lot).toEqual(draft.lineItems[index].lot ? draft.lineItems[index].lot : null);
                expect(lineItem.orderable).toEqual(draft.lineItems[index].orderable);
                expect(lineItem.quantity).toEqual(draft.lineItems[index].isAdded ? -1 : draft.lineItems[index].quantity);
                expect(lineItem.extraData).toEqual(draft.lineItems[index].extraData);
            });
        });
    });
});
