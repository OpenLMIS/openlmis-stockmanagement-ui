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

describe('StockEventResource', function() {

    var StockEventResource, OpenlmisResourceMock, $httpBackend, openlmisUrlFactory;

    beforeEach(function() {
        module('stock-event', function($provide) {
            OpenlmisResourceMock = jasmine.createSpy('OpenlmisResource').andCallFake(function(uri) {
                this.resourceUrl = openlmisUrlFactory(uri);
            });

            $provide.factory('OpenlmisResource', function() {
                return OpenlmisResourceMock;
            });

            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            StockEventResource = $injector.get('StockEventResource');
            $httpBackend = $injector.get('$httpBackend');
            openlmisUrlFactory = $injector.get('openlmisUrlFactory');
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should extend OpenlmisResource', function() {
        new StockEventResource();

        expect(OpenlmisResourceMock).toHaveBeenCalledWith(('/api/stockEvents'), {
            paginated: false
        });
    });

    it('should create stock event and resolve to the returned id', function() {
        var event = {
            facilityId: 'facility-id'
        };
        var result;

        $httpBackend
            .expectPOST(openlmisUrlFactory('/api/stockEvents'), event)
            .respond(201, '"stock-event-id"');

        new StockEventResource().create(event)
            .then(function(stockEventId) {
                result = stockEventId;
            });
        $httpBackend.flush();

        expect(result).toEqual('stock-event-id');
    });
});
