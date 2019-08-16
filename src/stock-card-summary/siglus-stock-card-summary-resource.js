//copy from stock-card-summary-resource.js but different request url
(function() {

    'use strict';

    angular
        .module('stock-card-summary')
        .factory('SiglusStockCardSummaryResource', StockCardSummaryResource);

    StockCardSummaryResource.inject = ['OpenlmisResource', 'classExtender'];

    function StockCardSummaryResource(OpenlmisResource, classExtender) {

        classExtender.extend(StockCardSummaryResource, OpenlmisResource);

        return StockCardSummaryResource;

        function StockCardSummaryResource() {
            this.super('/api/siglus/stockCardSummaries');
        }
    }
})();