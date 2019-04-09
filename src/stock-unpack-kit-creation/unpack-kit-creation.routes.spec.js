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

    var $state, $rootScope, $templateCache, FacilityDataBuilder,
        UserDataBuilder, ProgramDataBuilder, ReasonDataBuilder;

    beforeEach(function() {
        module('stock-unpack-kit-creation');
        module('stock-unpack-kit');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            $templateCache = $injector.get('$templateCache');
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            UserDataBuilder = $injector.get('UserDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
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
        });

        this.program = new ProgramDataBuilder().build();
        this.homeFacility = new FacilityDataBuilder()
            .build();
        this.user = new UserDataBuilder()
            .withHomeFacilityId(this.homeFacility.id)
            .build();
        this.unpackReasones = [
            new ReasonDataBuilder().build(),
            new ReasonDataBuilder().build()
        ];

        spyOn(this.facilityFactory, 'getUserHomeFacility').andReturn(this.$q.resolve(this.homeFacility));
        spyOn(this.stockProgramUtilService, 'getPrograms').andReturn(this.$q.resolve(this.programs));
        spyOn(this.existingStockOrderableGroupsFactory, 'getGroupsWithoutStock').andReturn(this.$q.resolve([]));
        spyOn(this.stockReasonsFactory, 'getUnpackReasons').andReturn(this.$q.resolve(this.unpackReasones));
        spyOn(this.programService, 'get').andReturn(this.$q.resolve(this.program));
        spyOn($templateCache, 'get').andCallThrough();
        spyOn(this.authorizationService, 'getUser').andReturn(this.$q.resolve(this.user));

        this.state = $state.get('openlmis.stockmanagement.kitunpack.creation');
    });

    describe('state', function() {

        it('should resolve user', function() {
            var result;
            this.state.resolve.user(this.authorizationService).then(function(user) {
                result = user;
            });

            $rootScope.$apply();

            expect(result).toEqual(this.user);
        });

        it('should resolve program', function() {
            var result;
            this.state.resolve.program($state, this.programService).then(function(program) {
                result = program;
            });

            $rootScope.$apply();

            expect(result).toEqual(this.program);
        });

        it('should resolve program from stateParam if it is already set ', function() {
            $state.program = this.program;

            var program = this.state.resolve.program($state, this.programService);

            $rootScope.$apply();

            expect(program).toEqual($state.program);
        });

        it('should resolve facility', function() {
            var result;

            this.state.resolve.facility($state, this.facilityFactory).then(function(facility) {
                result = facility;
            });

            $rootScope.$apply();

            expect(result).toEqual(this.homeFacility);
        });

        it('should resolve facility from stateParam if it is already set ', function() {
            $state.facility = this.homeFacility;

            var facility = this.state.resolve.facility($state, this.programService);

            $rootScope.$apply();

            expect(facility).toEqual($state.facility);
        });

        it('should resolve unpack reasones', function() {
            var result;

            this.state.resolve.reasons($state, this.stockReasonsFactory, this.homeFacility).then(function(reasones) {
                result = reasones;
            });

            $rootScope.$apply();

            expect(result).toEqual(this.unpackReasones);
        });

        it('should resolve reasons from stateParam if it is already set ', function() {
            $state.reasons = this.unpackReasones;

            var reasons = this.state.resolve.reasons($state, this.stockReasonsFactory, this.homeFacility);

            $rootScope.$apply();

            expect(reasons).toEqual(this.unpackReasones);
        });

        it('should resolve srcDstAssignments and value should empty for unpacking', function() {
            var result;

            result = this.state.resolve.srcDstAssignments();

            $rootScope.$apply();

            expect(result).toEqual(null);
        });

        it('should resolve adjustmentType to ADJUSTMENT_TYPE.KIT_UNPACK', function() {
            var result;

            result = this.state.resolve.adjustmentType();

            $rootScope.$apply();

            expect(result).toEqual(this.ADJUSTMENT_TYPE.KIT_UNPACK);
        });
    });
});