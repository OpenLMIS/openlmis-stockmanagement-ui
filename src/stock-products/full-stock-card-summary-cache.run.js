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
        .module('stock-products')
        .run(routes);

    routes.$inject = ['loginService', 'StockCardSummaryResource', 'facilityFactory',
        'permissionService', 'STOCKMANAGEMENT_RIGHTS', '$q'];

    function routes(loginService, StockCardSummaryResource, facilityFactory, permissionService,
                    STOCKMANAGEMENT_RIGHTS, $q) {

        loginService.registerPostLoginAction(function(user) {
            var homeFacility;

            var resource = new StockCardSummaryResource();
            resource.deleteAll();

            return facilityFactory.getUserHomeFacility()
                .then(function(facility) {
                    homeFacility = facility;
                    var programs = homeFacility.supportedPrograms;
                    programs.forEach(function(program) {
                        return permissionService.hasPermission(user.userId, {
                            right: STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW,
                            programId: program.id,
                            facilityId: homeFacility.id
                        })
                            .then(function() {
                                var docId = program.id + '/' + homeFacility.id;
                                var params = {
                                    programId: program.id,
                                    facilityId: homeFacility.id
                                };

                                return resource.query(params, docId)
                                    .then(function(stockCardSummariesPage) {
                                        return stockCardSummariesPage;
                                    });
                            });
                    });
                })
                .catch(function() {
                    return $q.resolve();
                });
        });
    }

})();