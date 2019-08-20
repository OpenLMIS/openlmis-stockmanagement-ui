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
     * @name stock-adjustment.controller:StockAdjustmentController
     *
     * @description
     * Controller for making adjustment.
     */
    angular
        .module('stock-adjustment')
        .controller('StockAdjustmentController', controller);

    controller.$inject = ['facility', 'programs', 'adjustmentType', '$state', 'stockmanagementUrlFactory',
        '$http', 'user', '$q', 'loadingModalService'];

    function controller(facility, programs, adjustmentType, $state, stockmanagementUrlFactory, $http, user, $q,
                        loadingModalService) {
        var vm = this;
        vm.drafts = [];

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment.controller:StockAdjustmentController
         * @name facility
         * @type {Object}
         *
         * @description
         * Holds user's home facility.
         */
        vm.facility = facility;

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment.controller:StockAdjustmentController
         * @name programs
         * @type {Array}
         *
         * @description
         * Holds available programs for home facility.
         */
        vm.programs = [];

        vm.key = function(secondaryKey) {
            return adjustmentType.prefix + '.' + secondaryKey;
        };

        vm.proceed = function(program, draft) {
            $state.go('openlmis.stockmanagement.' + adjustmentType.state + '.creation', {
                programId: program.id,
                program: program,
                facility: facility,
                draft: draft
            });
        };

        vm.$onInit = function() {
            var url = stockmanagementUrlFactory('/api/drafts');
            loadingModalService.open();
            var promises = _.map(programs, function(program) {
                return $http.get(url, {
                    params: {
                        program: program.id,
                        facility: facility.id,
                        isDraft: true,
                        userId: user.user_id,
                        draftType: adjustmentType.state
                    }
                }).then(function(res) {
                    var draft = null;
                    if (res.data.length > 0) {
                        draft = res.data[0];
                    }
                    return draft;
                }, function() {
                    loadingModalService.close();
                });
            });

            $q.all(promises).then(function(drafts) {
                loadingModalService.close();

                drafts = _.filter(drafts, function(draft) {
                    return draft !== null;
                });
                vm.drafts = drafts;

                vm.programs = _.map(programs, function(p) {
                    p.draft = _.find(vm.drafts, function(d) {
                        return d.programId === p.id;
                    });
                    return p;
                });
            }, function() {
                loadingModalService.close();
            });
        };
    }
})();
