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

(function () {

  'use strict';

  /**
   * @ngdoc controller
   * @name stock-card.controller:StockCardController
   *
   * @description
   * Controller in charge of displaying one single stock card.
   */
  angular
    .module('stock-card')
    .controller('StockCardController', controller);

  controller.$inject = ['stockCard', '$state', 'stockCardService'];

  function controller(stockCard, $state, stockCardService) {
    var vm = this;

    vm.stockCard = [];
    vm.displayedLineItems = [];

    /**
     * @ngdoc method
     * @methodOf stock-card.controller:StockCardController
     * @name print
     *
     * @description
     * Print specific stock card.
     *
     */
    vm.print = function () {
      stockCardService.print(vm.stockCard.id);
    };

    function onInit() {
      $state.current.label = stockCard.orderable.fullProductName;

      var items = [];
      var previousSoh;
        angular.forEach(stockCard.lineItems, function (value) {
            if (value.stockAdjustments.length > 0) {
                angular.forEach(value.stockAdjustments.slice().reverse(), function (adjustment, i) {
                    var lineValue = angular.copy(value);
                    if (i !== 0) {
                        lineValue.stockOnHand = previousSoh;
                    }
                    lineValue.reason = adjustment.reason;
                    lineValue.quantity = adjustment.quantity;
                    items.push(lineValue);
                    previousSoh = lineValue.stockOnHand - adjustment.signedQuantity;
                });
            } else {
                items.push(value);
            }
        });

        vm.stockCard = stockCard;
        vm.stockCard.lineItems = items;

    }
    onInit();
  }
})();
