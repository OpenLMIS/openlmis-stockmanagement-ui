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

  var q, rootScope, vm, reasonTypes, reasonCategories, reasonService, modalDeferred;

  beforeEach(function () {

    module('admin-reason-form-modal');

    inject(
      function (_$controller_, _$q_, _$rootScope_, _messageService_, _notificationService_,
                _loadingModalService_) {
        q = _$q_;
        rootScope = _$rootScope_;
        reasonTypes = ['CREDIT', 'DEBIT'];
        reasonCategories = ['AD_HOC', 'ADJUSTMENT'];
        var reasons = [{name: 'Transfer In'}];
        reasonService = jasmine.createSpyObj('reasonService', ['createReason']);
        modalDeferred = q.defer();

        vm = _$controller_('ReasonFormModalController', {
          reasonTypes: reasonTypes,
          reasonCategories: reasonCategories,
          reasons: reasons,
          reasonService: reasonService,
          modalDeferred: modalDeferred,
          notificationService: _notificationService_,
          loadingModalService: _loadingModalService_,
          messageService: _messageService_
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

    var deferred = q.defer();
    deferred.resolve(createdReason);
    reasonService.createReason.andReturn(deferred.promise);

    spyOn(modalDeferred, 'resolve');

    vm.createReason();

    rootScope.$apply();

    expect(reasonService.createReason).toHaveBeenCalledWith(vm.reason);
    expect(modalDeferred.resolve).toHaveBeenCalledWith(createdReason);
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

