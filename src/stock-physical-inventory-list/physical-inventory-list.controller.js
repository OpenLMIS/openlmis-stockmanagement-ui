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

(function() {

    'use strict';

    /**
     * @ngdoc controller
     * @name stock-physical-inventory-list.controller:PhysicalInventoryListController
     *
     * @description
     * Controller for managing physical inventory.
     */
    angular
        .module('stock-physical-inventory-list')
        .controller('PhysicalInventoryListController', controller);

    controller.$inject = ['facility', 'programs', 'drafts', 'messageService', '$state', 'physicalInventoryService',
        'physicalInventoryFactory', 'FunctionDecorator', 'physicalInventoryDraftCacheService',
        'offlineService'];

    function controller(facility, programs, drafts, messageService, $state, physicalInventoryService,
                        physicalInventoryFactory, FunctionDecorator, physicalInventoryDraftCacheService,
                        offlineService) {
        var vm = this;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name facility
         * @type {Object}
         *
         * @description
         * Holds user's home facility.
         */
        vm.facility = facility;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name programs
         * @type {Array}
         *
         * @description
         * Holds available programs for home facility.
         */
        vm.programs = programs;

        vm.drafts = drafts;
        vm.editDraft = new FunctionDecorator()
            .decorateFunction(editDraft)
            .withLoading(true)
            .getDecoratedFunction();

        /**
         * @ngdoc method
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name getProgramName
         *
         * @description
         * Responsible for getting program name based on id.
         *
         * @param {String} id Program UUID
         */
        vm.getProgramName = function(id) {
            return _.find(vm.programs, function(program) {
                return program.id === id;
            }).name;
        };

        /**
         * @ngdoc method
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name getDraftStatus
         *
         * @description
         * Responsible for getting physical inventory status.
         *
         * @param {Boolean} isStarter Indicates starter or saved draft.
         */
        vm.getDraftStatus = function(isStarter) {
            if (isStarter) {
                return messageService.get('stockPhysicalInventory.notStarted');
            }
            return messageService.get('stockPhysicalInventory.draft');

        };

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name offline
         * @type {boolean}
         *
         * @description
         * Holds information about internet connection
         */
        vm.offline = offlineService.isOffline();

        /**
         * @ngdoc method
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name editDraft
         *
         * @description
         * Navigating to draft physical inventory.
         *
         * @param {Object} draft Physical inventory draft
         */
        function editDraft(draft) {
            var program = _.find(vm.programs, function(program) {
                return program.id === draft.programId;
            });
            if (offlineService.isOffline()) {
                return physicalInventoryDraftCacheService.getDraft(draft.id)
                    .then(function(offlineDraft) {
                        $state.go('openlmis.stockmanagement.physicalInventory.draft', {
                            id: offlineDraft.id,
                            draft: offlineDraft,
                            program: program,
                            facility: facility
                        });
                    });
            }
            return physicalInventoryFactory.getDraft(draft.programId, draft.facilityId).then(function(draft) {
                if (draft.id) {
                    physicalInventoryDraftCacheService.cacheDraft(draft);
                    $state.go('openlmis.stockmanagement.physicalInventory.draft', {
                        id: draft.id,
                        draft: draft,
                        program: program,
                        facility: facility
                    });
                } else {
                    physicalInventoryService.createDraft(program.id, facility.id).then(function(data) {
                        draft.id = data.id;
                        physicalInventoryDraftCacheService.cacheDraft(draft);
                        $state.go('openlmis.stockmanagement.physicalInventory.draft', {
                            id: draft.id,
                            draft: draft,
                            program: program,
                            facility: facility
                        });
                    });
                }
            });
        }
    }
})();
