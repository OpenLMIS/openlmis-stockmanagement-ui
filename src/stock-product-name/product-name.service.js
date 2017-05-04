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
   * @name stock-product-name.productNameService
   *
   * @description
   * Responsible for retrieving product name.
   */
  angular
    .module('stock-product-name')
    .factory('productNameService', productNameService);

  productNameService.$inject = ['messageService'];

  function productNameService(messageService) {

    var service = {
      getProductName: getProductName
    };

    return service;

    /**
     * @ngdoc method
     * @methodOf stock-product-name.productNameService
     * @name getProductName
     *
     * @description
     * Gets product name of orderable.
     *
     * @param  {Object}  orderable.
     * @return {String}  product name.
     */
    function getProductName(orderable) {
      if (orderable.dispensable.dispensingUnit) {
        return messageService.get('stockProductName.productWithDispensingUnit', {
          fullProductName: orderable.fullProductName,
          dispensingUnit: orderable.dispensable.dispensingUnit
        });
      } else {
        return orderable.fullProductName;
      }
    }
  }

})();
