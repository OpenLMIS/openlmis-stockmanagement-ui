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
     * @name stock-reason.StockReasonRepositoryImpl
     *
     * @description
     * Implementation of the ProofOfDeliveryRepository interface. Communicates with the REST API of the OpenLMIS server.
     */
    angular
        .module('stock-reason')
        .factory('StockReasonRepositoryImpl', StockReasonRepositoryImpl);

    StockReasonRepositoryImpl.inject = ['StockReasonResource', 'ValidReasonResource', '$q'];

    function StockReasonRepositoryImpl(StockReasonResource, ValidReasonResource, $q) {

        StockReasonRepositoryImpl.prototype.create = create;
        StockReasonRepositoryImpl.prototype.query = query;

        return StockReasonRepositoryImpl;

        /**
         * @ngdoc method
         * @methodOf stock-reason.StockReasonRepositoryImpl
         * @name StockReasonRepositoryImpl
         * @constructor
         *
         * @description
         * Creates an instance of the StockReasonRepositoryImpl class.
         */
        function StockReasonRepositoryImpl() {
            this.stockReasonResource = new StockReasonResource();
            this.validReasonResource = new ValidReasonResource();
        }

        /**
         * @ngdoc method
         * @methodOf stock-reason.StockReasonRepositoryImpl
         * @name create
         * 
         * @description
         * Creates a new stock reason on the OpenLMIS server.
         * 
         * @param  {Object}  reason the JSON representation of the reason
         * @return {Promise}        the promise resolving to JSON representation of the created reason
         */
        function create(reason) {
            var validReasonResource = this.validReasonResource;

            return this.stockReasonResource.create(reason)
            .then(function(createdReason) {
                var requests = [];

                reason.assignments.forEach(function(assignment) {
                    requests.push(validReasonResource.create(assignment));
                });

                return $q.all(requests)
                .then(function() {
                    return createdReason;
                });
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-reason.StockReasonRepositoryImpl
         * @name query
         *
         * @description
         * Retrieves a list of all reasons used throughout the system.
         *
         * @param  {Object}  params the request query params
         * @return {Promise}        the promise resolving to a list of reasons
         */
        function query(params) {
            return this.stockReasonResource.query(params);
        }

    }

})();