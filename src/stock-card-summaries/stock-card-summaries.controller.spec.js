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

xdescribe("RequisitionInitiateController", function(){

    var $q, programs, rootScope, requisitionService, authorizationService, facilityService,
        periodFactory, $state, period, facility, REQUISITION_RIGHTS, userRightFactoryMock, hasRight,
        loadingModalService;

    beforeEach(function() {

        module('stock-card-summaries');

        inject(function (_$q_, $rootScope, $controller, _periodFactory_,
            _$state_, _requisitionService_, _authorizationService_, _facilityService_,
            _REQUISITION_RIGHTS_, _loadingModalService_) {

            rootScope = $rootScope;
            periodFactory =_periodFactory_;
            $state = _$state_;
            requisitionService = _requisitionService_;
            authorizationService = _authorizationService_;
            facilityService = _facilityService_;
            $q = _$q_;
            REQUISITION_RIGHTS = _REQUISITION_RIGHTS_;
            loadingModalService = _loadingModalService_;

            user = {"user_id": "user_id"};
            right = {"id": "right_id"};
            programs = [{"code": "HIV", "id": 1}, {"code": "programCode", "id": 2}];
            period = [{"id": 1, "rnrId": 123, "startDate": "01-01-2016", "endDate": "02-02-2016"}];
            facility = {
                "id": "10134",
                "name": "National Warehouse",
                "description": null,
                "code": "CODE",
                "supportedPrograms": programs
            };

            spyOn(periodFactory, 'get').andReturn($q.when(period));
            userRightFactoryMock = jasmine.createSpyObj('userRightFactory',  ['checkRightForCurrentUser']);
            userRightFactoryMock.checkRightForCurrentUser.andCallFake(function() {
                return $q.when(hasRight);
            });

            vm = $controller('RequisitionInitiateController', {facility: facility, user: user, supervisedPrograms: programs,
                homePrograms: programs, periodFactory: periodFactory, requisitionService: requisitionService, userRightFactory: userRightFactoryMock});
        });
    });


    it("should assign proper values when facility is assigned", function() {
        expect(vm.selectedFacilityId).toEqual(facility.id);
        expect(vm.programs).toEqual(programs);
        expect(vm.selectedProgramId).toEqual(undefined);
    });

    it("Should change page to requisitions.requisition for with selected period with rnrId", function() {
        var selectedPeriod = {"rnrId": 1};
        spyOn($state, 'go');

        vm.initRnr(selectedPeriod);

        expect($state.go).toHaveBeenCalledWith('requisitions.requisition.fullSupply', {rnr: 1});
    });

    it("Should change page to requisition full supply for newly initialized requisition in selected period", function() {
        var selectedPeriod = {"id":1};
        spyOn($state, 'go');
        spyOn(requisitionService, 'initiate').andReturn($q.when({"id": 1}));
        hasRight = true;
        vm.selectedProgramId = programs[0].id;

        vm.initRnr(selectedPeriod);
        rootScope.$apply();

        expect($state.go).toHaveBeenCalledWith('requisitions.requisition.fullSupply', {rnr: 1});
        expect(userRightFactoryMock.checkRightForCurrentUser).toHaveBeenCalledWith(REQUISITION_RIGHTS.REQUISITION_CREATE, programs[0].id, facility.id);
    });

    it("Should display error when user has no right to init requisition", function() {
        var selectedPeriod = {"id":1};
        spyOn($state, 'go');
        hasRight = false;
        vm.selectedProgramId = programs[0].id;

        vm.initRnr(selectedPeriod);
        rootScope.$apply();

        expect($state.go).not.toHaveBeenCalled();
        expect(userRightFactoryMock.checkRightForCurrentUser).toHaveBeenCalledWith(REQUISITION_RIGHTS.REQUISITION_CREATE, programs[0].id, facility.id);
    });

    it("Should not change page to requisitions.requisition with selected period without rnrId and when invalid response from service", function() {
        var selectedPeriod = {};
        spyOn(requisitionService,'initiate').andReturn($q.reject({"id": 1}));
        spyOn($state, 'go');

        vm.initRnr(selectedPeriod);
        rootScope.$apply();

        expect($state.go).not.toHaveBeenCalled();
    });

    it("Should open loading modal", function() {
        var selectedPeriod = {"id":1};
        spyOn(loadingModalService, 'open');

        vm.initRnr(selectedPeriod);

        expect(loadingModalService.open).toHaveBeenCalled();
    });

    it("Should reload periods with proper data", function() {
        vm.selectedProgramId = programs[0].id;
        vm.selectedFacilityId = facility.id;

        vm.loadPeriods();
        rootScope.$apply();

        expect(periodFactory.get).toHaveBeenCalled();
        expect(vm.periodGridData).toEqual(period);
    });

    it("should load proper data for supervised facility", function() {
        vm.updateFacilityType(true);

        expect(vm.facilities).toEqual([]);
        expect(vm.programs).toEqual(vm.supervisedPrograms);
        expect(vm.selectedFacilityId).toEqual(undefined);
    });

    it("should load proper data for home facility", function() {
        vm.updateFacilityType(false);

        expect(vm.facilities).toEqual([facility]);
        expect(vm.programs).toEqual(vm.homePrograms);
        expect(vm.selectedFacilityId).toEqual(facility.id);
    });

    it("should load list of facilities for selected program", function() {
        spyOn(facilityService, 'getUserSupervisedFacilities').andReturn([facility]);
        spyOn(authorizationService, 'getRightByName').andReturn(right);

        vm.loadFacilitiesForProgram(vm.supervisedPrograms[0]);

        expect(vm.facilities).toEqual([facility]);
    });

    it("should return empty list of facilities for undefined program", function() {
        vm.loadFacilitiesForProgram(undefined);

        expect(vm.facilities).toEqual([]);
    });

});
