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

describe('full-stock-card-summary-cache run', function() {

    beforeEach(function() {
        var context = this;
        module('stock-products');
        module('referencedata-user', function($provide) {
            context.loginServiceSpy = jasmine.createSpyObj('loginService', [
                'registerPostLoginAction', 'registerPostLogoutAction'
            ]);
            $provide.value('loginService', context.loginServiceSpy);
        });

        inject(function($injector) {
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
            this.facilityFactory = $injector.get('facilityFactory');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            this.CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.StockCardSummaryResource = $injector.get('StockCardSummaryResource');
        });

        this.program1 = new this.ProgramDataBuilder().build();
        this.program2 = new this.ProgramDataBuilder().build();

        this.programs = [
            this.program1,
            this.program2
        ];

        this.homeFacility = new this.FacilityDataBuilder()
            .withSupportedPrograms(this.programs)
            .build();

        this.stockCardSummary1 = new this.StockCardSummaryDataBuilder()
            .withCanFulfillForMeEntry(new this.CanFulfillForMeEntryDataBuilder()
                .withoutStockCard()
                .buildJson())
            .withCanFulfillForMeEntry(new this.CanFulfillForMeEntryDataBuilder()
                .buildJson())
            .buildJson();
        this.stockCardSummary2 = new this.StockCardSummaryDataBuilder()
            .withCanFulfillForMeEntry(new this.CanFulfillForMeEntryDataBuilder()
                .buildJson())
            .buildJson();

        this.summariesPage = new this.PageDataBuilder()
            .withContent([this.stockCardSummary1, this.stockCardSummary2])
            .build();

        this.postLoginAction = getLastCall(this.loginServiceSpy.registerPostLoginAction).args[0];

        spyOn(this.facilityFactory, 'getUserHomeFacility').andReturn(this.$q.resolve(this.homeFacility));
        spyOn(this.StockCardSummaryResource.prototype, 'query').andReturn(this.$q.resolve(this.summariesPage));
        spyOn(this.StockCardSummaryResource.prototype, 'deleteAll');
    });

    describe('run block', function() {

        it('should register post login action', function() {
            expect(this.loginServiceSpy.registerPostLoginAction).toHaveBeenCalled();
        });

    });

    describe('post login action', function() {

        it('should clear stock card summaries local database', function() {
            this.postLoginAction(this.user);
            this.$rootScope.$apply();

            expect(this.StockCardSummaryResource.prototype.deleteAll).toHaveBeenCalled();
        });

        it('should get user home facility', function() {
            this.postLoginAction(this.user);
            this.$rootScope.$apply();

            expect(this.facilityFactory.getUserHomeFacility).toHaveBeenCalled();
        });

        it('should get stock card summaries page', function() {
            this.postLoginAction(this.user);
            this.$rootScope.$apply();

            expect(this.StockCardSummaryResource.prototype.query).toHaveBeenCalled();
        });

    });

    function getLastCall(method) {
        return method.calls[method.calls.length - 1];
    }

});