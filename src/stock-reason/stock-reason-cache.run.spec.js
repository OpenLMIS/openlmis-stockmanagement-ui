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

describe('stock-reason-cache run', function() {

    beforeEach(function() {
        var context = this;
        module('stock-reason');
        module('referencedata-user', function($provide) {
            context.loginServiceSpy = jasmine.createSpyObj('loginService', [
                'registerPostLoginAction', 'registerPostLogoutAction'
            ]);
            $provide.value('loginService', context.loginServiceSpy);
        });

        inject(function($injector) {
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
            this.stockReasonsFactory = $injector.get('stockReasonsFactory');
            this.facilityFactory = $injector.get('facilityFactory');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
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

        this.user = new this.UserDataBuilder().build();

        this.reason1 =  new this.ReasonDataBuilder()
            .build();
        this.reason2 =  new this.ReasonDataBuilder()
            .build();
        this.reason3 =  new this.ReasonDataBuilder()
            .build();

        this.reasons = [
            this.reason1,
            this.reason2,
            this.reason3
        ];

        this.postLoginAction = getLastCall(this.loginServiceSpy.registerPostLoginAction).args[0];

        spyOn(this.facilityFactory, 'getUserHomeFacility').andReturn(this.$q.resolve(this.homeFacility));
        spyOn(this.stockReasonsFactory, 'getReasons').andReturn(this.$q.resolve(this.reasons));
        spyOn(this.stockReasonsFactory, 'clearReasonsCache');
    });

    describe('run block', function() {

        it('should register post login action', function() {
            expect(this.loginServiceSpy.registerPostLoginAction).toHaveBeenCalled();
        });

    });

    describe('post login action', function() {

        it('should clear valid reasons', function() {
            this.postLoginAction(this.user);
            this.$rootScope.$apply();

            expect(this.stockReasonsFactory.clearReasonsCache).toHaveBeenCalled();
        });

        it('should get user home facility', function() {
            this.postLoginAction(this.user);
            this.$rootScope.$apply();

            expect(this.facilityFactory.getUserHomeFacility).toHaveBeenCalled();
        });

        it('should not get reasons if user has no home facility', function() {
            this.facilityFactory.getUserHomeFacility.andReturn(this.$q.reject());

            this.postLoginAction(this.user);
            this.$rootScope.$apply();

            expect(this.stockReasonsFactory.getReasons).not.toHaveBeenCalled();
        });

        it('should get valid reasons', function() {
            this.postLoginAction(this.user);
            this.$rootScope.$apply();

            expect(this.stockReasonsFactory.getReasons).toHaveBeenCalled();
        });

    });

    function getLastCall(method) {
        return method.calls[method.calls.length - 1];
    }

});