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

    var validReasonResourceMock, reasonsStorage;

    beforeEach(function() {
        module('stock-reasons-modal', function($provide) {
            validReasonResourceMock = jasmine.createSpyObj('validReasonResource', ['query']);
            reasonsStorage = jasmine.createSpyObj('offlineReasons', ['search', 'getAll', 'put']);
            reasonsStorage.getAll.andReturn([false]);

            $provide.factory('ValidReasonResource', function() {
                return function() {
                    return validReasonResourceMock;
                };
            });

            $provide.factory('localStorageFactory', function() {
                return jasmine.createSpy('localStorageFactory').andReturn(reasonsStorage);
            });
        });

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.stockReasonsFactory = $injector.get('stockReasonsFactory');
            this.offlineService = $injector.get('offlineService');
            this.alertService = $injector.get('alertService');
        });

        this.reasons = [{
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
        }, {
            id: 'reason-five',
            name: 'Reason five',
            reasonCategory: 'AGGREGATION'
        }];

        this.reasonAssignments = [{
            id: 'valid-reason-one',
            programId: this.programId,
            facilityTypeId: this.facilityTypeId,
            reason: this.reasons[2],
            hidden: false
        }, {
            id: 'valid-reason-two',
            programId: this.programId,
            facilityTypeId: this.facilityTypeId,
            reason: this.reasons[0],
            hidden: false
        }, {
            id: 'valid-reason-three',
            programId: this.programId,
            facilityTypeId: this.facilityTypeId,
            reason: this.reasons[1],
            hidden: false
        }, {
            id: 'hidden-valid-reason',
            programId: this.programId,
            facilityTypeId: this.facilityTypeId,
            reason: this.reasons[3],
            hidden: true
        }, {
            id: 'valid-reason-five',
            programId: this.programId,
            facilityTypeId: this.facilityTypeId,
            reason: this.reasons[4],
            hidden: false
        }];

        this.programId = 'program-id';
        this.facilityTypeId = 'facility-type-id';

        this.reasonAssignmentsDeferred = this.$q.defer();

        validReasonResourceMock.query.andReturn(this.reasonAssignmentsDeferred.promise);
        reasonsStorage.search.andReturn(this.reasonAssignmentsDeferred.promise);
        spyOn(this.offlineService, 'isOffline').andReturn(false);
        spyOn(this.alertService, 'error');
    });

    describe('getReasons', function() {

        var result, error;

        beforeEach(function() {
            this.stockReasonsFactory.getReasons(this.programId, this.facilityTypeId, ['DEBIT', 'CREDIT'])
                .then(function(response) {
                    result = response;
                })
                .catch(function() {
                    error = 'rejected';
                });
        });

        it('should not return duplicates', function() {
            this.reasonAssignments.push({
                id: 'valid-reason-four',
                programId: this.programId,
                facilityTypeId: this.facilityTypeId,
                reason: this.reasons[0],
                hidden: false
            });

            this.reasonAssignmentsDeferred.resolve(this.reasonAssignments);
            this.$rootScope.$apply();

            expect(result).toEqual([
                this.reasons[2], this.reasons[0], this.reasons[1], this.reasons[4]
            ]);
        });

        it('should return only not hidden reasons', function() {
            this.reasonAssignmentsDeferred.resolve(this.reasonAssignments);
            this.$rootScope.$apply();

            expect(result).toEqual([
                this.reasons[2], this.reasons[0], this.reasons[1], this.reasons[4]
            ]);
        });

        it('should pass facility type and program IDs to the service', function() {
            expect(validReasonResourceMock.query).toHaveBeenCalledWith({
                program: this.programId,
                facilityType: this.facilityTypeId,
                reasonType: ['DEBIT', 'CREDIT']
            });
        });

        it('should reject promise if request failed', function() {
            this.reasonAssignmentsDeferred.reject();
            this.$rootScope.$apply();

            expect(error).not.toBeUndefined();
        });
    });

    describe('getReasons offline', function() {

        it('should get cached reasons if in offline mode', function() {
            this.offlineService.isOffline.andReturn(true);
            var result;

            this.stockReasonsFactory.getReasons(this.programId, this.facilityTypeId, ['DEBIT', 'CREDIT'])
                .then(function(response) {
                    result = response;
                });

            this.reasonAssignmentsDeferred.resolve(this.reasonAssignments);
            this.$rootScope.$apply();

            expect(this.offlineService.isOffline).toHaveBeenCalled();
            expect(this.alertService.error).not.toHaveBeenCalled();

            expect(reasonsStorage.search).toHaveBeenCalledWith({
                programId: this.programId,
                facilityType: this.facilityTypeId,
                reasonType: ['DEBIT', 'CREDIT']
            });

            expect(result).toEqual([
                this.reasons[2], this.reasons[0], this.reasons[1], this.reasons[4]
            ]);
        });

        it('should reject if reasons not found in local storage', function() {
            this.offlineService.isOffline.andReturn(true);

            reasonsStorage.search.andReturn([]);
            this.stockReasonsFactory.getReasons(this.programId, this.facilityTypeId, ['DEBIT', 'CREDIT']);

            this.$rootScope.$apply();

            expect(this.offlineService.isOffline).toHaveBeenCalled();
            expect(this.alertService.error).toHaveBeenCalled();
        });
    });

    describe('getIssueReasons', function() {

        var result, error;

        beforeEach(function() {
            this.stockReasonsFactory.getIssueReasons(this.programId, this.facilityTypeId)
                .then(function(response) {
                    result = response;
                })
                .catch(function() {
                    error = 'rejected';
                });
        });

        it('should return only transer reasons', function() {
            this.reasonAssignmentsDeferred.resolve(this.reasonAssignments);
            this.$rootScope.$apply();

            expect(result).toEqual([this.reasons[0], this.reasons[1]]);
        });

        it('should call validReasonResourceMock query method with proper parameters', function() {
            expect(validReasonResourceMock.query).toHaveBeenCalledWith({
                program: this.programId,
                facilityType: this.facilityTypeId,
                reasonType: 'DEBIT'
            });
        });

        it('should reject promise when service call fails', function() {
            this.reasonAssignmentsDeferred.reject();
            this.$rootScope.$apply();

            expect(error).not.toBeUndefined();
        });
    });

    describe('getReceiveReasons', function() {

        var result, error;

        beforeEach(function() {
            this.stockReasonsFactory.getReceiveReasons(this.programId, this.facilityTypeId)
                .then(function(response) {
                    result = response;
                })
                .catch(function() {
                    error = 'rejected';
                });
        });

        it('should return only transfer reasons', function() {
            this.reasonAssignmentsDeferred.resolve(this.reasonAssignments);
            this.$rootScope.$apply();

            expect(result).toEqual([this.reasons[0], this.reasons[1]]);
        });

        it('should call validReasonResourceMock query method with proper parameters', function() {
            expect(validReasonResourceMock.query).toHaveBeenCalledWith({
                program: this.programId,
                facilityType: this.facilityTypeId,
                reasonType: 'CREDIT'
            });
        });

        it('should reject promise when service call fails', function() {
            this.reasonAssignmentsDeferred.reject();
            this.$rootScope.$apply();

            expect(error).not.toBe(undefined);
        });
    });

    describe('getAdjustmentReasons', function() {

        var result, error;

        beforeEach(function() {
            this.stockReasonsFactory.getAdjustmentReasons(this.programId, this.facilityTypeId)
                .then(function(response) {
                    result = response;
                })
                .catch(function() {
                    error = 'rejected';
                });
        });

        it('should return only adjustment reasons', function() {
            this.reasonAssignmentsDeferred.resolve(this.reasonAssignments);
            this.$rootScope.$apply();

            expect(result).toEqual([this.reasons[2]]);
        });

        it('should call validReasonResourceMock query method with proper parameters', function() {
            expect(validReasonResourceMock.query).toHaveBeenCalledWith({
                program: this.programId,
                facilityType: this.facilityTypeId,
                reasonType: undefined
            });
        });

        it('should reject promise when service call fails', function() {
            this.reasonAssignmentsDeferred.reject();
            this.$rootScope.$apply();

            expect(error).not.toBeUndefined();
        });
    });

    describe('getUnpackReasons', function() {

        var result, error;

        beforeEach(function() {
            this.stockReasonsFactory.getUnpackReasons(this.programId, this.facilityTypeId)
                .then(function(response) {
                    result = response;
                })
                .catch(function() {
                    error = 'rejected';
                });
        });

        it('should return only Unpack reasons', function() {
            this.reasonAssignmentsDeferred.resolve(this.reasonAssignments);
            this.$rootScope.$apply();

            expect(result).toEqual([this.reasons[4]]);
        });

        it('should call validReasonResource query method with proper parameters', function() {
            expect(validReasonResourceMock.query).toHaveBeenCalledWith({
                program: this.programId,
                facilityType: this.facilityTypeId,
                reasonType: undefined
            });
        });

        it('should reject promise when service call fails', function() {
            this.reasonAssignmentsDeferred.reject();
            this.$rootScope.$apply();

            expect(error).not.toBeUndefined();
        });
    });
});
