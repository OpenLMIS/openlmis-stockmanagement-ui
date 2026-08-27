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

describe('transactionHistoryReverseFactory', function() {

    let transactionHistoryReverseFactory, $q, $rootScope, getLineItemsSpy, summaryQuerySpy, page,
        summaryPage;

    beforeEach(function() {
        page = {
            content: [{
                stockEventLineItemId: 'line-1',
                orderable: {
                    id: 'orderable-1',
                    productCode: 'C100'
                },
                lot: {
                    id: 'lot-1',
                    lotCode: 'LOT-1',
                    expirationDate: '2026-06-02'
                },
                destination: {
                    name: 'Balaka'
                },
                quantity: 10,
                stockOnHand: 40
            }, {
                stockEventLineItemId: 'line-2',
                orderable: {
                    productCode: 'C200'
                },
                source: {
                    name: 'Central WH'
                },
                quantity: 25,
                stockOnHand: 20
            }, {
                stockEventLineItemId: 'line-3',
                orderable: {
                    productCode: 'C300'
                },
                reason: {
                    id: 'reason-damaged',
                    name: 'Damaged',
                    reasonCategory: 'ADJUSTMENT',
                    reasonType: 'DEBIT',
                    tags: ['adjustment']
                },
                quantity: 5,
                stockOnHand: 15
            }]
        };

        module('stock-transaction-history', function($provide) {
            getLineItemsSpy = jasmine.createSpy('getLineItems');
            summaryQuerySpy = jasmine.createSpy('query');
            $provide.factory('TransactionHistoryResource', function() {
                return function() {
                    return {
                        getLineItems: getLineItemsSpy
                    };
                };
            });
            $provide.factory('StockCardSummaryRepository', function() {
                return function() {
                    return {
                        query: summaryQuerySpy
                    };
                };
            });
            $provide.factory('StockCardSummaryRepositoryImpl', function() {
                return function() {
                    return {};
                };
            });
        });

        inject(function($injector) {
            transactionHistoryReverseFactory =
                $injector.get('transactionHistoryReverseFactory');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
        });

        summaryPage = {
            content: [{
                canFulfillForMe: [{
                    orderable: {
                        id: 'orderable-1'
                    },
                    lot: {
                        id: 'lot-1'
                    },
                    stockOnHand: 300
                }]
            }]
        };
        getLineItemsSpy.andReturn($q.resolve(page));
        summaryQuerySpy.andReturn($q.resolve(summaryPage));
    });

    function load(stockEventId) {
        let rows;
        transactionHistoryReverseFactory
            .getLineItems(stockEventId || 'event-1', 'facility-1', 'program-1')
            .then(function(result) {
                rows = result;
            });
        $rootScope.$apply();
        return rows;
    }

    afterEach(function() {
        transactionHistoryReverseFactory.clear();
    });

    it('should take the current stock on hand from the stock card summary', function() {
        const rows = load();

        expect(rows[0].$currentStockOnHand).toEqual(300);
        expect(rows[0].stockOnHand).toEqual(40);
    });

    it('should fall back to the historical stock on hand when the summary has no match',
        function() {
            summaryQuerySpy.andReturn($q.resolve({
                content: []
            }));

            const rows = load();

            expect(rows[0].$currentStockOnHand).toEqual(40);
        });

    it('should fall back to the historical stock on hand when the summary cannot be loaded',
        function() {
            summaryQuerySpy.andReturn($q.reject());

            const rows = load();

            expect(rows[0].$currentStockOnHand).toEqual(40);
        });

    it('should request every line item of the event in one page', function() {
        load();

        expect(getLineItemsSpy).toHaveBeenCalledWith('event-1', {
            page: 0,
            size: 2147483647
        });
    });

    it('should mark a line with a destination as an issue reversed by a credit', function() {
        const rows = load();

        expect(rows[0].$isIssue).toBe(true);
        expect(rows[0].$isReceive).toBe(false);
        expect(rows[0].$reversalReasonType).toEqual('CREDIT');
    });

    it('should mark a line with a source as a receive reversed by a debit', function() {
        const rows = load();

        expect(rows[1].$isIssue).toBe(false);
        expect(rows[1].$isReceive).toBe(true);
        expect(rows[1].$reversalReasonType).toEqual('DEBIT');
    });

    it('should start every row unselected and reversible', function() {
        const rows = load();

        expect(rows[0].$selected).toBe(false);
        expect(rows[0].$errors).toEqual({});
        expect(rows[0].$reversible).toBe(true);
        expect(rows[1].$reversible).toBe(true);
        expect(rows[2].$reversible).toBe(true);
    });

    it('should still allow reversing a line whose event line item id is missing', function() {
        delete page.content[0].stockEventLineItemId;

        const rows = load();

        expect(rows[0].$reversible).toBe(true);
    });

    it('should not allow reversing a line that a cancellation event already reverses', function() {
        page.content[0].cancellationEventId = 'cancellation-event';

        const rows = load();

        expect(rows[0].$alreadyReversed).toBe(true);
        expect(rows[0].$reversible).toBe(false);
    });

    it('should allow reversing a line no cancellation event points at', function() {
        const rows = load();

        expect(rows[0].$alreadyReversed).toBe(false);
        expect(rows[0].$reversible).toBe(true);
    });

    it('should mark an adjustment line as reversed by the opposite of its own reason type',
        function() {
            const rows = load();

            expect(rows[2].$isIssue).toBe(false);
            expect(rows[2].$isReceive).toBe(false);
            expect(rows[2].$reversalReasonType).toEqual('CREDIT');
            expect(rows[2].$reversalScopeTag).toEqual('cancelAdjustment');
            expect(rows[2].$reversible).toBe(true);
        });

    it('should reverse a credit adjustment with a debit', function() {
        page.content[2].reason.reasonType = 'CREDIT';

        const rows = load();

        expect(rows[2].$reversalReasonType).toEqual('DEBIT');
    });

    it('should scope a movement row to the movement cancel reasons', function() {
        const rows = load();

        expect(rows[0].$reversalScopeTag).toEqual('cancelMovement');
        expect(rows[1].$reversalScopeTag).toEqual('cancelMovement');
    });

    it('should not allow reversing a physical inventory line, which carries no reason', function() {
        delete page.content[0].destination;

        const rows = load();

        expect(rows[0].$reversible).toBe(false);
    });

    it('should not allow reversing a kit unpack line', function() {
        page.content[2].reason.reasonCategory = 'AGGREGATION';

        const rows = load();

        expect(rows[2].$reversible).toBe(false);
    });

    it('should not allow reversing a line that is itself a cancellation', function() {
        page.content[2].reason.tags = ['cancel', 'cancelMovement'];

        const rows = load();

        expect(rows[2].$reversible).toBe(false);
    });

    it('should serve the same row objects on later calls so selections survive paging', function() {
        const first = load();
        first[0].$selected = true;

        const second = load();

        expect(second).toBe(first);
        expect(second[0].$selected).toBe(true);
        expect(getLineItemsSpy.calls.length).toEqual(1);
    });

    it('should reload after the cache is cleared', function() {
        const first = load();
        first[0].$selected = true;
        transactionHistoryReverseFactory.clear();

        const second = load();

        expect(second).not.toBe(first);
        expect(second[0].$selected).toBe(false);
        expect(getLineItemsSpy.calls.length).toEqual(2);
    });
});
