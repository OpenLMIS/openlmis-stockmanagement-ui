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

describe('openlmis.stockmanagement.kitunpack.creation state', function() {

    var UserDataBuilder, ProgramDataBuilder, ReasonDataBuilder, FacilityDataBuilder;

    beforeEach(function() {
        module('stock-unpack-kit-creation', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });
        module('stock-unpack-kit', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            UserDataBuilder = $injector.get('UserDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');

            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$rootScope = $injector.get('$rootScope');
            this.$templateCache = $injector.get('$templateCache');
            this.$location = $injector.get('$location');
            this.STOCKMANAGEMENT_RIGHTS = $injector.get('STOCKMANAGEMENT_RIGHTS');
            this.SEARCH_OPTIONS = $injector.get('SEARCH_OPTIONS');
            this.ADJUSTMENT_TYPE = $injector.get('ADJUSTMENT_TYPE');
            this.authorizationService =  $injector.get('authorizationService');
            this.facilityFactory = $injector.get('facilityFactory');
            this.programService = $injector.get('programService');
            this.existingStockOrderableGroupsFactory = $injector.get('existingStockOrderableGroupsFactory');
            this.registerDisplayItemsService = $injector.get('registerDisplayItemsService');
            this.stockReasonsFactory = $injector.get('stockReasonsFactory');
            this.paginationService = $injector.get('paginationService');
            this.stockProgramUtilService = $injector.get('stockProgramUtilService');
            this.registerDisplayItemsService = $injector.get('registerDisplayItemsService');
            this.orderableGroupService = $injector.get('orderableGroupService');
            this.OrderableGroupDataBuilder = $injector.get('OrderableGroupDataBuilder');
        });

        this.program = new ProgramDataBuilder().build();
        this.homeFacility = new FacilityDataBuilder()
            .build();
        this.user = new UserDataBuilder()
            .withHomeFacilityId(this.homeFacility.id)
            .build();
        this.unpackReasons = [
            new ReasonDataBuilder().build(),
            new ReasonDataBuilder().build()
        ];

        spyOn(this.facilityFactory, 'getUserHomeFacility').andReturn(this.$q.resolve(this.homeFacility));
        spyOn(this.stockProgramUtilService, 'getPrograms').andReturn(this.$q.resolve(this.programs));
        spyOn(this.existingStockOrderableGroupsFactory, 'getGroupsWithNotZeroSoh').andReturn(this.$q.resolve([]));
        spyOn(this.stockReasonsFactory, 'getUnpackReasons').andReturn(this.$q.resolve(this.unpackReasons));
        spyOn(this.programService, 'get').andReturn(this.$q.resolve(this.program));
        spyOn(this.$templateCache, 'get').andCallThrough();
        spyOn(this.authorizationService, 'getUser').andReturn(this.$q.resolve(this.user));
        spyOn(this.orderableGroupService, 'getKitOnlyOrderablegroup').andCallThrough();

        this.state = this.$state.get('openlmis.stockmanagement.kitunpack.creation');

        this.goToUrl = goToUrl;
        this.getResolvedValue = getResolvedValue;
    });

    describe('state', function() {

        it('should get current state name', function() {
            expect(this.$state.current.name).not.toEqual('openlmis.stockmanagement.kitunpack.creation');

            this.goToUrl('stockmanagement/unpack/3/create?page=0&size=10');

            expect(this.$state.current.name).toEqual('openlmis.stockmanagement.kitunpack.creation');
        });

        it('should resolve user', function() {
            this.goToUrl('stockmanagement/unpack/3/create?page=0&size=10');

            expect(this.getResolvedValue('user')).toEqual(this.user);
        });

        it('should resolve program', function() {
            this.goToUrl('stockmanagement/unpack/3/create?page=0&size=10');

            expect(this.getResolvedValue('program')).toEqual(this.program);
        });

        it('should resolve program from stateParam if it is already set ', function() {
            this.$state.program = this.program;

            this.goToUrl('stockmanagement/unpack/3/create?page=0&size=10');

            expect(this.getResolvedValue('program')).toEqual(this.$state.program);
        });

        it('should resolve facility', function() {
            this.goToUrl('stockmanagement/unpack/3/create?page=0&size=10');

            expect(this.getResolvedValue('facility')).toEqual(this.homeFacility);
        });

        it('should resolve facility from stateParam if it is already set ', function() {
            this.$state.facility = this.homeFacility;

            this.goToUrl('stockmanagement/unpack/3/create?page=0&size=10');

            expect(this.getResolvedValue('facility')).toEqual(this.$state.facility);
        });

        it('should resolve unpack reasons', function() {
            this.goToUrl('stockmanagement/unpack/3/create?page=0&size=10');

            expect(this.getResolvedValue('reasons')).toEqual(this.unpackReasons);
        });

        it('should resolve reasons from stateParam if it is already set ', function() {
            this.$state.reasons = this.unpackReasons;

            this.goToUrl('stockmanagement/unpack/3/create?page=0&size=10');

            expect(this.getResolvedValue('reasons')).toEqual(this.$state.reasons);
        });

        it('should resolve srcDstAssignments and value should empty for unpacking', function() {
            this.goToUrl('stockmanagement/unpack/3/create?page=0&size=10');

            expect(this.getResolvedValue('srcDstAssignments')).toEqual(null);
        });

        it('should resolve adjustmentType to ADJUSTMENT_TYPE.KIT_UNPACK', function() {
            this.goToUrl('stockmanagement/unpack/3/create?page=0&size=10');

            expect(this.getResolvedValue('adjustmentType')).toEqual(this.ADJUSTMENT_TYPE.KIT_UNPACK);
        });

        it('should call getKitOnlyOrderablegroup', function() {
            this.goToUrl('stockmanagement/unpack/3/create?page=0&size=10');

            expect(this.orderableGroupService.getKitOnlyOrderablegroup).toHaveBeenCalled();
        });
    });

    function getResolvedValue(name) {
        return this.$state.$current.locals.globals[name];
    }

    function goToUrl(url) {
        this.$location.url(url);
        this.$rootScope.$apply();
    }
});