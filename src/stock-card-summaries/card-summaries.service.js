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
   * @name stock-card-summaries.stockCardSummariesService
   *
   * @description
   * Responsible for fetching stock card summaries.
   */
  angular
    .module('stock-card-summaries')
    .service('stockCardSummariesService', service);

  service.$inject = ['$q', '$resource', '$window', 'stockmanagementUrlFactory', 'accessTokenFactory', 'openlmisDateFilter', 'productNameFilter', 'SEARCH_OPTIONS', 'messageService'];

  function service($q, $resource, $window, stockmanagementUrlFactory, accessTokenFactory, openlmisDateFilter, productNameFilter,
                   SEARCH_OPTIONS, messageService) {
    var resource = $resource(stockmanagementUrlFactory('/api/stockCardSummaries'), {}, {
      getStockCardSummaries: {
        method: 'GET'
      },
      getStockCardSummariesWithoutCards: {
        url: stockmanagementUrlFactory('/api/stockCardSummaries/noCards'),
        method: 'GET',
        isArray: true
      }
    });

    this.getStockCardSummaries = getStockCardSummaries;
    this.search = search;
    this.print = print;

    function getStockCardSummaries(program, facility, searchOption) {
      searchOption = searchOption || SEARCH_OPTIONS.EXISTING_STOCK_CARDS_ONLY;

      if (searchOption === SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES) {
        return resource.getStockCardSummariesWithoutCards({
          program: program,
          facility: facility
        }).$promise.then(function (result) {
          return getExistingStockCardSummaries(program, facility)
            .then(function (existingStockCardSummaries) {
              return existingStockCardSummaries.concat(result);
            });
        });
      } else {
        return getExistingStockCardSummaries(program, facility);
      }
    }

    function getExistingStockCardSummaries(program, facility) {
      //page size should not be too small, that will cause too many concurrent requests
      //it should not be too large either, that will make the first request too slow
      //we chose 100 based on experiment: https://live.amcharts.com/OTc3Y/
      var pageSize = 100;
      return resource.getStockCardSummaries({
        program: program, facility: facility, size: pageSize
      })
        .$promise.then(function (result) {
          var deferred = $q.defer();
          deferred.resolve(result);
          var promises = [deferred.promise];

          for (var i = 1; i < result.totalPages; i++) {
            promises.push(resource.getStockCardSummaries({
              program: program, facility: facility,
              page: i, size: pageSize
            }).$promise);
          }
          return $q.all(promises).then(function (results) {
            return _.chain(results).sortBy(function (result) {
              return result.number;
            }).map(function (result) {
              return result.content;
            }).flatten().value();
          });
        });
    }

    function search(keyword, items) {
      var result = [];

      if (!_.isEmpty(keyword)) {
        keyword = keyword.trim();
        var hasLot = _.find(items, function (item) {
          return !_.isEmpty(item.lot);
        });

        result = _.filter(items, function (item) {
          var searchableFields = [
            item.orderable.productCode, productNameFilter(item.orderable), item.stockOnHand.toString(),
            item.lot ? item.lot.lotCode.toString() : (hasLot ? messageService.get('stockCardSummaries.noLotDefined') : ""),
            item.lot ? openlmisDateFilter(item.lot.expirationDate) : "",
            openlmisDateFilter(item.lastUpdate)
          ];
          return _.any(searchableFields, function (field) {
            return field.toLowerCase().contains(keyword.toLowerCase());
          });
        })
      } else {
        result = items;
      }

      return result;
    }

    function print(program, facility) {
      var sohPrintUrl = '/api/stockCardSummaries/print';
      var params = 'program=' + program + '&' + 'facility=' + facility;
      $window.open(accessTokenFactory.addAccessToken(
        stockmanagementUrlFactory(sohPrintUrl + '?' + params)), '_blank');
    }
  }
})();
