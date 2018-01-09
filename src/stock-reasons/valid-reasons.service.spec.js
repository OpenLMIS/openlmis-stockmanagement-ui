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

describe('validReasonsService', function() {

    var validReasonsService, $httpBackend, stockmanagementUrlFactory, facilityType, program;

    beforeEach(function() {
        module('stock-reasons');

        inject(function($injector) {
            validReasonsService = $injector.get('validReasonsService');
            $httpBackend = $injector.get('$httpBackend');
            stockmanagementUrlFactory = $injector.get('stockmanagementUrlFactory');
        });

        facilityType = 'facility-type-id';
        program = 'program-id';
    });

    describe('get', function() {

        beforeEach(function() {
            $httpBackend.when('GET', stockmanagementUrlFactory(
                '/api/validReasons' +
                '?facilityType=' + facilityType +
                '&program=' + program
            )).respond(200);
        });

        it('should call proper endpoint', function() {
            validReasonsService.get(program, facilityType);
            $httpBackend.flush();
        });

        it('should return promise ', function() {
            expect(validReasonsService.get(program, facilityType).then).not.toBeUndefined();
            $httpBackend.flush();
        });

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

});
