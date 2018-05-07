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

describe('StockReasonsController', function() {

    var vm, $q, $controller, $element, $scope, $rootScope, adjustmentsModalService, confirmService,
        messageService, stockReasonsCalculations, reasons, ngModelCtrl, adjustments, lineItem,
        fullProductName, messages, isDisabled, modalDeferred, newAdjustments;

    beforeEach(function() {
        module('stock-reasons-modal');

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            $controller = $injector.get('$controller');
            confirmService = $injector.get('confirmService');
            messageService = $injector.get('messageService');
            adjustmentsModalService = $injector.get('adjustmentsModalService');
            stockReasonsCalculations = $injector.get('stockReasonsCalculations');
        });

        fullProductName = 'Full Product Name';

        reasons = [{
            name: 'Reason One',
            reasonType: 'CREDIT'
        }, {
            name: 'Reason Two',
            reasonType: 'DEBIT'
        }, {
            name: 'Reason Three'
        }];

        adjustments = [{
            quantity: 10,
            reason: reasons[1]
        }, {
            quantity: 20,
            reason: reasons[0]
        }];

        lineItem = {
            orderable: {
                fullProductName: fullProductName
            },
            quantity: 100,
            stockOnHand: 67
        };

        ngModelCtrl = jasmine.createSpyObj('ngModelCtrlMock', ['$setViewValue']);
        ngModelCtrl.$viewValue = adjustments;

        $element = jasmine.createSpyObj('$elementMock', ['controller']);
        $element.controller.andCallFake(function(name) {
            if (name === 'ngModel') {
                return ngModelCtrl;
            }
        });

        messages = {
            'stockReasonsModal.reasonsFor': function(params) {
                return 'Reasons for ' + params.product;
            },
            'stockReasonsModal.addReasonsToTheDifference': function(params) {
                return 'Add reasons to the difference of ' + params.difference + '.';
            },
            'stockReasonsModal.updateReasonsFor': function(params) {
                return 'Update reasons for ' + params.product + ' even though there are still' +
                    'items unaccounted for?';
            }
        };

        isDisabled = true;

        $scope = {
            reasons: reasons,
            lineItem: lineItem,
            isDisabled: isDisabled
        };

        newAdjustments = [{
            quantity: 10,
            reason: reasons[0]
        }];

        vm = $controller('StockReasonsController', {
            $scope: $scope,
            $element: $element
        });

        modalDeferred = $q.defer();
        spyOn(adjustmentsModalService, 'open').andReturn(modalDeferred.promise);
        spyOn(messageService, 'get').andCallFake(function(key, params) {
            return messages[key](params);
        });
    });

    describe('$onInit', function() {

        it('should expose reasons', function() {
            vm.$onInit();

            expect(vm.reasons).toEqual(reasons);
        });

        it('should set $render method for the ngModelCtrl', function() {
            expect(ngModelCtrl.$render).toBeUndefined();

            vm.$onInit();

            expect(angular.isFunction(ngModelCtrl.$render)).toBeTruthy();
        });

    });

    describe('openModal', function() {

        beforeEach(function() {
            vm.$onInit();
            ngModelCtrl.$render();
        });

        it('should pass adjustments', function() {
            vm.openModal();

            expect(adjustmentsModalService.open.calls[0].args[0]).toEqual(adjustments);
        });

        it('should pass reasons', function() {
            vm.openModal();

            expect(adjustmentsModalService.open.calls[0].args[1]).toEqual(reasons);
        });

        it('should pass title', function() {
            vm.openModal();

            expect(adjustmentsModalService.open.calls[0].args[2])
                .toEqual('Reasons for ' + fullProductName);
        });

        it('should pass message', function() {
            vm.openModal();

            expect(adjustmentsModalService.open.calls[0].args[3])
                .toEqual('Add reasons to the difference of 33.');
        });

        it('should pass isDisabled', function() {
            vm.openModal();

            expect(adjustmentsModalService.open.calls[0].args[4]).toBeTruthy();
        });

        it('should pass summaries with unaccounted', function() {
            vm.openModal();

            expect(angular.isFunction(
                adjustmentsModalService.open.calls[0].args[5]['stockReasonsModal.unaccounted']
            )).toBeTruthy();
        });

        it('should pass summaries with total', function() {
            vm.openModal();

            expect(angular.isFunction(
                adjustmentsModalService.open.calls[0].args[5]['stockReasonsModal.total']
            )).toBeTruthy();
        });

        it('should pass preSave function', function() {
            vm.openModal();

            expect(angular.isFunction(adjustmentsModalService.open.calls[0].args[6])).toBeTruthy();
        });

    });

    describe('modal', function() {

        beforeEach(function() {
            vm.$onInit();
            ngModelCtrl.$render();
            vm.openModal();
        });

        it('should update model after closing', function() {
            modalDeferred.resolve(newAdjustments);
            $rootScope.$apply();

            expect(vm.adjustments).toEqual(newAdjustments);
            expect(ngModelCtrl.$setViewValue).toHaveBeenCalledWith(newAdjustments);
        });

        it('should not update model after dismissing', function() {
            modalDeferred.reject();
            $rootScope.$apply();

            expect(vm.adjustments).toEqual(adjustments);
            expect(ngModelCtrl.$setViewValue).not.toHaveBeenCalled();
        });

    });

    describe('preSave', function() {

        var preSave, confirmDeferred;

        beforeEach(function() {
            confirmDeferred = $q.defer();

            vm.$onInit();
            ngModelCtrl.$render();
            vm.openModal();

            spyOn(confirmService, 'confirm').andReturn(confirmDeferred.promise);

            preSave = adjustmentsModalService.open.calls[0].args[6];
        });

        it('should resolve without confirmation if unaccounted is 0', function() {
            var resolved = false;

            //total from new adjustments is 10
            lineItem.quantity = 33;
            lineItem.stockOnHand = 23;

            preSave(newAdjustments).then(function() {
                resolved = true;
            });
            $rootScope.$apply();

            expect(resolved).toBeTruthy();
        });

        it('should require confirmation if the is unaccounted value', function() {
            //total from new adjustments is 10
            lineItem.quantity = 33;
            lineItem.stockOnHand = 22;

            preSave(newAdjustments);
            $rootScope.$apply();

            expect(confirmService.confirm).toHaveBeenCalledWith(
                'Update reasons for ' + fullProductName + ' even though there are still' +
                'items unaccounted for?', 'stockReasonsModal.update'
            );
        });

        it('should resolve if confirmed', function() {
            var resolved = false;

            //total from new adjustments is 10
            lineItem.quantity = 33;
            lineItem.stockOnHand = 22;

            preSave(newAdjustments).then(function() {
                resolved = true;
            });
            confirmDeferred.resolve();
            $rootScope.$apply();

            expect(resolved).toBeTruthy();
        });

        it('should reject if confirmation modal was dismissed', function() {
            var resolved = false;

            //total from new adjustments is 10
            lineItem.quantity = 33;
            lineItem.stockOnHand = 22;

            preSave(newAdjustments).then(function() {
                resolved = true;
            });
            confirmDeferred.reject();
            $rootScope.$apply();

            expect(resolved).toBeFalsy();
        });

    });

});
