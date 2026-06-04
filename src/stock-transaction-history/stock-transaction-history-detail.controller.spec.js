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

    let vm, $controller, lineItems;

    beforeEach(function() {
        module('stock-transaction-history');

        inject(function($injector) {
            $controller = $injector.get('$controller');
        });

        lineItems = [{
            orderable: {
                productCode: 'C100',
                fullProductName: 'Levora'
            },
            quantity: 60,
            stockOnHand: 140,
            documentNumber: '2026-06-HC01-0001'
        }];

        vm = $controller('TransactionHistoryDetailController', {
            lineItems: lineItems
        });
        vm.$onInit();
    });

    it('should expose line items and the document number from the first line on init', function() {
        expect(vm.lineItems).toEqual(lineItems);
        expect(vm.documentNumber).toEqual('2026-06-HC01-0001');
    });

    it('should leave the document number undefined when there are no line items', function() {
        vm = $controller('TransactionHistoryDetailController', {
            lineItems: []
        });
        vm.$onInit();

        expect(vm.lineItems).toEqual([]);
        expect(vm.documentNumber).toBeUndefined();
    });

    it('should convert lot expirationDate to a Date so openlmisDate shows the correct day', function() {
        const withLot = [{
            orderable: {
                productCode: 'C1'
            },
            lot: {
                lotCode: 'LOT-1',
                expirationDate: '2026-06-02'
            },
            documentNumber: '2026-06-HC01-0001'
        }];

        vm = $controller('TransactionHistoryDetailController', {
            lineItems: withLot
        });
        vm.$onInit();

        expect(vm.lineItems[0].lot.expirationDate instanceof Date).toBe(true);
        expect(vm.lineItems[0].lot.expirationDate.getTime())
            .toEqual(new Date('2026-06-02').getTime());
    });
});
