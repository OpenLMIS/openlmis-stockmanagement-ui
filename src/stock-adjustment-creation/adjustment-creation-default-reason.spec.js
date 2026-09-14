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

describe('StockAdjustmentCreationController default reason', function() {

    var CONFIGURED_ID = 'configured-reason-id';

    var vm, scope, state, stateParams, $controller, ADJUSTMENT_TYPE, DEFAULT_REASONS, program, facility,
        orderableGroups, reasons, configuredReason, otherReason, OrderableGroupDataBuilder, OrderableDataBuilder,
        ReasonDataBuilder, UNPACK_REASONS, editLotModalService;

    function setUp(defaultReasons) {
        module('referencedata-lot');
        module('openlmis-quantity-unit-toggle');
        module('stock-adjustment-creation', function($provide) {
            var stockEventRepositoryMock = jasmine.createSpyObj('stockEventRepository', ['create']);
            $provide.factory('StockEventRepository', function() {
                return function() {
                    return stockEventRepositoryMock;
                };
            });
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
            if (defaultReasons) {
                $provide.constant('DEFAULT_REASONS', defaultReasons);
            }
        });

        inject(function($injector) {
            var ProgramDataBuilder = $injector.get('ProgramDataBuilder'),
                FacilityDataBuilder = $injector.get('FacilityDataBuilder');

            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            $controller = $injector.get('$controller');
            stateParams = $injector.get('$stateParams');
            ADJUSTMENT_TYPE = $injector.get('ADJUSTMENT_TYPE');
            DEFAULT_REASONS = $injector.get('DEFAULT_REASONS');
            UNPACK_REASONS = $injector.get('UNPACK_REASONS');
            OrderableGroupDataBuilder = $injector.get('OrderableGroupDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            editLotModalService = $injector.get('editLotModalService');

            scope = $injector.get('$rootScope').$new();
            scope.productForm = jasmine.createSpyObj('productForm', ['$setUntouched', '$setPristine']);

            state = jasmine.createSpyObj('$state', ['go']);
            state.current = {
                name: '/a/b'
            };
            state.params = {
                page: 0
            };

            program = new ProgramDataBuilder().build();
            facility = new FacilityDataBuilder().build();
            orderableGroups = [new OrderableGroupDataBuilder().build()];

            configuredReason = new ReasonDataBuilder().withId(CONFIGURED_ID)
                .buildTransferReason();
            otherReason = new ReasonDataBuilder().buildTransferReason();
            reasons = [otherReason, configuredReason];
        });
    }

    function initController(adjustmentType) {
        return $controller('StockAdjustmentCreationController', {
            $scope: scope,
            $state: state,
            $stateParams: stateParams,
            program: program,
            facility: facility,
            adjustmentType: adjustmentType,
            srcDstAssignments: undefined,
            user: {},
            reasons: reasons,
            orderableGroups: orderableGroups,
            displayItems: [],
            hasPermissionToAddNewLot: true,
            editLotModalService: editLotModalService
        });
    }

    function addLineItem() {
        vm.selectedOrderableGroup = new OrderableGroupDataBuilder()
            .withOrderable(new OrderableDataBuilder().build())
            .withStockOnHand(10)
            .build();
        vm.addProduct();

        return vm.addedLineItems[0];
    }

    describe('with no reason configured', function() {

        beforeEach(function() {
            setUp({});
        });

        it('should not preselect a reason offered under an id of its own placeholder', function() {
            reasons.push(new ReasonDataBuilder().withoutId()
                .buildTransferReason());
            vm = initController(ADJUSTMENT_TYPE.ISSUE);

            var lineItem = vm.validateReason(addLineItem());

            expect(lineItem.reason).toBeUndefined();
            expect('reasonInvalid' in lineItem.$errors).toBe(false);
        });

        it('should not preselect a reason on issue', function() {
            vm = initController(ADJUSTMENT_TYPE.ISSUE);

            expect(addLineItem().reason).toBeUndefined();
        });

        it('should not preselect a reason on receive', function() {
            vm = initController(ADJUSTMENT_TYPE.RECEIVE);

            expect(addLineItem().reason).toBeUndefined();
        });

        it('should leave the reason optional on issue', function() {
            vm = initController(ADJUSTMENT_TYPE.ISSUE);

            var lineItem = vm.validateReason(addLineItem());

            expect('reasonInvalid' in lineItem.$errors).toBe(false);
        });

        it('should leave the reason optional on receive', function() {
            vm = initController(ADJUSTMENT_TYPE.RECEIVE);

            var lineItem = vm.validateReason(addLineItem());

            expect('reasonInvalid' in lineItem.$errors).toBe(false);
        });

        it('should still require the reason on adjustment', function() {
            vm = initController(ADJUSTMENT_TYPE.ADJUSTMENT);

            var lineItem = vm.validateReason(addLineItem());

            expect(lineItem.$errors.reasonInvalid).toBe(true);
        });
    });

    describe('the configuration contract', function() {

        beforeEach(function() {
            setUp();
        });

        it('should key the reason ids by adjustment type state', function() {
            expect(ADJUSTMENT_TYPE.ISSUE.state in DEFAULT_REASONS).toBe(true);
            expect(ADJUSTMENT_TYPE.RECEIVE.state in DEFAULT_REASONS).toBe(true);
        });

        it('should name any unsubstituted placeholder after its config key', function() {
            var placeholders = {
                issue: '@@DEFAULT_ISSUE_REASON_ID',
                receive: '@@DEFAULT_RECEIVE_REASON_ID'
            };

            Object.keys(placeholders).forEach(function(state) {
                var configured = DEFAULT_REASONS[state];

                if (configured.substr(0, 2) === '@@') {
                    expect(configured).toBe(placeholders[state]);
                }
            });
        });
    });

    describe('with a reason configured for issue', function() {

        beforeEach(function() {
            setUp({
                issue: CONFIGURED_ID
            });
            vm = initController(ADJUSTMENT_TYPE.ISSUE);
        });

        it('should preselect the configured reason on a new line item', function() {
            expect(addLineItem().reason).toBe(configuredReason);
        });

        it('should accept a line item holding the configured reason', function() {
            var lineItem = vm.validateReason(addLineItem());

            expect(lineItem.$errors.reasonInvalid).toBe(false);
        });

        it('should reject a line item whose reason was cleared', function() {
            var lineItem = addLineItem();

            lineItem.reason = undefined;

            expect(vm.validateReason(lineItem).$errors.reasonInvalid).toBe(true);
        });

        it('should inherit the reason of the previous line item rather than the configured one', function() {
            addLineItem().reason = otherReason;

            expect(addLineItem().reason).toBe(otherReason);
        });
    });

    describe('with a reason configured for receive', function() {

        beforeEach(function() {
            setUp({
                receive: CONFIGURED_ID
            });
            vm = initController(ADJUSTMENT_TYPE.RECEIVE);
        });

        it('should preselect the configured reason on a new line item', function() {
            expect(addLineItem().reason).toBe(configuredReason);
        });

        it('should require the reason', function() {
            var lineItem = addLineItem();

            lineItem.reason = undefined;

            expect(vm.validateReason(lineItem).$errors.reasonInvalid).toBe(true);
        });

        it('should not touch the other screens', function() {
            vm = initController(ADJUSTMENT_TYPE.ISSUE);

            var lineItem = vm.validateReason(addLineItem());

            expect(lineItem.reason).toBeUndefined();
            expect('reasonInvalid' in lineItem.$errors).toBe(false);
        });
    });

    describe('with a configuration that cannot be honoured', function() {

        it('should ignore an id that the screen did not load', function() {
            setUp({
                issue: 'some-reason-that-is-not-offered'
            });
            vm = initController(ADJUSTMENT_TYPE.ISSUE);

            var lineItem = vm.validateReason(addLineItem());

            expect(lineItem.reason).toBeUndefined();
            expect('reasonInvalid' in lineItem.$errors).toBe(false);
        });

        it('should ignore an id substituted with an empty string', function() {
            setUp({
                issue: ''
            });
            reasons.push(new ReasonDataBuilder().withId('')
                .buildTransferReason());
            vm = initController(ADJUSTMENT_TYPE.ISSUE);

            var lineItem = vm.validateReason(addLineItem());

            expect(lineItem.reason).toBeUndefined();
            expect('reasonInvalid' in lineItem.$errors).toBe(false);
        });

        it('should ignore an unsubstituted placeholder', function() {
            setUp({
                issue: '@@DEFAULT_ISSUE_REASON_ID'
            });
            reasons.push(new ReasonDataBuilder().withId('@@DEFAULT_ISSUE_REASON_ID')
                .buildTransferReason());
            vm = initController(ADJUSTMENT_TYPE.ISSUE);

            var lineItem = vm.validateReason(addLineItem());

            expect(lineItem.reason).toBeUndefined();
            expect('reasonInvalid' in lineItem.$errors).toBe(false);
        });

        it('should not require a reason on a screen that shows no reason field', function() {
            setUp({
                kitunpack: CONFIGURED_ID
            });
            vm = initController(ADJUSTMENT_TYPE.KIT_UNPACK);

            var lineItem = vm.validateReason(addLineItem());

            expect(vm.showReasonDropdown).toBe(false);
            expect('reasonInvalid' in lineItem.$errors).toBe(false);
        });

        it('should keep the unpack reason on a screen that forces one', function() {
            setUp({
                kitunpack: CONFIGURED_ID
            });
            vm = initController(ADJUSTMENT_TYPE.KIT_UNPACK);

            expect(addLineItem().reason.id).toBe(UNPACK_REASONS.KIT_UNPACK_REASON_ID);
        });
    });

});
