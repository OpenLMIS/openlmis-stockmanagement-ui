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

describe('StockCardSummaryListController', function() {

    var $controller, $state, implMock, StockCardSummaryDataBuilder, vm, stockCardSummaries, stateParams;

    beforeEach(function() {

        module('stock-card-summary-list', function($provide) {
            implMock = jasmine.createSpyObj('impl', ['print']);

            $provide.factory('StockCardSummaryRepositoryImpl', function() {
                return function() {
                    return implMock;
                };
            });
        });

        inject(function($injector) {
            $controller = $injector.get('$controller');
            $state = $injector.get('$state');
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
        });

        stockCardSummaries = [
            new StockCardSummaryDataBuilder().build(),
            new StockCardSummaryDataBuilder().build()
        ];

        stateParams = {
            param: 'param'
        };

        vm = $controller('StockCardSummaryListController', {
            stockCardSummaries: stockCardSummaries,
            $stateParams: stateParams
        });
        vm.$onInit();

        vm.facility = {
            id: 'facility'
        };
        vm.program = {
            id: 'program'
        };
        vm.isSupervised = true;

        spyOn($state, 'go').andReturn(true);
    });

    describe('onInit', function() {

        it('should expose stockCardSummaries', function() {
            expect(vm.stockCardSummaries).toEqual(stockCardSummaries);
        });
    });

    describe('loadStockCardSummaries', function() {

        it('should call state go with proper parameters', function() {
            vm.loadStockCardSummaries();
            expect($state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries', {
                param: 'param',
                facility: 'facility',
                program: 'program',
                supervised: true
            }, {
                reload: true
            });
        });
    });

    describe('viewSingleCard', function() {

        it('should call state go with proper parameters', function() {
            vm.viewSingleCard('stock-card-id');
            expect($state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries.singleCard', {
                stockCardId: 'stock-card-id'
            });
        });
    });

    describe('print', function() {

        it('should call state go with proper parameters', function() {
            vm.print();
            expect(implMock.print).toHaveBeenCalledWith('program', 'facility');
        });
    });
});
