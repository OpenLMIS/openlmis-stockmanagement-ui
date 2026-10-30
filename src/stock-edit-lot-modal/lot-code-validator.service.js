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
        this.refusedLotCodesMessage = refusedLotCodesMessage;

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
         * @name refusedLotCodesMessage
         *
         * @description
         * Returns the details of the alert that lists the lot codes the server refused: the rule they
         * break followed by the lot codes, or only the lot codes if the server refused them for another
         * reason.
         *
         * @param  {String} messageKey the message key from the server response
         * @param  {Array}  lotCodes   the refused lot codes
         * @return {String}            the alert details
         */
        function refusedLotCodesMessage(messageKey, lotCodes) {
            var rule = messageOf(messageKey);

            if (!rule) {
                return lotCodes.join(', ');
            }

            return rule + ' ' + messageService.get('stockEditLotModal.changeLotCodes', {
                lotCodes: lotCodes.join(', ')
            });
        }
    }
})();
