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
     * @name stock-transaction-history.reverseSummaryModalService
     *
     * @description
     * Shows the cancellation summary, either as the confirmation the user has to accept before the
     * reversal is sent (HLD AC#8) or as the result of one the server has just persisted.
     */
    angular
        .module('stock-transaction-history')
        .service('reverseSummaryModalService', service);

    service.$inject = ['openlmisModalService'];

    function service(openlmisModalService) {
        this.confirm = confirm;
        this.show = show;

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.reverseSummaryModalService
         * @name confirm
         *
         * @description
         * Shows the impact of the reversal the user is about to submit - affected products, lots,
         * quantities and the resulting stock on hand per line - and resolves only if they accept it.
         *
         * @param  {Array}   lineItems   the selected rows, with $newStockOnHand set
         * @param  {boolean} showInDoses whether quantities should be shown in doses
         * @return {Promise}             resolved when the user confirms, rejected when they back out
         */
        function confirm(lineItems, showInDoses) {
            return dialog(lineItems, showInDoses, true);
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.reverseSummaryModalService
         * @name show
         *
         * @description
         * Shows a modal listing the reversal line items the server created, with the recalculated
         * stock on hand.
         *
         * @param  {Array}   lineItems   the line items of the cancellation event
         * @param  {boolean} showInDoses whether quantities should be shown in doses
         * @return {Promise}             resolved when the user acknowledges the summary
         */
        function show(lineItems, showInDoses) {
            return dialog(lineItems, showInDoses, false);
        }

        function dialog(lineItems, showInDoses, confirmation) {
            return openlmisModalService.createDialog(
                {
                    controller: 'ReverseSummaryModalController',
                    controllerAs: 'vm',
                    templateUrl: 'stock-transaction-history/reverse-summary-modal.html',
                    show: true,
                    resolve: {
                        lineItems: function() {
                            return lineItems;
                        },
                        showInDoses: function() {
                            return showInDoses;
                        },
                        confirmation: function() {
                            return confirmation;
                        }
                    }
                }
            ).promise;
        }
    }
})();
