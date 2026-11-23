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

    describe('refusedLotsAlert', function() {

        it('should explain the rule the refused lot codes break and list them', function() {
            var alert = this.lotCodeValidator.refusedLotsAlert([{
                lotCode: 'QA AB 1',
                error: 'Lot code contains characters that are not allowed by the GS1 standard',
                messageKey: 'referenceData.error.lot.lotCode.invalidFormat'
            }, {
                lotCode: 'QA AB 2',
                error: 'Lot code contains characters that are not allowed by the GS1 standard',
                messageKey: 'referenceData.error.lot.lotCode.invalidFormat'
            }]);

            expect(alert).toEqual({
                title: 'Lot code contains characters that are not allowed by the GS1 standard',
                message: 'stockEditLotModal.changeLotCodes'
            });

            expect(this.messageService.get).toHaveBeenCalledWith('stockEditLotModal.changeLotCodes', {
                rule: 'stockEditLotModal.lotCodeInvalidFormat',
                lotCodes: 'QA AB 1, QA AB 2'
            });
        });

        it('should only list lot codes refused for another reason', function() {
            expect(this.lotCodeValidator.refusedLotsAlert([{
                lotCode: 'LOT1',
                error: 'stockPhysicalInventoryDraft.lotCodeMustBeUnique'
            }, {
                lotCode: 'LOT2',
                error: 'stockPhysicalInventoryDraft.lotCodeMustBeUnique'
            }])).toEqual({
                title: 'stockPhysicalInventoryDraft.lotCodeMustBeUnique',
                message: 'LOT1, LOT2'
            });
        });

        it('should put lot codes refused for different reasons into one alert', function() {
            var alert = this.lotCodeValidator.refusedLotsAlert([{
                lotCode: 'A12345678901234567890',
                error: 'Lot code must be at most 20 characters long',
                messageKey: 'referenceData.error.lot.lotCode.tooLong'
            }, {
                lotCode: 'LOT1',
                error: 'stockPhysicalInventoryDraft.lotCodeMustBeUnique'
            }]);

            expect(alert).toEqual({
                title: 'stockEditLotModal.lotsRefused',
                message: 'stockEditLotModal.changeLotCodes stockEditLotModal.refusedLotCodes'
            });

            expect(this.messageService.get).toHaveBeenCalledWith('stockEditLotModal.refusedLotCodes', {
                reason: 'stockPhysicalInventoryDraft.lotCodeMustBeUnique',
                lotCodes: 'LOT1'
            });
        });

        it('should return undefined if no lot was refused', function() {
            expect(this.lotCodeValidator.refusedLotsAlert([])).toBeUndefined();
        });
    });
});
