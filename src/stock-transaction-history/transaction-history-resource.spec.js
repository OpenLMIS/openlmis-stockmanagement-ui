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

describe('TransactionHistoryResource', function() {

    var TransactionHistoryResource, OpenlmisResourceMock;

    beforeEach(function() {
        module('stock-transaction-history', function($provide) {
            OpenlmisResourceMock = jasmine.createSpy('OpenlmisResource');
            $provide.factory('OpenlmisResource', function() {
                return OpenlmisResourceMock;
            });
        });

        inject(function($injector) {
            TransactionHistoryResource = $injector.get('TransactionHistoryResource');
        });
    });

    it('should extend OpenlmisResource for the stockEvents endpoint', function() {
        new TransactionHistoryResource();

        expect(OpenlmisResourceMock).toHaveBeenCalledWith('/api/stockEvents');
    });

    it('should request a page of line items for the given event', function() {
        var promise = {};
        var resource = new TransactionHistoryResource();
        resource.resource = {
            get: jasmine.createSpy('get').andReturn({
                $promise: promise
            })
        };

        var result = resource.getLineItems('event-1', {
            page: 2,
            size: 20
        });

        expect(resource.resource.get).toHaveBeenCalledWith({
            id: 'event-1',
            page: 2,
            size: 20
        });

        expect(result).toBe(promise);
    });
});
