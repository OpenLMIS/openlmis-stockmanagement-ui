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

describe('VVM_STATUS', function() {

    var VVM_STATUS;

    beforeEach(function() {
        module('stock-constants');

        inject(function($injector) {
            VVM_STATUS = $injector.get('VVM_STATUS');
        });
    });

    describe('getDisplayName', function() {
        it('should get display name for STAGE_1 status', function() {
            expect(VVM_STATUS.$getDisplayName(VVM_STATUS.STAGE_1)).toBe('stockConstants.stage1');
        });

        it('should get display name for STAGE_2 status', function() {
            expect(VVM_STATUS.$getDisplayName(VVM_STATUS.STAGE_2)).toBe('stockConstants.stage2');
        });
    });
});
