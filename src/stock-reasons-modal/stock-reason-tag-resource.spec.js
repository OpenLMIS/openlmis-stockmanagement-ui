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

describe('StockReasonTagResource', function() {

    var stockReasonTagResource, StockReasonTagResource, $httpBackend, openlmisUrlFactory, url, tags;

    beforeEach(function() {
        module('stock-reasons-modal');

        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            StockReasonTagResource = $injector.get('StockReasonTagResource');
            openlmisUrlFactory = $injector.get('openlmisUrlFactory');
        });

        url = openlmisUrlFactory('/api/stockCardLineItemReasonTags');

        tags = [
            'TagOne',
            'TagTwo',
            'TagThree'
        ];

        stockReasonTagResource = new StockReasonTagResource(url);
    });

    describe('query', function() {

        it('should return list if request was successful', function() {
            $httpBackend
            .expectGET(url)
            .respond(200, tags);

            var result;
            stockReasonTagResource.query()
            .then(function(response) {
                result = response;
            });
            $httpBackend.flush();

            expect(angular.toJson(result)).toEqual(angular.toJson(tags));
        });

        it('should reject if any of the requests fails', function() {
            $httpBackend
            .expectGET(url)
            .respond(404);

            var rejected;
            stockReasonTagResource.query()
            .catch(function() {
                rejected = true;
            });
            $httpBackend.flush();

            expect(rejected).toEqual(true);
        });

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingRequest();
        $httpBackend.verifyNoOutstandingExpectation();
    });

});
