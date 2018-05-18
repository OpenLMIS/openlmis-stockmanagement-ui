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

describe('Reason', function() {

    var ReasonDataBuilder, ValidReasonAssignmentDataBuilder, Reason, reason, repositoryMock, json, $rootScope, $q;

    beforeEach(function () {
        module('stock-reason');

        inject(function ($injector) {
            $q = $injector.get('$q');
            Reason = $injector.get('Reason');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            ValidReasonAssignmentDataBuilder = $injector.get('ValidReasonAssignmentDataBuilder');
            $rootScope = $injector.get('$rootScope');
        });

        repositoryMock = jasmine.createSpyObj('StockReasonRepository', ['create', 'update']);

        json = new ReasonDataBuilder()
            .withAssignments([
                new ValidReasonAssignmentDataBuilder().build(),
                new ValidReasonAssignmentDataBuilder().build()
            ])
            .buildJson();
    });

    describe('constructor', function() {
    
        it('should set properties if json is given', function() {
            var result = new Reason(json, repositoryMock);

            expect(result.id).toEqual(json.id);
            expect(result.name).toEqual(json.name);
            expect(result.reasonType).toEqual(json.reasonType);
            expect(result.reasonCategory).toEqual(json.reasonCategory);
            expect(result.isFreeTextAllowed).toEqual(json.isFreeTextAllowed);
            expect(result.tags).toEqual(json.tags);
            expect(result.assignments).toEqual(json.assignments);
            expect(result.repository).toBe(repositoryMock);
            expect(result.addedAssignments).toEqual([]);
            expect(result.removedAssignments).toEqual([]);
        });

        it('should set properties if json is given', function() {
            var result = new Reason();

            expect(result.id).toBeUndefined();
            expect(result.name).toBeUndefined();
            expect(result.reasonType).toBeUndefined();
            expect(result.reasonCategory).toBeUndefined();
            expect(result.isFreeTextAllowed).toBe(false);
            expect(result.tags).toEqual([]);
            expect(result.assignments).toEqual([]);
            expect(result.repository).toBeUndefined();
            expect(result.addedAssignments).toEqual([]);
            expect(result.removedAssignments).toEqual([]);
        });
    
    });

    describe('isPhysicalReason', function () {

        it('should return true if reason category is Physical Inventory', function () {
            var reason = new ReasonDataBuilder().buildPhysicalInventoryReason();
            expect(reason.isPhysicalReason()).toBe(true);
        });

        it('should return false if reason category is not Physical Inventory', function () {
            var reason = new ReasonDataBuilder().buildTransferReason();
            expect(reason.isPhysicalReason()).toBe(false);

            reason = new ReasonDataBuilder().buildAdjustmentReason();
            expect(reason.isPhysicalReason()).toBe(false);
        });
    });

    describe('addAssignment', function() {

        beforeEach(function() {
            reason = new Reason(json, repositoryMock);
        });
    
        it('should reject if assignment already exist', function() {
            var result;
            reason.addAssignment(reason.assignments[0])
            .catch(function(error) {
                result = error;
            });
            $rootScope.$apply();

            expect(result).toEqual('adminReasonAdd.validReasonDuplicated');
        });

        it('should add assignment if it is not duplicate', function() {
            var assignment = new ValidReasonAssignmentDataBuilder().build();

            reason.addAssignment(assignment);
            $rootScope.$apply();

            expect(reason.assignments.length).toBe(3);
            expect(reason.assignments[2].program).toEqual(assignment.program);
            expect(reason.assignments[2].facilityType).toEqual(assignment.facilityType);
        });

        it('should remove assignment from removed if it was previously removed', function() {
            var assignment = new ValidReasonAssignmentDataBuilder().build();
            reason.removedAssignments = [assignment];

            reason.addAssignment(assignment);
            $rootScope.$apply();

            expect(reason.assignments.length).toBe(3);
            expect(reason.addedAssignments.length).toBe(0);
            expect(reason.removedAssignments.length).toBe(0);
        });


        it('should add assignment to added and remove from removed if it was updated', function() {
            var assignment = new ValidReasonAssignmentDataBuilder().build();
            reason.removedAssignments = [assignment];

            var updatedAssignment = angular.copy(assignment);
            updatedAssignment.hidden = true;

            reason.addAssignment(updatedAssignment);
            $rootScope.$apply();

            expect(reason.assignments.length).toBe(3);
            expect(reason.addedAssignments.length).toBe(1);
            expect(reason.removedAssignments.length).toBe(0);

            expect(reason.assignments[2].program).toEqual(updatedAssignment.program);
            expect(reason.assignments[2].facilityType).toEqual(updatedAssignment.facilityType);
            expect(reason.assignments[2].hidden).toEqual(updatedAssignment.hidden);
        });
    
    });

    describe('removeAssignment', function() {

        beforeEach(function() {
            reason = new Reason(json, repositoryMock);
        });
    
        it('should resolve when assignment was remove successfully', function() {
            reason.removeAssignment(reason.assignments[0]);
            $rootScope.$apply();

            expect(reason.assignments.length).toBe(1);
        });

        it('should remove assignment from added if it was previously added', function() {
            reason.addedAssignments = [reason.assignments[0]];
            reason.removeAssignment(reason.assignments[0]);
            $rootScope.$apply();

            expect(reason.assignments.length).toBe(1);
            expect(reason.addedAssignments.length).toBe(0);
            expect(reason.removedAssignments.length).toBe(0);
        });

        it('should return resolved promise if remove was successful', function() {
            var resolved;
            reason.removeAssignment(reason.assignments[0])
            .then(function() {
                resolved = true;
            });
            $rootScope.$apply();

            expect(resolved).toBe(true);
        });

        it('should return rejected promise if trying to remove non-existent assignment', function() {
            var result;
            reason.removeAssignment(new ValidReasonAssignmentDataBuilder().build())
            .catch(function(error) {
                result = error;
            });
            $rootScope.$apply();

            expect(result).toBe('The given assignment is not on the list');
        });
    
    });

    describe('save', function() {

        beforeEach(function() {
            json = new ReasonDataBuilder()
                .withoutId()
                .withAssignments([
                    new ValidReasonAssignmentDataBuilder().build(),
                    new ValidReasonAssignmentDataBuilder().build()
                ])
                .buildJson();
            reason = new Reason(json, repositoryMock);
        });
    
        it('should reject if repository rejects', function() {
            var error = 'Reason for rejection';

            repositoryMock.create.andReturn($q.reject(error));

            var result;
            reason.save()
            .catch(function(error) {
                result = error;
            });
            $rootScope.$apply();

            expect(result).toEqual(error);
        });

        it('should call create method from repository', function() {
            var createdReason = new ReasonDataBuilder().withoutId().build();
            
            repositoryMock.create.andReturn($q.resolve(createdReason));

            var result;
            reason.save()
            .then(function(reason) {
                result = reason;
            });
            $rootScope.$apply();

            expect(result).toEqual(createdReason);
        });

        it('should call update method from repository', function() {
            json = new ReasonDataBuilder()
                .withAssignments([
                    new ValidReasonAssignmentDataBuilder().build(),
                    new ValidReasonAssignmentDataBuilder().build()
                ])
                .buildJson();

            reason = new Reason(json, repositoryMock);
            var updatedReason = new ReasonDataBuilder().build();

            repositoryMock.update.andReturn($q.resolve(updatedReason));

            var result;
            reason.save()
            .then(function(reason) {
                result = reason;
            });
            $rootScope.$apply();

            expect(result).toEqual(updatedReason);
        });
    
    });
});