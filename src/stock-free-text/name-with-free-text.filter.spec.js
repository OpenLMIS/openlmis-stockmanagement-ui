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

describe('nameWithFreeTextFilter', function() {

    var filter, messageService, reason;

    beforeEach(function() {
        module('stock-free-text');

        reason = {
            name: 'Transfer In'
        };

        inject(function(_$filter_, _messageService_) {
            filter = _$filter_('nameWithFreeText');
            messageService = _messageService_;
        });
    });

    it('should return the name when no free text is given', function() {
        expect(filter(reason)).toEqual('Transfer In');
    });

    it('should return the name when the free text is empty', function() {
        expect(filter(reason, '')).toEqual('Transfer In');
    });

    it('should return the name with the free text when one is given', function() {
        spyOn(messageService, 'get').andReturn('Transfer In: damaged in transit');

        expect(filter(reason, 'damaged in transit')).toEqual('Transfer In: damaged in transit');
        expect(messageService.get).toHaveBeenCalledWith('stockFreeText.nameWithFreeText', {
            name: 'Transfer In',
            freeText: 'damaged in transit'
        });
    });

    it('should format a source or destination the same way', function() {
        spyOn(messageService, 'get').andReturn('Central WH: nearest depot');

        expect(filter({
            name: 'Central WH'
        }, 'nearest depot')).toEqual('Central WH: nearest depot');
    });

    it('should return an empty string when there is nothing to display', function() {
        expect(filter(undefined, 'ignored')).toEqual('');
        expect(filter(null)).toEqual('');
    });
});
