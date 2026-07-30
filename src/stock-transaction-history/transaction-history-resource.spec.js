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

    let TransactionHistoryResource, OpenlmisResourceMock;

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
        const resource = new TransactionHistoryResource();

        expect(resource).toBeDefined();
        expect(OpenlmisResourceMock).toHaveBeenCalledWith('/api/stockEvents');
    });

    it('should request a page of line items for the given event', function() {
        const promise = {};
        const resource = new TransactionHistoryResource();
        resource.lineItemsResource = {
            get: jasmine.createSpy('get').andReturn({
                $promise: promise
            })
        };

        const result = resource.getLineItems('event-1', {
            page: 2,
            size: 20
        });

        expect(resource.lineItemsResource.get).toHaveBeenCalledWith({
            id: 'event-1',
            page: 2,
            size: 20
        });

        expect(result).toBe(promise);
    });

    describe('cancel', function() {

        const request = {
            signature: 'the-signature',
            lineItems: [{
                stockEventLineItemId: 'line-1',
                reasonId: 'reason-1'
            }]
        };

        let $httpBackend, resource;

        beforeEach(function() {
            inject(function($injector) {
                $httpBackend = $injector.get('$httpBackend');
            });

            resource = new TransactionHistoryResource();
            // the mocked OpenlmisResource super does not set this
            resource.resourceUrl = '/api/stockEvents';
        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should resolve with the cancellation event id from the bare quoted UUID body',
            function() {
                let result;
                $httpBackend.expectPOST('/api/stockEvents/event-1/cancel', request)
                    .respond(201, '"cancellation-event"');

                resource.cancel('event-1', request).then(function(id) {
                    result = id;
                });
                $httpBackend.flush();

                expect(result).toEqual('cancellation-event');
            });

        it('should resolve with the cancellation event id when it arrives already parsed',
            function() {
                let result, rejected = false;
                $httpBackend.expectPOST('/api/stockEvents/event-1/cancel')
                    .respond(201, 'cancellation-event');

                resource.cancel('event-1', request)
                    .then(function(id) {
                        result = id;
                    })
                    .catch(function() {
                        rejected = true;
                    });
                $httpBackend.flush();

                expect(rejected).toBe(false);
                expect(result).toEqual('cancellation-event');
            });

        it('should reject with the error message and lineErrors left intact', function() {
            const errorBody = {
                messageKey: 'stockmanagement.error.event.cancellation.validationFailed',
                message: 'One or more line items cannot be cancelled.',
                lineErrors: [{
                    stockEventLineItemId: 'line-1',
                    messageKey: 'stockmanagement.error.event.lineItem.alreadyCancelled',
                    message: 'This line item has already been cancelled.',
                    blockingTransactions: null
                }]
            };
            let rejection;
            $httpBackend.expectPOST('/api/stockEvents/event-1/cancel').respond(400, errorBody);

            resource.cancel('event-1', request).catch(function(response) {
                rejection = response;
            });
            $httpBackend.flush();

            expect(rejection.data.message).toEqual('One or more line items cannot be cancelled.');
            expect(rejection.data.lineErrors.length).toEqual(1);

            expect(rejection.data.lineErrors[0].messageKey)
                .toEqual('stockmanagement.error.event.lineItem.alreadyCancelled');
        });
    });
});
