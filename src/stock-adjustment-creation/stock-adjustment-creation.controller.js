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
   * @name stock-adjustment-creation.controller:StockAdjustmentCreationController
   *
   * @description
   * Controller for managing stock adjustment creation.
   */
  angular
    .module('stock-adjustment-creation')
    .controller('StockAdjustmentCreationController', controller);

  controller.$inject = ['$scope', 'confirmDiscardService', 'program', 'facility',
    'stockCardSummaries', 'reasons'];

  function controller($scope, confirmDiscardService, program, facility, stockCardSummaries,
                      reasons) {
    var vm = this;

    /**
     * @ngdoc property
     * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name program
     * @type {Object}
     *
     * @description
     * Holds current program info.
     */
    vm.program = program;

    /**
     * @ngdoc property
     * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name facility
     * @type {Object}
     *
     * @description
     * Holds home facility info.
     */
    vm.facility = facility;

    /**
     * @ngdoc property
     * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name reasons
     * @type {Array}
     *
     * @description
     * Holds all reasons filtered by adjustment category.
     */
    vm.reasons = reasons.filter(function (reason) {
      return reason.reasonCategory === 'ADJUSTMENT';
    });

    vm.products = stockCardSummaries.content.map(function (summary) {
      return summary.orderable;
    });

    /**
     * @ngdoc method
     * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name search
     *
     * @description
     * It searches from the total line items with given keyword. If keyword is empty then all line
     * items will be shown.
     */
    vm.search = function () {

    };

    /**
     * @ngdoc method
     * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name addProducts
     *
     * @description
     * Pops up a modal for users to add products for stock adjustment.
     */
    vm.addProducts = function () {

    };

    function onInit() {
      vm.maxDate = new Date();

      confirmDiscardService.register($scope, 'stockmanagement.stockCardSummaries');
    }

    onInit();

  }
})();
