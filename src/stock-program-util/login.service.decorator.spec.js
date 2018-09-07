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

describe('loginService permissions decorator', function() {

    var loginService, $q, $rootScope, currentUserHomeFacilityService, originalLoginSpy, originalLogoutSpy,
        UserDataBuilder, user;

    beforeEach(function() {
        module('referencedata-facility', function($provide) {
            originalLoginSpy = jasmine.createSpy('login');
            originalLogoutSpy = jasmine.createSpy('logout');

            $provide.service('loginService', function() {
                return {
                    login: originalLoginSpy,
                    logout: originalLogoutSpy,
                    spy: true
                };
            });
        });
        module('stock-program-util');

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            loginService = $injector.get('loginService');
            UserDataBuilder = $injector.get('UserDataBuilder');
            currentUserHomeFacilityService = $injector.get('currentUserHomeFacilityService');
        });

        spyOn(currentUserHomeFacilityService, 'getHomeFacility').andReturn($q.resolve());
        spyOn(currentUserHomeFacilityService, 'clearCache').andReturn($q.resolve());
        
        user = new UserDataBuilder().build();
        originalLoginSpy.andReturn($q.resolve(user));
        originalLogoutSpy.andReturn($q.resolve());
    });

    describe('login', function() {

        it('should reject if the original login rejects', function() {
            originalLoginSpy.andReturn($q.reject());

            var rejected;
            loginService.login()
            .catch(function() {
                rejected = true;
            });
            $rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should return user', function() {
            var result;
            loginService.login()
            .then(function(user) {
                result = user;
            });
            $rootScope.$apply();

            expect(result).toEqual(user);
        });

        it('should reject if currentUserHomeFacilityService rejects', function() {
            currentUserHomeFacilityService.getHomeFacility.andReturn($q.reject());

            var rejected;
            loginService.login()
            .catch(function() {
                rejected = true;
            });
            $rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should cache home facility of the current user', function() {
            originalLoginSpy.andReturn($q.resolve(user));

            loginService.login();
            $rootScope.$apply();

            expect(currentUserHomeFacilityService.getHomeFacility).toHaveBeenCalled();
        });

    });

    describe('logout', function() {

        it('should reject if original logout rejects', function() {
            originalLogoutSpy.andReturn($q.reject());

            var rejected;
            loginService.logout()
            .catch(function() {
                rejected = true;
            });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should reject if clearing cache fails', function() {
            currentUserHomeFacilityService.clearCache.andReturn($q.reject());

            var rejected;
            loginService.logout()
            .catch(function() {
                rejected = true;
            });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should resolve after success', function() {
            var resolved;
            loginService.logout()
            .then(function() {
                resolved = true;
            });
            $rootScope.$apply();

            expect(resolved).toEqual(true);
        });

        it('should clear home facility from cache', function() {
            var resolved;
            loginService.logout()
            .then(function() {
                resolved = true;
            });
            $rootScope.$apply();

            expect(resolved).toEqual(true);

            expect(currentUserHomeFacilityService.clearCache).toHaveBeenCalled();
        });

    });

});
