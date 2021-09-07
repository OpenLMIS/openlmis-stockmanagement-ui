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

describe('openlmis.stockmanagement.stockCardSummaries state', function() {

    var $q, $state, $rootScope, $location, $templateCache, state, STOCKMANAGEMENT_RIGHTS, authorizationService,
        stockCardRepositoryMock, StockCardSummaryDataBuilder, stockCardSummaries, facilityProgramCacheService,
        offlineService;

    beforeEach(function() {
        loadModules();
        injectServices();
        prepareTestData();
        prepareSpies();
    });

    it('should be available under \'stockmanagement/stockCardSummaries\'', function() {
        expect($state.current.name).not.toEqual('openlmis.stockmanagement.stockCardSummaries');

        goToUrl('/stockmanagement/stockCardSummaries');

        expect($state.current.name).toEqual('openlmis.stockmanagement.stockCardSummaries');
    });

    it('should resolve stockCardSummaries', function() {
        goToUrl('/stockmanagement/stockCardSummaries?page=0&size=10&program=program-id');

        expect(getResolvedValue('stockCardSummaries')).toEqual(stockCardSummaries);
    });

    it('should call stock card summary repository with parameters', function() {
        goToUrl('/stockmanagement/stockCardSummaries' +
            '?page=0&size=10&facility=facility-id&program=program-id');

        expect(getResolvedValue('stockCardSummaries')).toEqual(stockCardSummaries);
        expect(stockCardRepositoryMock.query).toHaveBeenCalledWith({
            page: '0',
            size: '10',
            facilityId: 'facility-id',
            programId: 'program-id',
            nonEmptyOnly: true
        });
    });

    it('should call stock card summary repository when offline and program selected', function() {
        spyOn(offlineService, 'isOffline').and.returnValue(true);

        goToUrl('/stockmanagement/stockCardSummaries?page=0&size=10&program=program-id');

        expect(getResolvedValue('stockCardSummaries')).toEqual(stockCardSummaries);
        expect(stockCardRepositoryMock.query).toHaveBeenCalledWith({
            page: '0',
            size: '10',
            facilityId: undefined,
            programId: 'program-id',
            nonEmptyOnly: true
        });
    });

    it('should call facilityProgramCacheService when offline', function() {
        spyOn(offlineService, 'isOffline').and.returnValue(true);

        goToUrl('/stockmanagement/stockCardSummaries');

        expect(facilityProgramCacheService.loadData).toHaveBeenCalled();
    });

    it('should not call facilityProgramCacheService when online', function() {
        spyOn(offlineService, 'isOffline').and.returnValue(false);

        goToUrl('/stockmanagement/stockCardSummaries');

        expect(facilityProgramCacheService.loadData).not.toHaveBeenCalled();
    });

    it('should use template', function() {
        spyOn($templateCache, 'get').and.callThrough();

        goToUrl('/stockmanagement/stockCardSummaries');

        expect($templateCache.get).toHaveBeenCalledWith('stock-card-summary-list/stock-card-summary-list.html');
    });

    it('should require stock cards view right to enter', function() {
        expect(state.accessRights).toEqual([STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW]);
    });

    function loadModules() {
        stockCardRepositoryMock = jasmine.createSpyObj('stockCardSummaryRepository', ['query']);
        module('stock-card-summary-list', function($provide) {
            $provide.factory('StockCardSummaryRepository', function() {
                return function() {
                    return stockCardRepositoryMock;
                };
            });
        });
    }

    function injectServices() {
        inject(function($injector) {
            $q = $injector.get('$q');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            $location = $injector.get('$location');
            $templateCache = $injector.get('$templateCache');
            offlineService = $injector.get('offlineService');
            authorizationService = $injector.get('authorizationService');
            STOCKMANAGEMENT_RIGHTS = $injector.get('STOCKMANAGEMENT_RIGHTS');
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            facilityProgramCacheService = $injector.get('facilityProgramCacheService');
        });
    }

    function prepareTestData() {
        state = $state.get('openlmis.stockmanagement.stockCardSummaries');
        stockCardSummaries = [
            new StockCardSummaryDataBuilder().build(),
            new StockCardSummaryDataBuilder().build()
        ];
    }

    function prepareSpies() {
        stockCardRepositoryMock.query.and.returnValue($q.when({
            content: stockCardSummaries
        }));
        spyOn(authorizationService, 'hasRight').and.returnValue(true);
        spyOn(facilityProgramCacheService, 'loadData');
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }

    function goToUrl(url) {
        $location.url(url);
        $rootScope.$apply();
    }
});
