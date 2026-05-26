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

describe('SignatureModalController', function() {

    var vm, $q, $controller, authorizationService, UserDataBuilder, user, modalDeferred;

    beforeEach(function() {
        module('stock-signature-modal');
        module('referencedata-user');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            $q = $injector.get('$q');
            authorizationService = $injector.get('authorizationService');
            UserDataBuilder = $injector.get('UserDataBuilder');
        });

        user = new UserDataBuilder().build();
        modalDeferred = $q.defer();

        spyOn(authorizationService, 'getUser').andReturn(user);

        vm = $controller('SignatureModalController', {
            modalDeferred: modalDeferred
        });
    });

    describe('$onInit', function() {

        it('should initialize signature as empty string', function() {
            expect(vm.signature).toEqual('');
        });

        it('should expose username', function() {
            expect(vm.username).toEqual(user.username);
        });
    });

    describe('submit', function() {

        beforeEach(function() {
            spyOn(modalDeferred, 'resolve');
        });

        it('should resolve modal with entered signature', function() {
            vm.signature = 'Test Signature';

            vm.submit();

            expect(modalDeferred.resolve).toHaveBeenCalledWith({
                signature: 'Test Signature'
            });
        });

        it('should resolve modal even with empty signature (optional)', function() {
            vm.signature = '';

            vm.submit();

            expect(modalDeferred.resolve).toHaveBeenCalledWith({
                signature: ''
            });
        });
    });
});
