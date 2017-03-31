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
   * @ngdoc service
   * @name stockmanagement-add-product.addProductModalService
   *
   * @description
   * This service will pop up a modal window for user to select products.
   */
  angular
    .module('stockmanagement-add-products')
    .service('addProductsModalService', service);

  service.$inject = [
    '$q', '$rootScope', '$compile', '$templateRequest',
    '$ngBootbox', 'messageService', '$controller'
  ];

  function service($q, $rootScope, $compile, $templateRequest, $ngBootbox, messageService,
                   $controller) {
    this.show = show;

    /**
     * @ngdoc method
     * @methodOf stockmanagement-add-product.addProductModalService
     * @name show
     *
     * @description
     * Shows modal that allows users to choose products.
     *
     * @return {Promise} resolved with selected products.
     */
    function show(items) {
      var deferred = $q.defer();
      var scope = $rootScope.$new();

      scope.vm = $controller('AddProductsModalController', {
        deferred: deferred,
        items: items
      });

      $templateRequest('stockmanagement-add-products/add-products-modal.html')
        .then(function (template) {
          $ngBootbox.customDialog(
            {
              title: messageService.get('label.stockmanagement.physicalInventory.addProducts'),
              message: $compile(template)(scope),
              className: 'add-products-modal'
            });
        });

      return deferred.promise;
    }
  }

})();
