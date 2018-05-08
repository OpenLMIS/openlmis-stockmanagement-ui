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

describe('AdminReasonAddController', function() {

    var vm, reasonTypes, reasonCategories, $controller, programs, reason, $rootScope, facilityTypes, ProgramDataBuilder,
        FacilityTypeDataBuilder, ReasonDataBuilder, reasons, availableTags, REASON_CATEGORIES, REASON_TYPES, $q;

    beforeEach(function() {
        module('admin-reason-add');

        inject(function($injector) {
            $q = $injector.get('$q');
            $controller = $injector.get('$controller');
            $rootScope = $injector.get('$rootScope');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            FacilityTypeDataBuilder = $injector.get('FacilityTypeDataBuilder');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            REASON_CATEGORIES = $injector.get('REASON_CATEGORIES');
            REASON_TYPES = $injector.get('REASON_TYPES');
        });

        reasonTypes = [REASON_TYPES.CREDIT, REASON_TYPES.DEBIT];

        reasonCategories = [REASON_CATEGORIES.TRANSFER, REASON_CATEGORIES.ADJUSTMENT];

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
            new ReasonDataBuilder().buildTransferReason(),
            new ReasonDataBuilder().buildTransferReason()
        ];

        reason = new ReasonDataBuilder().buildTransferReason();

        availableTags = ['TagOne', 'TagTwo', 'TagThree'];

        vm = $controller('AdminReasonAddController', {
            reasonTypes: reasonTypes,
            reasonCategories: reasonCategories,
            reasons: reasons,
            programs: programs,
            facilityTypes: facilityTypes,
            availableTags: availableTags,
            reason: reason
        });
    });

    describe('$onInit', function() {

        it('should init properly', function() {
            vm.$onInit();

            expect(vm.reason).toEqual(reason);
            expect(vm.reasonTypes).toEqual(reasonTypes);
            expect(vm.reasonCategories).toEqual(reasonCategories);
            expect(vm.programs).toEqual(programs);
            expect(vm.facilityTypes).toEqual(facilityTypes);
            expect(vm.showReason).toBe(true);
            expect(vm.availableTags).toEqual(availableTags);
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

    describe('addAssignment', function() {

        beforeEach(function() {
            vm.$onInit();
            spyOn(reason, 'addAssignment');
        });
    
        it('should clear form after assignment was added', function() {
            reason.addAssignment.andReturn($q.resolve());

            vm.selectedProgram = vm.programs[0];
            vm.selectedFacilityType = vm.facilityTypes[0];
            vm.showReason = false;

            vm.addAssignment();
            
            expect(vm.selectedProgram).toEqual(vm.programs[0]);
            expect(vm.selectedFacilityType).toEqual(vm.facilityTypes[0]);
            expect(vm.showReason).toEqual(false);

            $rootScope.$apply();

            expect(vm.selectedProgram).toBeUndefined();
            expect(vm.selectedFacilityType).toBeUndefined();
            expect(vm.showReason).toEqual(true);
        });

        it('should not clear form if assignment failed to be added', function() {
            reason.addAssignment.andReturn($q.reject());

            vm.selectedProgram = vm.programs[0];
            vm.selectedFacilityType = vm.facilityTypes[0];
            vm.showReason = false;

            vm.addAssignment();
            $rootScope.$apply();

            expect(vm.selectedProgram).toEqual(vm.programs[0]);
            expect(vm.selectedFacilityType).toEqual(vm.facilityTypes[0]);
            expect(vm.showReason).toEqual(false);
        });
    
    });

});