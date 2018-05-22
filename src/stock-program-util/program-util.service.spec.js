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

describe('stockProgramUtilService', function() {

    var stockProgramUtilService, permissionService, programService, currentUserHomeFacilityService, $q, $rootScope,
        ProgramDataBuilder, programs, FacilityDataBuilder, homeFacility;

    var RIGHT_NAME = "RIGHT_NAME",
        USER_ID = "user-id";

    beforeEach(function() {
        module('stock-program-util');

        inject(function($injector) {
            permissionService = $injector.get('permissionService');
            programService = $injector.get('programService');
            currentUserHomeFacilityService = $injector.get('currentUserHomeFacilityService');
            $q = $injector.get('$q');
            stockProgramUtilService = $injector.get('stockProgramUtilService');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            $rootScope = $injector.get('$rootScope');
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
        });

        programs = [
            new ProgramDataBuilder().build(),
            new ProgramDataBuilder().build(),
            new ProgramDataBuilder().build(),
            new ProgramDataBuilder().build()
        ];

        homeFacility = new FacilityDataBuilder()
            .withSupportedPrograms([
                programs[0],
                programs[2]
            ]).build();

        spyOn(programService, 'getUserPrograms').andReturn($q.resolve(programs));
        spyOn(currentUserHomeFacilityService, 'getHomeFacility').andReturn($q.resolve(homeFacility));
        spyOn(permissionService, 'hasPermission');
    });

    describe('getPrograms', function() {

        beforeEach(function() {
            permissionService.hasPermission.andCallFake(function(userId, permission) {
                if (userId !== USER_ID || permission.facilityId !== homeFacility.id) {
                    return;
                }

                if (permission.programId === programs[0].id || permission.programId === programs[1].id) {
                    return $q.resolve();
                }

                return $q.reject();
            });
        });
    
        it('should reject if home facility caching fails', function() {
            currentUserHomeFacilityService.getHomeFacility.andReturn($q.reject());

            var rejected;
            stockProgramUtilService.getPrograms(USER_ID, RIGHT_NAME)
            .catch(function() {
                rejected = true;
            });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should reject if program fetching fails', function() {
            programService.getUserPrograms.andReturn($q.reject());

            var rejected;
            stockProgramUtilService.getPrograms(USER_ID, RIGHT_NAME)
            .catch(function() {
                rejected = true;
            });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should omit programs which are not supported by the user home facility', function() {
            programService.getUserPrograms.andReturn($q.resolve([
                programs[0],
                programs[1]
            ]));

            var result;
            stockProgramUtilService.getPrograms(USER_ID, RIGHT_NAME)
            .then(function(programs) {
                result = programs;
            });
            $rootScope.$apply();

            expect(result.length).toEqual(1);
            expect(result[0]).toEqual(programs[0]);
        });

        it('should return programs that user has right to and are supported by the home facility', function() {
            homeFacility = new FacilityDataBuilder()
                .withSupportedPrograms(programs)
                .build();

            currentUserHomeFacilityService.getHomeFacility.andReturn($q.resolve(homeFacility));

            programService.getUserPrograms.andReturn($q.resolve([
                programs[0],
                programs[1]
            ]));
            
            var result;
            stockProgramUtilService.getPrograms(USER_ID, RIGHT_NAME)
            .then(function(programs) {
                result = programs;
            });
            $rootScope.$apply();

            expect(result.length).toEqual(2);
            expect(result[0]).toEqual(programs[0]);
            expect(result[1]).toEqual(programs[1]);
        });
    
    });

});