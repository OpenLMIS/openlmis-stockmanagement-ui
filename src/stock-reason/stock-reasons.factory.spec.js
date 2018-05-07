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

    var stockReasonsFactory, $q, $rootScope, validReasonResourceMock, reasons, reasonAssignments,
        programId, facilityTypeId, reasonAssignmentsDeferred;

    beforeEach(function() {
        module('stock-reasons-modal', function($provide) {
            validReasonResourceMock = jasmine.createSpyObj('validReasonResource', ['query']);
            $provide.factory('ValidReasonResource', function() {
                return function() {
                    return validReasonResourceMock;
                };
            });
        });

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
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

        validReasonResourceMock.query.andReturn(reasonAssignmentsDeferred.promise);
    });

    describe('getReasons', function() {

        var result, error;

        beforeEach(function() {
            stockReasonsFactory.getReasons(programId, facilityTypeId, ['DEBIT', 'CREDIT'])
            .then(function(response) {
                result = response;
            })
            .catch(function() {
                error = 'rejected';
            });
        });

        it('should not return duplicates', function() {
            reasonAssignments.push({
                id: 'valid-reason-four',
                programId: programId,
                facilityTypeId: facilityTypeId,
                reason: reasons[0],
                hidden: false
            });

            reasonAssignmentsDeferred.resolve(reasonAssignments);
            $rootScope.$apply();

            expect(result).toEqual([
                reasons[2], reasons[0], reasons[1]
            ]);
        });

        it('should return only not hidden reasons', function() {
            reasonAssignmentsDeferred.resolve(reasonAssignments);
            $rootScope.$apply();

            expect(result).toEqual([
                reasons[2], reasons[0], reasons[1]
            ]);
        });

        it('should pass facility type and program IDs to the service', function() {
            expect(validReasonResourceMock.query).toHaveBeenCalledWith(programId, facilityTypeId, ['DEBIT', 'CREDIT']);
        });

        it('should reject promise if request failed', function() {
            reasonAssignmentsDeferred.reject();
            $rootScope.$apply();

            expect(error).not.toBeUndefined();
        });
    });

    describe('getIssueReasons', function() {

        var result, error;

        beforeEach(function() {
            stockReasonsFactory.getIssueReasons(programId, facilityTypeId)
            .then(function(response) {
                result = response;
            })
            .catch(function() {
                error = 'rejected';
            });
        });

        it('should return only transer reasons', function() {
            reasonAssignmentsDeferred.resolve(reasonAssignments);
            $rootScope.$apply();

            expect(result).toEqual([reasons[0], reasons[1]]);
        });

        it('should call validReasonResourceMock query method with proper parameters', function() {
            expect(validReasonResourceMock.query).toHaveBeenCalledWith(programId, facilityTypeId, 'DEBIT');
        });

        it('should reject promise when service call fails', function() {
            reasonAssignmentsDeferred.reject();
            $rootScope.$apply();

            expect(error).not.toBeUndefined();
        });
    });

    describe('getReceiveReasons', function() {

        var result, error;

        beforeEach(function() {
            stockReasonsFactory.getReceiveReasons(programId, facilityTypeId)
            .then(function(response) {
                result = response;
            })
            .catch(function() {
                error = 'rejected';
            });
        });

        it('should return only transfer reasons', function() {
            reasonAssignmentsDeferred.resolve(reasonAssignments);
            $rootScope.$apply();

            expect(result).toEqual([reasons[0], reasons[1]]);
        });

        it('should call validReasonResourceMock query method with proper parameters', function() {
            expect(validReasonResourceMock.query).toHaveBeenCalledWith(programId, facilityTypeId, 'CREDIT');
        });

        it('should reject promise when service call fails', function() {
            reasonAssignmentsDeferred.reject();
            $rootScope.$apply();

            expect(error).not.toBe(undefined);
        });
    });

    describe('getAdjustmentReasons', function() {

        var result, error;

        beforeEach(function() {
            stockReasonsFactory.getAdjustmentReasons(programId, facilityTypeId)
            .then(function(response) {
                result = response;
            })
            .catch(function() {
                error = 'rejected';
            });
        });

        it('should return only adjustment reasons', function() {
            reasonAssignmentsDeferred.resolve(reasonAssignments);
            $rootScope.$apply();

            expect(result).toEqual([reasons[2]]);
        });

        it('should call validReasonResourceMock query method with proper parameters', function() {
            expect(validReasonResourceMock.query).toHaveBeenCalledWith(programId, facilityTypeId, undefined);
        });

        it('should reject promise when service call fails', function() {
            reasonAssignmentsDeferred.reject();
            $rootScope.$apply();

            expect(error).not.toBeUndefined();
        });
    });
});
