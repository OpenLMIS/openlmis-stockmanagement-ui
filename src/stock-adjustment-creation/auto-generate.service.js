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

    angular
        .module('stock-adjustment-creation')
        .service('autoGenerateService', service);

    service.$inject = ['dateUtils'];

    var autoLotCodes = {};
    var dateLotMapping = {};

    function service(dateUtils) {
        this.autoGenerateLotCode = function(lineItem) {
            var postFix;
            var date = dateUtils.toDate(lineItem.lot.expirationDate);
            var productCode = lineItem.orderable.productCode;
            var month = ('0' + (date.getMonth() + 1)).slice(-2);
            var year = date.getFullYear();
            var lotCodeKey = 'SEM-LOTE-' + productCode + '-' + month + year;

            var previous = dateLotMapping[productCode + lineItem.lot.expirationDate];
            if (previous) {
                return previous;
            }
            if (_.isUndefined(autoLotCodes[lotCodeKey])) {
                autoLotCodes[lotCodeKey] = 0;
                postFix = 0;
            } else {
                postFix = ++autoLotCodes[lotCodeKey];
            }

            var code = lotCodeKey + '-' + postFix;

            dateLotMapping[productCode + lineItem.lot.expirationDate] = code;
            return code;
        };

    }
})();