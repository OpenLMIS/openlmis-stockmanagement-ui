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
        .module('stock-reason')
        .run(routes);

    routes.$inject = ['loginService', 'stockReasonsFactory', 'facilityFactory', '$q'];

    function routes(loginService, stockReasonsFactory, facilityFactory, $q) {

        loginService.registerPostLoginAction(function() {
            stockReasonsFactory.clearReasonsCache();
            var homeFacility;

            return facilityFactory.getUserHomeFacility()
                .then(function(facility) {
                    homeFacility = facility;
                    var programs = homeFacility.supportedPrograms;
                    var supportedProgramsIds = programs.map(function(program) {
                        return program.id ? program.id : program;
                    });

                    return stockReasonsFactory.getReasons(
                        supportedProgramsIds,
                        homeFacility.type ? homeFacility.type.id : homeFacility
                    );
                })
                .catch(function() {
                    return $q.resolve();
                });
        });
    }

})();