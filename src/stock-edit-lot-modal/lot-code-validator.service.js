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
     * @name stock-edit-lot-modal.lotCodeValidator
     *
     * @description
     * Checks a new lot code against the rules the server applies when the lot is saved: at most
     * 20 characters from the GS1 Application Identifier (10) set.
     */
    angular
        .module('stock-edit-lot-modal')
        .service('lotCodeValidator', service);

    service.$inject = ['messageService'];

    function service(messageService) {

        var MAX_LENGTH = 20,
            ALLOWED_CHARACTERS = /^[!"%&'()*+,\-./0-9:;<=>?A-Z_a-z]*$/;

        this.validate = validate;
        this.messageOf = messageOf;
        this.refusedLotsAlert = refusedLotsAlert;

        /**
         * @ngdoc method
         * @methodOf stock-edit-lot-modal.lotCodeValidator
         * @name validate
         *
         * @description
         * Returns the error message for the given lot code, or undefined if it is valid.
         *
         * @param  {String} lotCode the lot code to check
         * @return {String}         the error message
         */
        function validate(lotCode) {
            if (!lotCode) {
                return undefined;
            }

            if (lotCode.length > MAX_LENGTH) {
                return messageService.get('stockEditLotModal.lotCodeTooLong');
            }

            if (!ALLOWED_CHARACTERS.test(lotCode)) {
                return messageService.get('stockEditLotModal.lotCodeInvalidFormat');
            }

            return undefined;
        }

        /**
         * @ngdoc method
         * @methodOf stock-edit-lot-modal.lotCodeValidator
         * @name messageOf
         *
         * @description
         * Returns the error message for a lot code the server refused, or undefined if the server
         * refused it for another reason.
         *
         * @param  {String} messageKey the message key from the server response
         * @return {String}            the error message
         */
        function messageOf(messageKey) {
            if (messageKey === 'referenceData.error.lot.lotCode.tooLong') {
                return messageService.get('stockEditLotModal.lotCodeTooLong');
            }

            if (messageKey === 'referenceData.error.lot.lotCode.invalidFormat') {
                return messageService.get('stockEditLotModal.lotCodeInvalidFormat');
            }

            return undefined;
        }

        /**
         * @ngdoc method
         * @methodOf stock-edit-lot-modal.lotCodeValidator
         * @name refusedLotsAlert
         *
         * @description
         * Returns the title and details of the one alert that lists the lots the server refused. For each
         * reason the details give the rule the lot codes break followed by the lot codes, or only the lot
         * codes if the server refused them for another reason. Returns undefined if no lot was refused.
         *
         * @param  {Array}  errorLots the refused lots, each with lotCode, error and messageKey
         * @return {Object}           the alert title and message
         */
        function refusedLotsAlert(errorLots) {
            var groups = _.groupBy(errorLots, 'error'),
                errors = Object.keys(groups);

            if (errors.length === 1) {
                return {
                    title: errors[0],
                    message: refusedLotCodesMessage(errors[0], groups[errors[0]], false)
                };
            }

            if (errors.length) {
                return {
                    title: 'stockEditLotModal.lotsRefused',
                    message: errors.map(function(error) {
                        return refusedLotCodesMessage(error, groups[error], true);
                    }).join(' ')
                };
            }
        }

        function refusedLotCodesMessage(error, errorLots, withReason) {
            var rule = messageOf(errorLots[0].messageKey),
                lotCodes = _.pluck(errorLots, 'lotCode').join(', ');

            if (rule) {
                return messageService.get('stockEditLotModal.changeLotCodes', {
                    rule: rule,
                    lotCodes: lotCodes
                });
            }

            if (withReason) {
                return messageService.get('stockEditLotModal.refusedLotCodes', {
                    reason: messageService.get(error),
                    lotCodes: lotCodes
                });
            }

            return lotCodes;
        }
    }
})();
