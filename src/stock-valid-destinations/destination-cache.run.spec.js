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

describe('destination-cache run', function() {

    beforeEach(function() {
        var context = this;
        module('stock-valid-destinations');
        module('referencedata-user', function($provide) {
            context.loginServiceSpy = jasmine.createSpyObj('loginService', [
                'registerPostLoginAction', 'registerPostLogoutAction'
            ]);
            $provide.value('loginService', context.loginServiceSpy);
        });

        inject(function($injector) {
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
            this.sourceDestinationService = $injector.get('sourceDestinationService');
            this.facilityFactory = $injector.get('facilityFactory');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
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

        this.destinationAssignments = [{
            id: 'dest-one',
            facilityTypeId: 'fac-type-id-one',
            programid: 'program-id-one'
        }, {
            id: 'dest-two',
            facilityTypeId: 'fac-type-id-two',
            programid: 'program-id-two'
        }];

        this.postLoginAction = getLastCall(this.loginServiceSpy.registerPostLoginAction).args[0];

        spyOn(this.facilityFactory, 'getUserHomeFacility').andReturn(this.$q.resolve(this.homeFacility));
        spyOn(this.sourceDestinationService, 'getDestinationAssignments')
            .andReturn(this.$q.resolve(this.destinationAssignments));
        spyOn(this.sourceDestinationService, 'clearDestinationsCache');
    });

    describe('run block', function() {

        it('should register post login action', function() {
            expect(this.loginServiceSpy.registerPostLoginAction).toHaveBeenCalled();
        });

    });

    describe('post login action', function() {

        it('should clear valid destinations cache', function() {
            this.postLoginAction(this.user);
            this.$rootScope.$apply();

            expect(this.sourceDestinationService.clearDestinationsCache).toHaveBeenCalled();
        });

        it('should get user home facility', function() {
            this.postLoginAction(this.user);
            this.$rootScope.$apply();

            expect(this.facilityFactory.getUserHomeFacility).toHaveBeenCalled();
        });

        it('should not get destinations if user has no home facility', function() {
            this.facilityFactory.getUserHomeFacility.andReturn(this.$q.reject());

            this.postLoginAction(this.user);
            this.$rootScope.$apply();

            expect(this.sourceDestinationService.getDestinationAssignments).not.toHaveBeenCalled();
        });

        it('should get valid destinations', function() {
            this.postLoginAction(this.user);
            this.$rootScope.$apply();

            expect(this.sourceDestinationService.getDestinationAssignments).toHaveBeenCalled();
        });

    });

    function getLastCall(method) {
        return method.calls[method.calls.length - 1];
    }

});