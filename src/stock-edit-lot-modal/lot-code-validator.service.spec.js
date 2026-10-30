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

describe('lotCodeValidator', function() {

    beforeEach(function() {
        module('stock-edit-lot-modal');

        inject(function($injector) {
            this.lotCodeValidator = $injector.get('lotCodeValidator');
            this.messageService = $injector.get('messageService');
        });

        spyOn(this.messageService, 'get').andCallFake(function(key) {
            return key;
        });
    });

    describe('validate', function() {

        it('should accept a code of up to 20 characters from the GS1 set', function() {
            expect(this.lotCodeValidator.validate('a-1/.(3)_%:;<=>?!"*+')).toBeUndefined();
            expect(this.lotCodeValidator.validate('A1234567890123456789')).toBeUndefined();
        });

        it('should accept an empty code', function() {
            expect(this.lotCodeValidator.validate(undefined)).toBeUndefined();
            expect(this.lotCodeValidator.validate('')).toBeUndefined();
        });

        it('should refuse a code longer than 20 characters', function() {
            expect(this.lotCodeValidator.validate('A12345678901234567890'))
                .toEqual('stockEditLotModal.lotCodeTooLong');
        });

        it('should refuse a code with a space', function() {
            expect(this.lotCodeValidator.validate('QA AB 1'))
                .toEqual('stockEditLotModal.lotCodeInvalidFormat');
        });

        it('should refuse a code with characters outside the GS1 set', function() {
            expect(this.lotCodeValidator.validate('LOTÉ1')).toEqual('stockEditLotModal.lotCodeInvalidFormat');
            expect(this.lotCodeValidator.validate('LOT#1')).toEqual('stockEditLotModal.lotCodeInvalidFormat');
        });
    });

    describe('messageOf', function() {

        it('should explain a lot code the server refused as too long', function() {
            expect(this.lotCodeValidator.messageOf('referenceData.error.lot.lotCode.tooLong'))
                .toEqual('stockEditLotModal.lotCodeTooLong');
        });

        it('should explain a lot code the server refused for its characters', function() {
            expect(this.lotCodeValidator.messageOf('referenceData.error.lot.lotCode.invalidFormat'))
                .toEqual('stockEditLotModal.lotCodeInvalidFormat');
        });

        it('should return undefined for any other refusal', function() {
            expect(this.lotCodeValidator.messageOf('referenceData.error.lot.lotCode.mustBeUnique')).toBeUndefined();
            expect(this.lotCodeValidator.messageOf(undefined)).toBeUndefined();
        });
    });

    describe('refusedLotCodesMessage', function() {

        it('should explain the rule the refused lot codes break and list them', function() {
            var message = this.lotCodeValidator.refusedLotCodesMessage(
                'referenceData.error.lot.lotCode.invalidFormat', ['QA AB 1', 'QA AB 2']
            );

            expect(message).toEqual('stockEditLotModal.lotCodeInvalidFormat stockEditLotModal.changeLotCodes');

            expect(this.messageService.get).toHaveBeenCalledWith('stockEditLotModal.changeLotCodes', {
                lotCodes: 'QA AB 1, QA AB 2'
            });
        });

        it('should only list lot codes refused for another reason', function() {
            expect(this.lotCodeValidator.refusedLotCodesMessage('referenceData.error.lot.create', ['LOT1', 'LOT2']))
                .toEqual('LOT1, LOT2');
        });
    });
});
