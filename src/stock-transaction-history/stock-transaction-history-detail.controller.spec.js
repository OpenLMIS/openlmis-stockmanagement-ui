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

describe('TransactionHistoryDetailController', function() {

    let vm, $controller, lineItems, $window, $stateParams, QUANTITY_UNIT, localStorageService,
        accessTokenFactory, stockmanagementUrlFactory, quantityUnitCalculateService;

    beforeEach(function() {
        module('stock-transaction-history');

        inject(function($injector) {
            $controller = $injector.get('$controller');
        });

        QUANTITY_UNIT = {
            PACKS: 'PACKS',
            DOSES: 'DOSES'
        };
        $stateParams = {
            stockEventId: 'event-1'
        };
        $window = {
            open: jasmine.createSpy('open')
        };
        localStorageService = {
            get: jasmine.createSpy('get').andReturn(null)
        };
        accessTokenFactory = {
            addAccessToken: jasmine.createSpy('addAccessToken').andCallFake(function(url) {
                return url + (url.indexOf('?') === -1 ? '?' : '&') + 'access_token=token';
            })
        };
        stockmanagementUrlFactory = jasmine.createSpy('stockmanagementUrlFactory')
            .andCallFake(function(url) {
                return 'http://host' + url;
            });
        quantityUnitCalculateService = {
            recalculateSOHQuantity: jasmine.createSpy('recalculateSOHQuantity')
                .andReturn('recalculated')
        };

        lineItems = [{
            orderable: {
                productCode: 'C100',
                fullProductName: 'Levora',
                netContent: 84
            },
            quantity: 60,
            stockOnHand: 140,
            documentNumber: '2026-06-HC01-0001'
        }];

        initController(lineItems);
    });

    function initController(items) {
        vm = $controller('TransactionHistoryDetailController', {
            lineItems: items,
            $stateParams: $stateParams,
            $window: $window,
            QUANTITY_UNIT: QUANTITY_UNIT,
            localStorageService: localStorageService,
            accessTokenFactory: accessTokenFactory,
            stockmanagementUrlFactory: stockmanagementUrlFactory,
            quantityUnitCalculateService: quantityUnitCalculateService
        });
        vm.$onInit();
        return vm;
    }

    it('should expose line items and the document number from the first line on init', function() {
        expect(vm.lineItems).toEqual(lineItems);
        expect(vm.documentNumber).toEqual('2026-06-HC01-0001');
    });

    it('should leave the document number undefined when there are no line items', function() {
        initController([]);

        expect(vm.lineItems).toEqual([]);
        expect(vm.documentNumber).toBeUndefined();
    });

    it('should convert lot expirationDate to a Date so openlmisDate shows the correct day', function() {
        initController([{
            orderable: {
                productCode: 'C1'
            },
            lot: {
                lotCode: 'LOT-1',
                expirationDate: '2026-06-02'
            },
            documentNumber: '2026-06-HC01-0001'
        }]);

        expect(vm.lineItems[0].lot.expirationDate instanceof Date).toBe(true);
        expect(vm.lineItems[0].lot.expirationDate.getTime())
            .toEqual(new Date('2026-06-02').getTime());
    });

    describe('showInDoses', function() {

        it('should return true when the selected quantity unit is doses', function() {
            vm.quantityUnit = QUANTITY_UNIT.DOSES;

            expect(vm.showInDoses()).toBe(true);
        });

        it('should return false when the selected quantity unit is packs', function() {
            vm.quantityUnit = QUANTITY_UNIT.PACKS;

            expect(vm.showInDoses()).toBe(false);
        });
    });

    describe('recalculateQuantity', function() {

        it('should delegate to the calculate service with the orderable net content', function() {
            vm.quantityUnit = QUANTITY_UNIT.PACKS;

            const result = vm.recalculateQuantity(140, lineItems[0]);

            expect(result).toEqual('recalculated');
            expect(quantityUnitCalculateService.recalculateSOHQuantity)
                .toHaveBeenCalledWith(140, 84, false);
        });
    });

    describe('print', function() {

        it('should open the report for the current stock event honoring the quantity unit', function() {
            vm.quantityUnit = QUANTITY_UNIT.DOSES;

            vm.print();

            expect(stockmanagementUrlFactory)
                .toHaveBeenCalledWith('/api/stockEvents/event-1/print?showInDoses=true');

            expect(accessTokenFactory.addAccessToken)
                .toHaveBeenCalledWith('http://host/api/stockEvents/event-1/print?showInDoses=true');

            expect($window.open).toHaveBeenCalledWith(
                'http://host/api/stockEvents/event-1/print?showInDoses=true&access_token=token',
                '_blank'
            );
        });

        it('should append the locale when one is stored', function() {
            localStorageService.get.andReturn('fr');
            vm.quantityUnit = QUANTITY_UNIT.PACKS;

            vm.print();

            expect(stockmanagementUrlFactory)
                .toHaveBeenCalledWith('/api/stockEvents/event-1/print?showInDoses=false&lang=fr');
        });
    });
});
