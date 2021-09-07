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

describe('AdminReasonAddService', function() {

    var adminReasonAddService, AdminReasonAddService, notificationService, alertService, loadingModalService, $state,
        stockReasonRepositoryMock, ReasonMock, reasonMock, originalAddAssignment, originalSave, reason, $q, $rootScope,
        ValidReasonAssignmentDataBuilder, ReasonDataBuilder;

    beforeEach(function() {
        module('admin-reason-add', function($provide) {
            ReasonMock = jasmine.createSpy('Reason');
            $provide.factory('Reason', function() {
                return ReasonMock;
            });

            stockReasonRepositoryMock = jasmine.createSpyObj('stockReasonRepository', ['save', 'get']);
            $provide.factory('StockReasonRepository', function() {
                return function() {
                    return stockReasonRepositoryMock;
                };
            });
        });

        inject(function($injector) {
            AdminReasonAddService = $injector.get('AdminReasonAddService');
            ValidReasonAssignmentDataBuilder = $injector.get('ValidReasonAssignmentDataBuilder');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            notificationService = $injector.get('notificationService');
            alertService = $injector.get('alertService');
            loadingModalService = $injector.get('loadingModalService');
            $rootScope = $injector.get('$rootScope');
            $state = $injector.get('$state');
            $q = $injector.get('$q');
        });

        spyOn($state, 'go');
        spyOn(alertService, 'error');
        spyOn(loadingModalService, 'open');
        spyOn(loadingModalService, 'close');
        spyOn(notificationService, 'success');

        reasonMock = jasmine.createSpyObj('reason', ['save', 'addAssignment']);
        originalSave = reasonMock.save;
        originalAddAssignment = reasonMock.addAssignment;

        ReasonMock.and.returnValue(reasonMock);

        adminReasonAddService = new AdminReasonAddService();

        reason = adminReasonAddService.createReason();
    });

    describe('constructor', function() {

        it('should set repository', function() {
            expect(adminReasonAddService.repository).toBe(stockReasonRepositoryMock);
        });

    });

    describe('getReason', function() {

        it('should call repository get if reason already exists', function() {
            var result,
                json = new ReasonDataBuilder().buildJson();

            stockReasonRepositoryMock.get.and.returnValue($q.resolve(json));

            adminReasonAddService.getReason(json.id)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).not.toBeUndefined();
            expect(stockReasonRepositoryMock.get).toHaveBeenCalledWith(json.id);
        });

        it('should reject promise if reason id is undefined', function() {
            var rejected;

            adminReasonAddService.getReason()
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockReasonRepositoryMock.get).not.toHaveBeenCalled();
        });

        it('should decorate save', function() {
            reason = adminReasonAddService.getReason();

            expect(reason.save).not.toBe(originalSave);
        });

        it('should decorate addAssignment', function() {
            reason = adminReasonAddService.getReason();

            expect(reason.addAssignment).not.toBe(originalAddAssignment);
        });

    });

    describe('createReason', function() {

        it('should decorate save', function() {
            reason = adminReasonAddService.getReason();

            expect(reason.save).not.toBe(originalSave);
        });

        it('should decorate addAssignment', function() {
            reason = adminReasonAddService.getReason();

            expect(reason.addAssignment).not.toBe(originalAddAssignment);
        });

    });

    describe('decorated save', function() {

        it('should open loading modal', function() {
            originalSave.and.returnValue($q.resolve());

            reason.save();

            expect(loadingModalService.open).toHaveBeenCalled();
        });

        it('should leave closing loading modal to the state change', function() {
            originalSave.and.returnValue($q.resolve());

            reason.save();
            $rootScope.$apply();

            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

        it('should close loading modal on error', function() {
            originalSave.and.returnValue($q.reject());

            reason.save();

            expect(loadingModalService.close).not.toHaveBeenCalled();

            $rootScope.$apply();

            expect(loadingModalService.close).toHaveBeenCalled();
        });

        it('should show notification if save was successful', function() {
            originalSave.and.returnValue($q.resolve());

            reason.save();

            expect(notificationService.success).not.toHaveBeenCalled();

            $rootScope.$apply();

            expect(notificationService.success).toHaveBeenCalledWith('adminReasonAdd.reasonSavedSuccessfully');
        });

        it('should redirect user to parent state after save was successful', function() {
            originalSave.and.returnValue($q.resolve());

            reason.save();

            expect($state.go).not.toHaveBeenCalled();

            $rootScope.$apply();

            expect($state.go).toHaveBeenCalledWith('^', {}, {
                reload: true
            });
        });

        it('should not redirect use to parent state after save failed', function() {
            originalSave.and.returnValue($q.reject());

            reason.save();
            $rootScope.$apply();

            expect($state.go).not.toHaveBeenCalled();
        });

        it('should resolve to original save response', function() {
            var saveResult = {
                id: 'some-reason-id'
            };

            originalSave.and.returnValue($q.resolve(saveResult));

            var result;
            reason.save()
                .then(function(reason) {
                    result = reason;
                });
            $rootScope.$apply();

            expect(result).toBe(saveResult);
        });

        it('should reject to the original error', function() {
            var error = 'Original Error';

            originalSave.and.returnValue($q.reject(error));

            var result;
            reason.save()
                .catch(function(error) {
                    result = error;
                });
            $rootScope.$apply();

            expect(result).toBe(error);
        });

    });

    describe('decorated addAssignment', function() {

        var assignment;

        beforeEach(function() {
            assignment = new ValidReasonAssignmentDataBuilder().build();
        });

        it('should show alert if adding was unsuccessful', function() {
            var error = 'Some wild error';

            originalAddAssignment.and.returnValue($q.reject(error));

            reason.addAssignment(assignment);

            expect(alertService.error).not.toHaveBeenCalled();

            $rootScope.$apply();

            expect(alertService.error).toHaveBeenCalledWith(error);
        });

        it('should not show alert if adding was successful', function() {
            originalAddAssignment.and.returnValue($q.resolve());

            reason.addAssignment(assignment);
            $rootScope.$apply();

            expect(alertService.error).not.toHaveBeenCalled();
        });

        it('should reject to original error message', function() {
            var error = 'Some wild error';

            originalAddAssignment.and.returnValue($q.reject(error));

            var result;
            reason.addAssignment(assignment)
                .catch(function(error) {
                    result = error;
                });
            $rootScope.$apply();

            expect(result).toBe(error);
        });

        it('should resolve if adding was successful', function() {
            originalAddAssignment.and.returnValue($q.resolve());

            var resolved;
            reason.addAssignment(assignment)
                .then(function() {
                    resolved = true;
                });
            $rootScope.$apply();

            expect(resolved).toBe(true);
        });

    });

});
