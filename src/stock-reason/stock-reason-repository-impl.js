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

    StockReasonRepositoryImpl.inject = ['StockReasonResource', 'ValidReasonResource', '$q', 'Reason'];

    function StockReasonRepositoryImpl(StockReasonResource, ValidReasonResource, $q, Reason) {

        StockReasonRepositoryImpl.prototype.create = create;
        StockReasonRepositoryImpl.prototype.query = query;
        StockReasonRepositoryImpl.prototype.update = update;
        StockReasonRepositoryImpl.prototype.get = get;

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
                    return prepareResponse(createdReason, reason, validReasonResource);
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

        /**
         * @ngdoc method
         * @methodOf stock-reason.StockReasonRepositoryImpl
         * @name update
         *
         * @description
         * Updates an existing stock reason and its valid reason assignments on the OpenLMIS server.
         *
         * @param  {Object}  reason the JSON representation of the reason
         * @return {Promise}        the promise resolving to JSON representation of the created reason
         */
        function update(reason) {
            var validReasonResource = this.validReasonResource;

            return this.stockReasonResource.update(reason)
                .then(function(updatedReason) {
                    return prepareResponse(updatedReason, reason, validReasonResource);
                });
        }

        /**
         * @ngdoc method
         * @methodOf stock-reason.StockReasonRepositoryImpl
         * @name get
         *
         * @description
         * Retrieves an existing stock reason on the OpenLMIS server.
         *
         * @param  {Object}  reason         the JSON representation of the reason
         * @return {Promise}                the promise resolving to JSON representation of the created reason
         */
        function get(reasonId) {
            var validReasonResource = this.validReasonResource;

            return this.stockReasonResource.get(reasonId)
                .then(function(reason) {
                    return validReasonResource.query({
                        reason: reasonId
                    })
                        .then(function(validReasons) {
                            reason.assignments = validReasons;
                            return new Reason(reason, this);
                        });
                });
        }

        function prepareResponse(reasonResponse, reason, validReasonResource) {
            // Changing an assignment's hidden flag removes it and adds it again. The server answers a create
            // for an existing assignment with that assignment unchanged, so the removal has to land first.
            // A deleted assignment leaves the pending list at once: after a failed save the user retries with the
            // same reason, and deleting it again would be refused, holding back the creations behind it.
            var deletions = reason.removedAssignments.map(function(assignment) {
                return validReasonResource.delete(assignment)
                    .then(function() {
                        reason.removedAssignments = reason.removedAssignments.filter(function(pending) {
                            return pending !== assignment;
                        });
                    });
            });

            return $q.all(deletions)
                .then(function() {
                    return $q.all(reason.addedAssignments.map(function(assignment) {
                        return validReasonResource.create({
                            program: assignment.program,
                            facilityType: assignment.facilityType,
                            hidden: assignment.hidden,
                            reason: {
                                id: reasonResponse.id
                            }
                        });
                    }));
                })
                .then(function() {
                    return reasonResponse;
                });
        }

    }

})();