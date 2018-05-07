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

describe("AdminReasonAddController", function() {

    var vm, reasonTypes, reasonCategories, validReasonResourceMock, $state, $controller, $q, $rootScope, programs,
        facilityTypes, duplicatedAssignment, notificationService, $stateParams, ProgramDataBuilder,
        FacilityTypeDataBuilder, ReasonDataBuilder, reasons, availableTags, stockReasonResourceMock;

    beforeEach(function() {
        module('admin-reason-add', function($provide) {
            stockReasonResourceMock = jasmine.createSpyObj('stockReasonResource', ['create']);
            $provide.factory('StockReasonResource', function() {
                return function() {
                    return stockReasonResourceMock;
                };
            });

            validReasonResourceMock = jasmine.createSpyObj('validReasonResource', ['create']);
            $provide.factory('ValidReasonResource', function() {
                return function() {
                    return validReasonResourceMock;
                };
            });
        });

        inject(function($injector) {
            $controller = $injector.get('$controller');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            notificationService = $injector.get('notificationService');
            $state = $injector.get('$state');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            FacilityTypeDataBuilder = $injector.get('FacilityTypeDataBuilder');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
        });

        spyOn(notificationService, 'success');
        spyOn($state, 'go');

        reasonTypes = ['CREDIT', 'DEBIT'];

        reasonCategories = ['AD_HOC', 'ADJUSTMENT'];

        $stateParams = {};

        programs = [
            new ProgramDataBuilder()
                .withId('fpId')
                .withName('Family Planning')
                .build(),
            new ProgramDataBuilder()
                .withId('emId')
                .withName('Essential Meds')
                .build(),
        ];

        facilityTypes = [
            new FacilityTypeDataBuilder()
                .withId('hcId')
                .withName('Health Center')
                .build(),
            new FacilityTypeDataBuilder()
                .withId('dcId')
                .withName('District Hospital')
                .build()
        ];

        reasons = [
            new ReasonDataBuilder().buildTransferReason()
        ];

        duplicatedAssignment = {
            program: {
                id: programs[1].id
            },
            facilityType: {
                id: facilityTypes[1].id
            }
        };

        availableTags = ['TagOne', 'TagTwo', 'TagThree'];

        vm = $controller('AdminReasonAddController', {
            reasonTypes: reasonTypes,
            reasonCategories: reasonCategories,
            reasons: reasons,
            programs: programs,
            facilityTypes: facilityTypes,
            availableTags: availableTags
        });
    });

    describe('$onInit', function() {

        it('should init properly', function() {
            vm.$onInit();

            expect(vm.reason.isFreeTextAllowed).toBeFalsy();
            expect(vm.reason.reasonType).toEqual(reasonTypes[0]);
            expect(vm.reasonTypes).toEqual(reasonTypes);
            expect(vm.reasonCategories).toEqual(reasonCategories);
            expect(vm.programs).toEqual(programs);
            expect(vm.facilityTypes).toEqual(facilityTypes);
            expect(vm.isValidReasonDuplicated).toBeFalsy();
            expect(vm.showReason).toBe(true);
            expect(vm.availableTags).toEqual(availableTags);
        });

    });

    describe('createReason', function() {

        var createdReason;

        beforeEach(function() {
            vm.$onInit();

            vm.reason = new ReasonDataBuilder()
                .withoutId()
                .buildCreditReason();

            createdReason = new ReasonDataBuilder()
                .buildCreditReason();

            stockReasonResourceMock.create.andReturn($q.when(createdReason));
        });

        it('should save reason when click add reason button', function() {
            vm.createReason();

            $rootScope.$apply();

            expect(stockReasonResourceMock.create).toHaveBeenCalledWith(vm.reason);
            expect($state.go).toHaveBeenCalledWith('openlmis.administration.reasons', $stateParams, {
                reload: true
            });
        });

        it('should save valid reason after reason', function() {
            var assignment = {
                program: programs[0],
                facilityType: facilityTypes[0]
            };
            vm.assignments = [assignment];

            validReasonResourceMock.create.andReturn($q.when(assignment));

            vm.createReason();
            $rootScope.$apply();

            expect(stockReasonResourceMock.create).toHaveBeenCalledWith(vm.reason);
            expect(validReasonResourceMock.create).toHaveBeenCalledWith(assignment);
        });

    });

    describe('addAssignment', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should add assignment', function() {
            vm.selectedProgram = programs[0];
            vm.selectedFacilityType = facilityTypes[0];
            vm.showReason = true;

            vm.assignments = [];
            vm.addAssignment();

            expect(vm.selectedProgram).toEqual(undefined);
            expect(vm.selectedFacilityType).toEqual(undefined);
            expect(vm.isValidReasonDuplicated).toBeFalsy();
            expect(vm.assignments).toEqual([{
                program: {
                    id: programs[0].id
                },
                facilityType: {
                    id: facilityTypes[0].id
                },
                hidden: false
            }]);
        });

        it('should set hidden as false after add assignment when showReason is true', function() {
            vm.selectedProgram = programs[0];
            vm.selectedFacilityType = facilityTypes[0];
            vm.showReason = true;

            vm.assignments = [];
            vm.addAssignment();

            expect(vm.assignments).toEqual([{
                program: {
                    id: programs[0].id
                },
                facilityType: {
                    id: facilityTypes[0].id
                },
                hidden: false
            }]);
        });

        it('should set hidden as true after add assignment when showReason is false', function() {
            vm.selectedProgram = programs[0];
            vm.selectedFacilityType = facilityTypes[0];
            vm.showReason = false;

            vm.assignments = [];
            vm.addAssignment();

            expect(vm.assignments).toEqual([{
                program: {
                    id: programs[0].id
                },
                facilityType: {
                    id: facilityTypes[0].id
                },
                hidden: true
            }]);
        });

        it('should not add assignment if duplicated', function() {
            vm.selectedProgram = programs[1];
            vm.selectedFacilityType = facilityTypes[1];

            vm.assignments = [duplicatedAssignment];
            vm.addAssignment();

            expect(vm.isValidReasonDuplicated).toBeTruthy();
            expect(vm.assignments).toEqual([duplicatedAssignment]);
        });

    });

    describe('removeAssignment', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should remove assignment', function() {
            var assignmentOne = "one";
            var assignmentTwo = "two";
            vm.assignments = [assignmentOne, assignmentTwo];

            vm.removeAssignment(assignmentOne);

            expect(vm.assignments.length).toEqual(1);
            expect(vm.assignments[0]).toEqual(assignmentTwo);
        });

    });

    describe('getProgramName', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should get program name by id', function() {
            expect(vm.getProgramName("fpId")).toEqual("Family Planning");
        });

        it('should not get program name by id if not exist', function() {
            expect(vm.getProgramName("notExistingProgramId")).toEqual(undefined);
        });

    });

    describe('getFacilityTypeName', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should get facility type name by id', function() {
            expect(vm.getFacilityTypeName("hcId")).toEqual("Health Center");
        });

        it('should not get facility type name by id if not exist', function() {
            expect(vm.getFacilityTypeName("notExistingFTId")).toEqual(undefined);
        });

    });

    describe('validateReasonName', function() {

        beforeEach(function() {
            vm.$onInit();
        });
    
        it('should return undefined if the reason name is empty', function() {
            vm.reason.name = undefined;

            expect(vm.validateReasonName()).toBeUndefined();
        });

        it('should return message key if reason name is duplicated', function() {
            vm.reason.name = reasons[0].name;

            expect(vm.validateReasonName()).toEqual('adminReasonAdd.reasonNameDuplicated');
        });

        it('should return undefined if reason name is not duplicated', function() {
            vm.reason.name = 'Some different reason name';

            expect(vm.validateReasonName()).toBeUndefined();
        });
    
    });

});