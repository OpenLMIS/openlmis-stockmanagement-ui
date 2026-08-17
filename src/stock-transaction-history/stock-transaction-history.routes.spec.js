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

describe('openlmis.stockmanagement.transactionHistory state', function() {

    const USER_ID_KEY = 'user_id';

    let $q, $state, $rootScope, $location, $templateCache, listState, detailState, reverseState,
        STOCKMANAGEMENT_RIGHTS, authorizationService, resourceMock, facilityProgramCacheService,
        offlineService, stockEvents, stockEvent, lineItems, reverseLineItems, reasons,
        reverseFactoryMock, reasonResourceMock, permissionServiceMock, $injectorRef;

    beforeEach(function() {
        loadModules();
        injectServices();
        prepareTestData();
        prepareSpies();
    });

    it('should be available under \'stockmanagement/transactionHistory\'', function() {
        expect($state.current.name).not.toEqual('openlmis.stockmanagement.transactionHistory');

        goToUrl('/stockmanagement/transactionHistory');

        expect($state.current.name).toEqual('openlmis.stockmanagement.transactionHistory');
    });

    it('should resolve stockEvents and query the resource with parameters', function() {
        goToUrl('/stockmanagement/transactionHistory' +
            '?page=0&size=10&facility=facility-id&program=program-id&type=issue');

        expect(getResolvedValue('stockEvents')).toEqual(stockEvents);
        expect(resourceMock.query).toHaveBeenCalled();

        const params = resourceMock.query.mostRecentCall.args[0];

        expect(params.facilityId).toEqual('facility-id');
        expect(params.programId).toEqual('program-id');
        expect(params.type).toEqual('issue');
    });

    it('should not query the resource when facility or program is missing', function() {
        goToUrl('/stockmanagement/transactionHistory?page=0&size=10');

        expect(resourceMock.query).not.toHaveBeenCalled();
    });

    it('should require stock cards view right to enter the list', function() {
        expect(listState.accessRights).toEqual([STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW]);
    });

    it('should show the list in navigation', function() {
        expect(listState.showInNavigation).toBe(true);
    });

    it('should use the list template', function() {
        spyOn($templateCache, 'get').andCallThrough();

        goToUrl('/stockmanagement/transactionHistory');

        expect($templateCache.get)
            .toHaveBeenCalledWith('stock-transaction-history/stock-transaction-history-list.html');
    });

    it('should be available under \'stockmanagement/transactionHistory/:stockEventId\'', function() {
        goToUrl('/stockmanagement/transactionHistory/event-1?detailPage=0&detailSize=20');

        expect($state.current.name).toEqual('openlmis.stockmanagement.transactionHistory.detail');
    });

    it('should resolve the stockEvent for the detail state by event id', function() {
        goToUrl('/stockmanagement/transactionHistory/event-1?detailPage=0&detailSize=20');

        expect(getResolvedValue('stockEvent')).toEqual(stockEvent);
        expect(resourceMock.get).toHaveBeenCalledWith('event-1');
    });

    it('should resolve lineItems for the detail state by event id', function() {
        goToUrl('/stockmanagement/transactionHistory/event-1?detailPage=0&detailSize=20');

        expect(getResolvedValue('lineItems')).toEqual(lineItems);

        const args = resourceMock.getLineItems.mostRecentCall.args;

        expect(args[0]).toEqual('event-1');
        // the detailPage/detailSize custom params are remapped to page/size for the request
        expect(args[1].page).toEqual('0');
        expect(args[1].size).toEqual('20');
    });

    it('should require stock cards view right to enter the detail', function() {
        expect(detailState.accessRights).toEqual([STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW]);
    });

    it('should resolve canReverse to true when the user has the cancel right', function() {
        goToUrl('/stockmanagement/transactionHistory/event-1' +
            '?detailPage=0&detailSize=20&facility=facility-id&program=program-id');

        expect(getResolvedValue('canReverse')).toBe(true);

        expect(permissionServiceMock.hasPermission).toHaveBeenCalledWith('user-1', {
            right: STOCKMANAGEMENT_RIGHTS.STOCK_EVENTS_CANCEL,
            programId: 'program-id',
            facilityId: 'facility-id'
        });
    });

    it('should resolve canReverse to false when the user lacks the cancel right', function() {
        permissionServiceMock.hasPermission.andReturn($q.reject());

        goToUrl('/stockmanagement/transactionHistory/event-1' +
            '?detailPage=0&detailSize=20&facility=facility-id&program=program-id');

        expect(getResolvedValue('canReverse')).toBe(false);
    });

    it('should be available under \'stockmanagement/transactionHistory/:stockEventId/reverse\'', function() {
        goToUrl('/stockmanagement/transactionHistory/event-1/reverse?reversePage=0&reverseSize=10');

        expect($state.current.name)
            .toEqual('openlmis.stockmanagement.transactionHistory.detail.reverse');
    });

    it('should resolve the reverse state from the cached rows and the cancel reasons', function() {
        goToUrl('/stockmanagement/transactionHistory/event-1/reverse' +
            '?reversePage=0&reverseSize=10&facility=facility-id&program=program-id');

        expect(getResolvedValue('reverseLineItems')).toEqual(reverseLineItems);
        expect(getResolvedValue('reasons')).toEqual(reasons);
        expect(reverseFactoryMock.getLineItems)
            .toHaveBeenCalledWith('event-1', 'facility-id', 'program-id');
    });

    it('should validate reverse rows one item at a time', function() {
        const paginationService = $injectorRef.get('paginationService');
        spyOn(paginationService, 'registerList').andCallThrough();

        goToUrl('/stockmanagement/transactionHistory/event-1/reverse?reversePage=0&reverseSize=10');

        const validator = paginationService.registerList.mostRecentCall.args[0];

        expect(validator({
            $errors: {}
        })).toBe(true);

        expect(validator({
            $errors: {
                reasonInvalid: true
            }
        })).toBe(false);

        expect(validator({
            $errors: {
                stockOnHandInvalid: true
            }
        })).toBe(false);

        expect(validator({
            $errors: {},
            $lineError: {
                message: 'blocked'
            }
        })).toBe(false);
    });

    it('should require the cancel right to enter the reverse view', function() {
        expect(reverseState.accessRights).toEqual([STOCKMANAGEMENT_RIGHTS.STOCK_EVENTS_CANCEL]);
    });

    it('should use the reverse template', function() {
        spyOn($templateCache, 'get').andCallThrough();

        goToUrl('/stockmanagement/transactionHistory/event-1/reverse?reversePage=0&reverseSize=10');

        expect($templateCache.get).toHaveBeenCalledWith(
            'stock-transaction-history/stock-transaction-history-reverse.html'
        );
    });

    function loadModules() {
        resourceMock = jasmine.createSpyObj('TransactionHistoryResource',
            ['query', 'get', 'getLineItems']);
        reverseFactoryMock =
            jasmine.createSpyObj('transactionHistoryReverseFactory', ['getLineItems', 'clear']);
        reasonResourceMock = jasmine.createSpyObj('StockReasonResource', ['query']);
        permissionServiceMock = jasmine.createSpyObj('permissionService', ['hasPermission']);
        module('stock-transaction-history', function($provide) {
            $provide.factory('TransactionHistoryResource', function() {
                return function() {
                    return resourceMock;
                };
            });
            $provide.factory('StockReasonResource', function() {
                return function() {
                    return reasonResourceMock;
                };
            });
            $provide.factory('transactionHistoryReverseFactory', function() {
                return reverseFactoryMock;
            });
            $provide.factory('permissionService', function() {
                return permissionServiceMock;
            });
        });
    }

    function injectServices() {
        inject(function($injector) {
            $injectorRef = $injector;
            $q = $injector.get('$q');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            $location = $injector.get('$location');
            $templateCache = $injector.get('$templateCache');
            offlineService = $injector.get('offlineService');
            authorizationService = $injector.get('authorizationService');
            STOCKMANAGEMENT_RIGHTS = $injector.get('STOCKMANAGEMENT_RIGHTS');
            facilityProgramCacheService = $injector.get('facilityProgramCacheService');
        });
    }

    function prepareTestData() {
        listState = $state.get('openlmis.stockmanagement.transactionHistory');
        detailState = $state.get('openlmis.stockmanagement.transactionHistory.detail');
        reverseState = $state.get('openlmis.stockmanagement.transactionHistory.detail.reverse');
        stockEvents = [{
            id: 'event-1',
            documentNumber: '2026-06-HC01-0001'
        }];
        stockEvent = {
            id: 'event-1',
            type: 'RECEIVE',
            documentNumber: '2026-06-HC01-0001'
        };
        lineItems = [{
            quantity: 60,
            stockOnHand: 140
        }];
        reverseLineItems = [{
            stockEventLineItemId: 'line-1',
            quantity: 60,
            stockOnHand: 140,
            $errors: {}
        }];
        reasons = [{
            id: 'credit-reason',
            reasonCategory: 'ADJUSTMENT',
            reasonType: 'CREDIT',
            tags: ['cancel']
        }];
    }

    function prepareSpies() {
        resourceMock.query.andReturn($q.when({
            content: stockEvents,
            size: 10,
            number: 0,
            totalElements: 1
        }));
        resourceMock.get.andReturn($q.when(stockEvent));
        resourceMock.getLineItems.andReturn($q.when({
            content: lineItems,
            size: 20,
            number: 0,
            totalElements: 1
        }));
        reverseFactoryMock.getLineItems.andReturn($q.when(reverseLineItems));
        reasonResourceMock.query.andReturn($q.when(reasons));
        permissionServiceMock.hasPermission.andReturn($q.when(true));
        const user = {};
        user[USER_ID_KEY] = 'user-1';
        spyOn(authorizationService, 'getUser').andReturn(user);
        spyOn(authorizationService, 'hasRight').andReturn(true);
        spyOn(facilityProgramCacheService, 'loadData');
        spyOn(offlineService, 'isOffline').andReturn(false);
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }

    function goToUrl(url) {
        $location.url(url);
        $rootScope.$apply();
    }
});
