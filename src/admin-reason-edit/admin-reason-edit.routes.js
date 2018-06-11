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

    angular
        .module('admin-reason-edit')
        .config(config);

    config.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function config($stateProvider, STOCKMANAGEMENT_RIGHTS) {

        $stateProvider.state('openlmis.administration.reasons.edit', {
            url: '/:id',
            views: {
                '@openlmis': {
                    controller: 'AdminReasonAddController',
                    templateUrl: 'admin-reason-edit/admin-reason-edit.html',
                    controllerAs: 'vm'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.REASONS_MANAGE],
            resolve: {
                reason: function(AdminReasonAddService, $stateParams) {
                    return new AdminReasonAddService().getReason($stateParams.id);
                },
                reasonTypes: function(ReasonTypeResource) {
                    return new ReasonTypeResource().query();
                },
                availableTags: function(StockReasonTagResource) {
                    return new StockReasonTagResource().query();
                },
                reasonCategories: function(ReasonCategoryResource) {
                    return new ReasonCategoryResource().query();
                },
                programs: function(programService) {
                    return programService.getAll();
                },
                programsMap: function(programs, ObjectMapper) {
                    return new ObjectMapper().map(programs, 'name');
                },
                facilityTypes: function(facilityTypeService) {
                    return facilityTypeService.query({
                        active: true
                    })
                    .then(function(response) {
                        return response.content;
                    });
                },
                facilityTypesMap: function(facilityTypes, ObjectMapper) {
                    return new ObjectMapper().map(facilityTypes, 'name');
                }
            }
        });
    }
})();