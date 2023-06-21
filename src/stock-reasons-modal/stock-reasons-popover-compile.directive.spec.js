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

describe('stockReasons popover compile', function() {

    beforeEach(module('stock-reasons-modal'));

    it('adds popover and input-control controllers to element', inject(function($rootScope, $compile) {
        var element,
            scope = $rootScope.$new(),
            html = '<stock-reasons ng-model="adjustments" line-item="lineItem" reasons="reasons"' +
                        'is-disabled="isDisabled" />';

        scope.adjustments = [];
        scope.lineItem = {};
        scope.reasons = [];
        scope.isDisabled = false;

        element = $compile(html)(scope);

        expect(element.attr('input-control')).not.toBeUndefined();
        expect(element.attr('openlmis-popover')).not.toBeUndefined();
    }));

});
