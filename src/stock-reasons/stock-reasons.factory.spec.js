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
            name: 'Reason One',
            reasonCategory: 'TRANSFER',
            reasonType: 'DEBIT'
        }, {
            id: 'reason-two',
            name: 'Reason Two',
            reasonCategory: 'TRANSFER',
            reasonType: 'CREDIT'
        }, {
            id: 'reason-three',
            name: 'Reason Three',
            reasonCategory: 'ADJUSTMENT'
        }, {
            id: 'reason-four',
            name: 'Reason Three'
        }];

        reasonAssignments = [{
            id: 'valid-reason-one',
            programId: programId,
            facilityTypeId: facilityTypeId,
            reason: reasons[2],
            hidden: false
        }, {
            id: 'valid-reason-two',
            programId: programId,
            facilityTypeId: facilityTypeId,
            reason: reasons[0],
            hidden: false
        }, {
            id: 'valid-reason-three',
            programId: programId,
            facilityTypeId: facilityTypeId,
            reason: reasons[1],
            hidden: false
        }, {
            id: 'hidden-valid-reason',
            programId: programId,
            facilityTypeId: facilityTypeId,
            reason: reasons[3],
            hidden: true
        }];

        programId = 'program-id';
        facilityTypeId = 'facility-type-id';

        reasonAssignmentsDeferred = $q.defer();

        spyOn(validReasonsService, 'get').andReturn(reasonAssignmentsDeferred.promise);
    });

    describe('getReasons', function() {

        it('should not return duplicates', function() {
            var result = undefined;

            reasonAssignments.push({
                id: 'valid-reason-four',
                programId: programId,
                facilityTypeId: facilityTypeId,
                reason: reasons[0],
                hidden: false
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

        it('should return only not hidden reasons', function() {
            var result = undefined;

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

    describe('getIssueReasons', function() {

        it('should return only debit transfer reasons', function() {
            var result = undefined;

            stockReasonsFactory.getIssueReasons(
                programId, facilityTypeId
            ).then(function(reasons) {
                result = reasons;
            });

            reasonAssignmentsDeferred.resolve(reasonAssignments);
            $rootScope.$apply();

            expect(result).toEqual([
                reasons[0]
            ]);
        });

    });

    describe('getReceiveReasons', function() {

        it('should return only credit transfer reasons', function() {
            var result = undefined;

            stockReasonsFactory.getReceiveReasons(
                programId, facilityTypeId
            ).then(function(reasons) {
                result = reasons;
            });

            reasonAssignmentsDeferred.resolve(reasonAssignments);
            $rootScope.$apply();

            expect(result).toEqual([
                reasons[1]
            ]);
        });

    });

    describe('getAdjustmentReasons', function() {

        it('should return only adjustment reasons', function() {
            var result = undefined;

            stockReasonsFactory.getAdjustmentReasons(
                programId, facilityTypeId
            ).then(function(reasons) {
                result = reasons;
            });

            reasonAssignmentsDeferred.resolve(reasonAssignments);
            $rootScope.$apply();

            expect(result).toEqual([
                reasons[2]
            ]);
        });

    });

});
