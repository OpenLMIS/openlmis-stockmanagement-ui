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

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name stock-transaction-history.TransactionHistoryResource
     *
     * @description
     * Communicates with the GET /api/stockEvents endpoint used by the transaction history list
     * (query) and detail (get by id) views, and with the cancel endpoint used by the reverse view.
     */
    angular
        .module('stock-transaction-history')
        .factory('TransactionHistoryResource', TransactionHistoryResource);

    TransactionHistoryResource.$inject = [
        'OpenlmisResource', 'classExtender', '$resource', '$http'
    ];

    function TransactionHistoryResource(OpenlmisResource, classExtender, $resource, $http) {

        classExtender.extend(TransactionHistoryResource, OpenlmisResource);

        TransactionHistoryResource.prototype.getLineItems = getLineItems;
        TransactionHistoryResource.prototype.cancel = cancel;

        return TransactionHistoryResource;

        function TransactionHistoryResource() {
            this.super('/api/stockEvents');
            this.lineItemsResource = $resource(this.resourceUrl + '/:id/lineItems');
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.TransactionHistoryResource
         * @name getLineItems
         *
         * @description
         * Retrieves a page of the line items (transaction detail) for a single stock event from
         * GET /api/stockEvents/{id}/lineItems, forwarding the page and size params for server-side
         * pagination.
         *
         * @param  {String}  id     the stock event id
         * @param  {Object}  params the pagination params (page, size)
         * @return {Promise}        the promise resolving to the paginated server response
         */
        function getLineItems(id, params) {
            const pageParams = params || {};
            return this.lineItemsResource.get({
                id: id,
                page: pageParams.page,
                size: pageParams.size
            }).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.TransactionHistoryResource
         * @name cancel
         *
         * @description
         * Cancels the given line items of a stock event through
         * POST /api/stockEvents/{id}/cancel. The server answers with the id of the created
         * cancellation event, or with a 400 listing the line items that block the cancellation.
         *
         * @param  {String}  id      the stock event id
         * @param  {Object}  request the signature and the line items with their cancel reasons
         * @return {Promise}         the promise resolving to the cancellation event id
         */
        function cancel(id, request) {
            return $http.post(this.resourceUrl + '/' + id + '/cancel', request)
                .then(function(response) {
                    return unwrapCancellationEventId(response.data);
                });
        }

        function unwrapCancellationEventId(data) {
            if (angular.isObject(data)) {
                return data.id;
            }
            return angular.isString(data) ? data.replace(/^"|"$/g, '') : data;
        }
    }
})();
