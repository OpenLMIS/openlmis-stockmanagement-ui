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

describe('stockReasonsFactory', function() {

    var stockReasonsFactory, $q, $rootScope, validReasonsService, reasons, reasonAssignments,
        programId, facilityTypeId, reasonAssignmentsDeferred;

    beforeEach(function() {
        module('stock-reasons');

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            validReasonsService = $injector.get('validReasonsService');
            stockReasonsFactory = $injector.get('stockReasonsFactory');
        });

        reasons = [{
            id: 'reason-one',
            name: 'Reason One'
        }, {
            id: 'reason-two',
            name: 'Reason Two'
        }, {
            id: 'reason-three',
            name: 'Reason Three'
        }];

        reasonAssignments = [{
            programId: programId,
            facilityTypeId: facilityTypeId,
            reason: reasons[2],
        }, {
            programId: programId,
            facilityTypeId: facilityTypeId,
            reason: reasons[0],
        }, {
            programId: programId,
            facilityTypeId: facilityTypeId,
            reason: reasons[1],
        }];

        programId = 'program-id';
        facilityTypeId = 'facility-type-id';

        reasonAssignmentsDeferred = $q.defer();

        spyOn(validReasonsService, 'get').andReturn(reasonAssignmentsDeferred.promise);
    });

    describe('getReasons', function() {

        it('should not return duplicates', function() {
            var result;

            reasonAssignments.push({
                programId: programId,
                facilityTypeId: facilityTypeId,
                reason: reasons[0]
            });

            stockReasonsFactory.getReasons(
                programId, facilityTypeId
            ).then(function(reasons) {
                result = reasons;
            });

            reasonAssignmentsDeferred.resolve(reasonAssignments);
            $rootScope.$apply();

            expect(result).toEqual([
                reasons[2], reasons[0], reasons[1]
            ]);
        });

        it('should return only reasons', function() {
            var result;

            stockReasonsFactory.getReasons(
                programId, facilityTypeId
            ).then(function(reasons) {
                result = reasons;
            });

            reasonAssignmentsDeferred.resolve(reasonAssignments);
            $rootScope.$apply();

            expect(result).toEqual([
                reasons[2], reasons[0], reasons[1]
            ]);
        });

        it('should pass facility type and program IDs to the service', function() {
            stockReasonsFactory.getReasons(programId, facilityTypeId);

            expect(validReasonsService.get).toHaveBeenCalledWith(programId, facilityTypeId);
        });

        it('should reject promise if request failed', function() {
            var rejected;

            stockReasonsFactory.getReasons(programId, facilityTypeId).catch(function() {
                rejected = true;
            });

            reasonAssignmentsDeferred.reject();
            $rootScope.$apply();

            expect(rejected).toBeTruthy();
        });

        it('should throw exception if reason assignments are undefined', function() {
            var error;

            stockReasonsFactory.getReasons(
                programId, facilityTypeId
            ).catch(function(message) {
                error = message;
            });
            reasonAssignmentsDeferred.resolve(undefined);
            $rootScope.$apply();

            expect(error).toEqual('reason assignments must be defined');
        });

    });

});
