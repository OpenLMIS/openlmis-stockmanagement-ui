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

    var implMock, stockCardSummaryListService;

    beforeEach(function() {

        module('stock-card-summary-list', function($provide) {
            implMock = jasmine.createSpyObj('impl', ['print']);
            stockCardSummaryListService = jasmine.createSpyObj('stockCardSummaryListService', ['search']);

            $provide.factory('StockCardSummaryRepositoryImpl', function() {
                return function() {
                    return implMock;
                };
            });

            $provide.service('stockCardSummaryListService', function() {
                return stockCardSummaryListService;
            });
        });

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$state = $injector.get('$state');
            this.$rootScope = $injector.get('$rootScope');
            this.scope = this.$rootScope.$new();
            this.stockCardSummaryListService = $injector.get('stockCardSummaryListService');
            this.StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            this.offlineService = $injector.get('offlineService');
        });

        this.stockCardSummaries = [
            new this.StockCardSummaryDataBuilder().build(),
            new this.StockCardSummaryDataBuilder().build()
        ];

        this.stockCardSummaries2 = [
            new this.StockCardSummaryDataBuilder().build(),
            new this.StockCardSummaryDataBuilder().build()
        ];

        this.stateParams = {
            param: 'param'
        };

        spyOn(this.offlineService, 'isOffline').andReturn(true);

        this.vm = this.$controller('StockCardSummaryListController', {
            stockCardSummaries: this.stockCardSummaries,
            displayStockCardSummaries: this.stockCardSummaries,
            $stateParams: this.stateParams,
            $scope: this.scope
        });
        this.vm.$onInit();

        this.vm.facility = {
            id: 'facility'
        };
        this.vm.program = {
            id: 'program'
        };
        this.vm.isSupervised = true;

        spyOn(this.$state, 'go').andReturn(true);
    });

    describe('onInit', function() {

        it('should expose stockCardSummaries', function() {
            expect(this.vm.stockCardSummaries).toEqual(this.stockCardSummaries);
        });

        it('should watch stockCardSummaries when offline', function() {
            this.vm.displayStockCardSummaries = undefined;
            this.vm.pagedList = this.stockCardSummaries2;

            this.$rootScope.$apply();

            expect(this.vm.displayStockCardSummaries).toEqual(this.stockCardSummaries2);
        });
    });

    describe('loadStockCardSummaries', function() {

        it('should call state go with proper parameters', function() {
            this.vm.loadStockCardSummaries();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries', {
                param: 'param',
                keyword: undefined,
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
            this.vm.viewSingleCard('stock-card-id');

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries.singleCard', {
                stockCardId: 'stock-card-id'
            });
        });
    });

    describe('print', function() {

        it('should call state go with proper parameters', function() {
            this.vm.print();

            expect(implMock.print).toHaveBeenCalledWith('program', 'facility');
        });
    });

    describe('goToPendingOfflineEventsPage', function() {

        it('should call state go method', function() {
            this.vm.goToPendingOfflineEventsPage();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.pendingOfflineEvents');
        });
    });

    it('should reload with page and keyword when search', function() {
        this.vm.keyword = '200';
        this.vm.search();

        var params = {
            param: 'param',
            displayStockCardSummaries: undefined,
            keyword: '200',
            facility: this.vm.facility.id,
            program: this.vm.program.id,
            supervised: true,
            page: 0
        };

        expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries', params, {
            reload: true,
            notify: false
        });
    });
});
