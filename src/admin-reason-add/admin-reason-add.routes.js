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

    angular.module('admin-reason-list').config(routes);

    routes.$inject = ['modalStateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes(modalStateProvider, STOCKMANAGEMENT_RIGHTS) {
        modalStateProvider.state('openlmis.administration.reasons.add', {
            controller: 'AdminReasonAddController',
            controllerAs: 'vm',
            templateUrl: 'admin-reason-add/admin-reason-add-modal.html',
            url: '/add',
            accessRights: [STOCKMANAGEMENT_RIGHTS.REASONS_MANAGE],
            parentResolves: ['reasons'],
            resolve: {
                reason: function(AdminReasonAddService) {
                    return new AdminReasonAddService().getReason();
                },
                reasonTypes: function(ReasonTypeResource) {
                    return new ReasonTypeResource().query();
                },
                reasonCategories: function(ReasonCategoryResource) {
                    return new ReasonCategoryResource().query();
                },
                programs: function(programService) {
                    return programService.getAll();
                },
                facilityTypes: function(facilityTypeService) {
                    return facilityTypeService.query({
                        active: true
                    })
                    .then(function(response) {
                        return response.content;
                    });
                },
                facilityTypesMap: function(facilityTypes, $q) {
                    var map = {};
                    facilityTypes.forEach(function(facilityType) {
                       map[facilityType.id] = facilityType.name;
                    });
                    return $q.resolve(map);
                },
                programsMap: function(programs, $q) {
                    var map = {};
                    programs.forEach(function(program) {
                       map[program.id] = program.name;
                    });
                    return $q.resolve(map);
                },
                availableTags: function(StockReasonTagResource) {
                    return new StockReasonTagResource().query();
                }
            }
        });
    }

})();