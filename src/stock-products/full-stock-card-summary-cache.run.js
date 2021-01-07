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
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    angular
        .module('stock-products')
        .run(routes);

    routes.$inject = ['loginService', '$q', 'StockCardSummaryResource', 'facilityFactory'];

    function routes(loginService, $q, StockCardSummaryResource, facilityFactory) {

        loginService.registerPostLoginAction(function(user) {
            var homeFacility;

            var resource = new StockCardSummaryResource();

            return $q.all([
                facilityFactory.getUserHomeFacility()
            ])
                .then(function(responses) {
                    homeFacility = responses[0];
                    var programs = homeFacility.supportedPrograms;
                    programs.forEach(function(program) {
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
        });
    }

})();