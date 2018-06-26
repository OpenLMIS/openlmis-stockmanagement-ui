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
     * @name admin-reason-add.AdminReasonAddService
     *
     * @description
     * Responsible for preparing an instance of the Reason class to be displayed on the view by wrapping its methods
     * with utilities like alerts, notifications and loading modal.
     */
    angular
        .module('admin-reason-add')
        .factory('AdminReasonAddService', AdminReasonAddService);

    AdminReasonAddService.inject = [
        'notificationService', 'loadingModalService', 'alertService', 'Reason', 'StockReasonRepository', '$state', '$q'
    ];

    function AdminReasonAddService(notificationService, loadingModalService, alertService, Reason,
                                   StockReasonRepository, $state, $q) {

        AdminReasonAddService.prototype.createReason = createReason;
        AdminReasonAddService.prototype.getReason = getReason;

        return AdminReasonAddService;

        /**
         * @ngdoc method
         * @methodOf admin-reason-add.AdminReasonAddService
         * @name AdminReasonAddService
         * @constructor
         *
         * @description
         * Creates an instance of the AdminReasonAddService class.
         */
        function AdminReasonAddService() {
            this.repository = new StockReasonRepository();
        }

        /**
         * @ngdoc method
         * @methodOf admin-reason-add.AdminReasonAddService
         * @name getReason
         *
         * @description
         * Retrieves reason by id and decorates it's save and addAssignment methods with notifications, alerts and
         * loading modal.
         */
        function getReason(id) {
            if (id) {
                return this.repository.get(id)
                    .then(function(reason) {
                        decorate(reason);
                        return reason;
                    });
            }

            return $q.reject();
        }

        /**
         * @ngdoc method
         * @methodOf admin-reason-add.AdminReasonAddService
         * @name createReason
         *
         * @description
         * Creates a new Reason and decorates it's save and addAssignment methods with notifications, alerts and loading
         * modal.
         */
        function createReason() {
            var reason = new Reason(undefined, this.repository);
            decorate(reason);

            return reason;
        }

        function decorateSave(reason) {
            var originalSave = reason.save;

            reason.save = function() {
                loadingModalService.open();
                return originalSave.apply(this, arguments)
                    .then(function(reason) {
                        notificationService.success('adminReasonAdd.reasonSavedSuccessfully');
                        $state.go('^', {}, {
                            reload: true
                        });
                        return reason;
                    })
                    .catch(function(error) {
                        loadingModalService.close();
                        return $q.reject(error);
                    });
            };
        }

        function decorateAddAssignment(reason) {
            var originalAddAssignment = reason.addAssignment;

            reason.addAssignment = function() {
                return originalAddAssignment.apply(this, arguments)
                    .catch(function(error) {
                        alertService.error(error);
                        return $q.reject(error);
                    });
            };
        }

        function decorate(reason) {
            decorateSave(reason);
            decorateAddAssignment(reason);
        }

    }

})();