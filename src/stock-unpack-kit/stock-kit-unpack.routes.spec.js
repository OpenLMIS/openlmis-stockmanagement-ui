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

/*describe('openlmis.stockmanagement.kitunpack state', function() {

    beforeEach(function() {
        module('stock-unpack-kit');

        var MinimalFacilityDataBuilder, UserDataBuilder, ProgramDataBuilder;

        inject(function($injector) {
            MinimalFacilityDataBuilder = $injector.get('MinimalFacilityDataBuilder');
            UserDataBuilder = $injector.get('UserDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');

            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$rootScope = $injector.get('$rootScope');
            this.$location = $injector.get('$location');
            this.$templateCache = $injector.get('$templateCache');
            this.facilityFactory = $injector.get('facilityFactory');
            this.authorizationService =  $injector.get('authorizationService');
            this.stockProgramUtilService =  $injector.get('stockProgramUtilService');
            this.ADJUSTMENT_TYPE = $injector.get('ADJUSTMENT_TYPE');
            this.STOCKMANAGEMENT_RIGHTS = $injector.get('STOCKMANAGEMENT_RIGHTS');
        });

        this.homeFacility = new MinimalFacilityDataBuilder()
            .build();
        this.user = new UserDataBuilder()
            .withHomeFacilityId(this.homeFacility.id)
            .build();
        this.programs = [
            new ProgramDataBuilder().build(),
            new ProgramDataBuilder().build()
        ];

        spyOn(this.facilityFactory, 'getUserHomeFacility').andReturn(this.$q.resolve(this.homeFacility));
        spyOn(this.authorizationService, 'getUser').andReturn(this.$q.resolve(this.user));
        spyOn(this.stockProgramUtilService, 'getPrograms').andReturn(this.$q.resolve(this.programs));

        this.state = this.$state.get('openlmis.stockmanagement.kitunpack');

        this.goToUrl = goToUrl;
        this.getResolvedValue = getResolvedValue;

    });

    describe('state', function() {

        it('should be available under \'stockmanagement/unpack\'', function() {
            expect(this.$state.current.name).not.toEqual('openlmis.stockmanagement.kitunpack');

            this.goToUrl('/stockmanagement/unpack');

            expect(this.$state.current.name).toEqual('openlmis.stockmanagement.kitunpack');
        });

        it('should resolve facility', function() {
            this.goToUrl('/stockmanagement/unpack?page=0');

            expect(this.getResolvedValue('facility')).toEqual(this.homeFacility);
        });

        it('should resolve user', function() {
            this.goToUrl('/stockmanagement/unpack');

            expect(this.getResolvedValue('user')).toEqual(this.user);
        });

        it('should resolve programs', function() {
            this.goToUrl('/stockmanagement/unpack');

            expect(this.getResolvedValue('programs')).toEqual(this.programs);
        });

        it('should resolve adjustment types', function() {
            this.goToUrl('/stockmanagement/unpack');

            expect(this.getResolvedValue('adjustmentType')).toEqual(this.ADJUSTMENT_TYPE.KIT_UNPACK);
        });

        it('should use template', function() {
            spyOn(this.$templateCache, 'get').andCallThrough();

            this.goToUrl('/stockmanagement/unpack');

            expect(this.$templateCache.get).toHaveBeenCalledWith('stock-adjustment/stock-adjustment.html');
        });

        it('should require stock cards view right to enter', function() {
            expect(this.state.accessRights).toEqual([this.STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST]);
        });

    });

    function getResolvedValue(name) {
        return this.$state.$current.locals.globals[name];
    }

    function goToUrl(url) {
        this.$location.url(url);
        this.$rootScope.$apply();
    }
});*/
