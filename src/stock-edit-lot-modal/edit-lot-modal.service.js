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
     * @name stock-edit-lot-modal.editLotModalService
     *
     * @description
     * This service will pop up a modal window for user to edit lot.
     */
    angular
        .module('stock-edit-lot-modal')
        .service('editLotModalService', service);

    service.$inject = ['openlmisModalService'];

    function service(openlmisModalService) {

        this.show = show;

        /**
         * @ngdoc method
         * @methodOf stock-edit-lot-modal.editLotModalService
         * @name show
         *
         * @description
         * Shows modal that allows users to edit lot.
         *
         * @param  {Object}   selectedItem          item that was selected on form
         * @param  {Array}    addedLineItems        line items added to form
         * @return {Promise}                        resolved with edited lot
         */
        function show(selectedItem, allLineItems, addedLineItems) {
            return openlmisModalService.createDialog(
                {
                    controller: 'EditLotModalController',
                    controllerAs: 'vm',
                    templateUrl: 'stock-edit-lot-modal/edit-lot-modal.html',
                    show: true,
                    resolve: {
                        selectedItem: function() {
                            return selectedItem;
                        },
                        allLineItems: function() {
                            return allLineItems;
                        },
                        addedLineItems: function() {
                            return addedLineItems;
                        }
                    }
                }
            ).promise.finally(function() {
                angular.element('.popover').popover('destroy');
            });
        }
    }

})();