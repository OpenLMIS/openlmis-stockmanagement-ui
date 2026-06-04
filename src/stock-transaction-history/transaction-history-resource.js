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
     * (query) and detail (get by id) views.
     */
    angular
        .module('stock-transaction-history')
        .factory('TransactionHistoryResource', TransactionHistoryResource);

    TransactionHistoryResource.$inject = ['OpenlmisResource', 'classExtender'];

    function TransactionHistoryResource(OpenlmisResource, classExtender) {

        classExtender.extend(TransactionHistoryResource, OpenlmisResource);

        TransactionHistoryResource.prototype.getLineItems = getLineItems;

        return TransactionHistoryResource;

        function TransactionHistoryResource() {
            this.super('/api/stockEvents');
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.TransactionHistoryResource
         * @name getLineItems
         *
         * @description
         * Retrieves a page of the line items (transaction detail) for a single stock event from
         * GET /api/stockEvents/{id}, forwarding the page and size params for server-side pagination.
         *
         * @param  {String}  id     the stock event id
         * @param  {Object}  params the pagination params (page, size)
         * @return {Promise}        the promise resolving to the paginated server response
         */
        function getLineItems(id, params) {
            const pageParams = params || {};
            return this.resource.get({
                id: id,
                page: pageParams.page,
                size: pageParams.size
            }).$promise;
        }
    }
})();
