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
     * @ngdoc service
     * @name stock-program-util.stockProgramUtilService
     *
     * @description
     * Responsible for retrieving all supported programs and has right assigned with it from server.
     */
    angular
        .module('stock-program-util')
        .service('stockProgramUtilService', service);

    service.$inject = ['permissionService', 'programService', 'currentUserHomeFacilityService', '$q'];

    function service(permissionService, programService, currentUserHomeFacilityService, $q) {

        this.getPrograms = getPrograms;

        function getPrograms(userId, rightName) {
            return currentUserHomeFacilityService.getHomeFacility()
            .then(function(homeFacility) {
                var permissionPromises = homeFacility.supportedPrograms.map(function(supportedProgram) {
                    return permissionService.hasPermission(userId, {
                        right: rightName,
                        programId: supportedProgram.id,
                        facilityId: homeFacility.id
                    })
                    .then(function() {
                        return true;
                    })
                    .catch(function() {
                        return false;
                    });
                });

                return $q.all(permissionPromises)
                .then(function(permissions) {
                    var programIds = [];

                    for (var program in homeFacility.supportedPrograms) {
                        if (permissions[program]) {
                            programIds.push(homeFacility.supportedPrograms[program].id);
                        }
                    }

                    return programService.getUserPrograms(userId).then(function(programs) {
                        return programs.filter(function(program) {
                            return _.contains(programIds, program.id);
                        });
                    });
                });
            });
        }
    }
})();