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

describe("PhysicalInventoryController", function () {

  var vm, q, rootScope, facility, programs, loadingModalService, messageService, physicalInventoryService;

  beforeEach(function () {

    module('physical-inventory');

    inject(function (_loadingModalService_, _messageService_, _physicalInventoryService_, $controller, $q, $rootScope) {

      messageService = _messageService_;
      loadingModalService = _loadingModalService_;
      physicalInventoryService = _physicalInventoryService_;
      q = $q;
      rootScope = $rootScope;

      programs = [{name: 'HIV', id: '1'}, {name: 'TB', id: '2'}];
      facility = {
        id: "10134",
        name: "National Warehouse",
        supportedPrograms: programs
      };
      spyOn(physicalInventoryService, 'getDrafts').andReturn(q.when([[{"programId": '1'}], [{"programId": '2'}]]));

      vm = $controller('PhysicalInventoryController', {
        facility: facility,
        programs: programs,
        physicalInventoryService: _physicalInventoryService_,
        messageService: messageService,
        loadingModalService: loadingModalService
      });
    });
  });

  it("should init programs and physical inventory drafts properly", function () {
    rootScope.$apply();

    expect(vm.programs).toEqual(programs);
    expect(physicalInventoryService.getDrafts).toHaveBeenCalledWith(['1', '2'], '10134');
    expect(vm.drafts).toEqual([{programId: '1'}, {programId: '2'}]);
  });

  it("should get program name by id", function () {
    expect(vm.getProgramName('1')).toEqual('HIV');
    expect(vm.getProgramName('2')).toEqual('TB');
  });

  it("should get physical inventory draft status", function () {
    expect(vm.getDraftStatus(true)).toEqual('msg.physicalInventory.not.started');
    expect(vm.getDraftStatus(false)).toEqual('msg.physicalInventory.draft');
  });
});
