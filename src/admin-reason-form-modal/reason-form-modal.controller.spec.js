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

describe("ReasonFormModalController", function () {

  var q, rootScope, vm, reasonTypes, reasonCategories, reasonService, validReasonService,
      modalDeferred, programs, facilityTypes, duplicatedAssignment;

  beforeEach(function () {

    module('admin-reason-form-modal');

    inject(
      function (_$controller_, _$q_, _$rootScope_, _messageService_, _notificationService_,
                _loadingModalService_) {
        q = _$q_;
        rootScope = _$rootScope_;
        reasonTypes = ['CREDIT', 'DEBIT'];
        reasonCategories = ['AD_HOC', 'ADJUSTMENT'];
        programs = [{name: 'Family Planning', id: 'fpId'}, {name: 'Essential Meds', id: 'emId'}];
        facilityTypes = [{name: 'Health Center', id: 'hcId'}, {name: 'District Hospital', id: 'dcId'}];
        reasonService = jasmine.createSpyObj('reasonService', ['createReason']);
        validReasonService = jasmine.createSpyObj('validReasonService', ['createValidReason']);
        modalDeferred = q.defer();
        spyOn(modalDeferred, 'resolve');

        duplicatedAssignment = {
            programId: programs[1].id,
            facilityTypeId: facilityTypes[1].id
        };

        var filter = jasmine.createSpy().andCallFake(function() {
            var id = arguments[1].id;
            if (id === 'fpId') {
                return [programs[0]]
            } else if (id === 'hcId') {
                return [facilityTypes[0]];
            } else if (arguments[1].programId === programs[1].id && arguments[1].facilityTypeId === facilityTypes[1].id) {
                return [duplicatedAssignment];
            } else {
                return [];
            }
        });

        vm = _$controller_('ReasonFormModalController', {
          reasonTypes: reasonTypes,
          reasonCategories: reasonCategories,
          reasons: [{name: 'Transfer In'}],
          reasonService: reasonService,
          validReasonService: validReasonService,
          modalDeferred: modalDeferred,
          notificationService: _notificationService_,
          loadingModalService: _loadingModalService_,
          messageService: _messageService_,
          programs: programs,
          facilityTypes: facilityTypes,
          $filter: jasmine.createSpy().andReturn(filter)
        });
      });
  });

  it('should init properly', function () {
    vm.$onInit();

    expect(vm.reason.isFreeTextAllowed).toBeFalsy();
    expect(vm.reason.reasonType).toEqual(reasonTypes[0]);
    expect(vm.reasonTypes).toEqual(reasonTypes);
    expect(vm.reasonCategories).toEqual(reasonCategories);
    expect(vm.isDuplicated).toBeFalsy();
    expect(vm.programs).toEqual(programs);
    expect(vm.facilityTypes).toEqual(facilityTypes);
    expect(vm.isValidReasonDuplicated).toBeFalsy();
  });

  it('should save reason when click add reason button', function () {
    vm.reason = {
      "name": "Test Reason",
      "reasonCategory": "AD_HOC",
      "reasonType": "CREDIT",
      "isFreeTextAllowed": false
    };

    var createdReason = {
      id: "1",
      name: "Test Reason",
      reasonCategory: "AD_HOC",
      reasonType: "CREDIT",
      isFreeTextAllowed: false
    };

    reasonService.createReason.andReturn(q.when(createdReason));

    vm.createReason();

    rootScope.$apply();

    expect(reasonService.createReason).toHaveBeenCalledWith(vm.reason);
    expect(modalDeferred.resolve).toHaveBeenCalledWith(createdReason);
  });

  it('should save valid reason after reason', function () {
    vm.reason = {
      "name": "Test Reason",
    };

    var createdReason = {
      id: "1",
      name: "Test Reason",
    };

    var assignment = {
            programId: programs[0].id,
            facilityTypeId: facilityTypes[0].id
        };
    vm.assignments = [assignment];

    reasonService.createReason.andReturn(q.when(createdReason));
    validReasonService.createValidReason.andReturn(q.when(assignment));

    vm.createReason();
    rootScope.$apply();

    expect(reasonService.createReason).toHaveBeenCalledWith(vm.reason);
    expect(modalDeferred.resolve).toHaveBeenCalledWith(createdReason);
    assignment.reason = {id: createdReason.id};
    expect(validReasonService.createValidReason).toHaveBeenCalledWith(assignment);
  });

  it('should add assignment', function() {
    vm.selectedProgram = programs[0];
    vm.selectedFacilityType = facilityTypes[0];

    vm.assignments = [];
    vm.addAssignment()

    var assignment = {
        programId: programs[0].id,
        facilityTypeId: facilityTypes[0].id
    };
    expect(vm.assignments).toEqual([assignment]);
    expect(vm.selectedProgram).toEqual(undefined);
    expect(vm.selectedFacilityType).toEqual(undefined);
    expect(vm.isValidReasonDuplicated).toBeFalsy();
  });

  it('should not add assignment if duplicated', function() {
    vm.selectedProgram = programs[1];
    vm.selectedFacilityType = facilityTypes[1];

    vm.assignments = [duplicatedAssignment];
    vm.addAssignment();

    expect(vm.isValidReasonDuplicated).toBeTruthy();
    expect(vm.assignments).toEqual([duplicatedAssignment]);
  });

  it('should remove assignment', function() {
      var assignmentOne = "one";
      var assignmentTwo = "two";
      vm.assignments = [assignmentOne, assignmentTwo];

      vm.removeAssignment(assignmentOne);

      expect(vm.assignments.length).toEqual(1);
      expect(vm.assignments[0]).toEqual(assignmentTwo);
  });


  it('should get program name by id', function () {
    expect(vm.getProgramName("fpId")).toEqual("Family Planning");
  });

  it('should not get program name by id if not exist', function () {
    expect(vm.getProgramName("notExistingProgramId")).toEqual(undefined);
  });

  it('should get facility type name by id', function () {
    expect(vm.getFacilityTypeName("hcId")).toEqual("Health Center");
  });

  it('should not get facility type name by id if not exist', function () {
    expect(vm.getFacilityTypeName("notExistingFTId")).toEqual(undefined);
  });

  describe('check duplication', function () {

    it('should be valid when reason name is empty', function () {
      vm.reason = {name: ''};

      vm.checkDuplication();

      expect(vm.isDuplicated).toBeFalsy();
    });

    it('should be valid when reason name is not duplicated', function () {
      vm.reason = {name: 'Transfer Out'};

      vm.checkDuplication();

      expect(vm.isDuplicated).toBeFalsy();
    });

    it('should be invalid when reason name is duplicated', function () {
      vm.reason = {name: 'Transfer In'};

      vm.checkDuplication();

      expect(vm.isDuplicated).toBeTruthy();
    });
  });

});

