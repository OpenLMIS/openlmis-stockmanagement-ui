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

describe('stock-program-util run', function() {

    var loginServiceSpy, currentUserHomeFacilityService, postLoginAction, $q, $rootScope, postLogoutAction;

    beforeEach(function() {
        module('stock-program-util', function($provide) {
            loginServiceSpy = jasmine.createSpyObj('loginService', [
                'registerPostLoginAction', 'registerPostLogoutAction'
            ]);
            $provide.value('loginService', loginServiceSpy);
        });

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
            currentUserHomeFacilityService = $injector.get('currentUserHomeFacilityService');
        });

        postLoginAction = getLastCall(loginServiceSpy.registerPostLoginAction).args[0];
        postLogoutAction = getLastCall(loginServiceSpy.registerPostLogoutAction).args[0];

        spyOn(currentUserHomeFacilityService, 'getHomeFacility');
        spyOn(currentUserHomeFacilityService, 'clearCache');
    });

    describe('run block', function() {

        it('should register post login action', function() {
            expect(loginServiceSpy.registerPostLoginAction).toHaveBeenCalled();
        });

        it('should register post logout action', function() {
            expect(loginServiceSpy.registerPostLogoutAction).toHaveBeenCalled();
        });

    });

    describe('post login action', function() {

        it('should set up rights', function() {
            currentUserHomeFacilityService.getHomeFacility.and.returnValue($q.resolve());

            var success;
            postLoginAction()
                .then(function() {
                    success = true;
                });
            $rootScope.$apply();

            expect(success).toBe(true);
            expect(currentUserHomeFacilityService.getHomeFacility).toHaveBeenCalledWith();
        });

    });

    describe('post logout action', function() {

        it('should clear rights', function() {
            currentUserHomeFacilityService.clearCache.and.returnValue($q.resolve());

            var success;
            postLogoutAction()
                .then(function() {
                    success = true;
                });
            $rootScope.$apply();

            expect(success).toBe(true);
            expect(currentUserHomeFacilityService.clearCache).toHaveBeenCalled();
        });

    });

    function getLastCall(method) {
        return method.calls.mostRecent();
    }

});
