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

describe('Identifiable', function() {

    var Identifiable;

    beforeEach(function() {
        module('stock-products');

        inject(function($injector) {
            Identifiable = $injector.get('Identifiable');
        });
    });

    describe('isEqual', function() {

        it('should return true for objects with id equal', function() {
            var isEqual = new Identifiable({
                id: '123'
            }).isEqual({
                id: '123',
                name: 'Ala'
            });

            expect(isEqual).toBe(true);
        });

        it('should return false for objects with id different', function() {
            var isEqual = new Identifiable({
                id: '123'
            }).isEqual({
                id: '321'
            });

            expect(isEqual).toBe(false);
        });

        it('should return false if provided parameter is null', function() {
            var isEqual = new Identifiable({
                id: '123'
            }).isEqual(null);

            expect(isEqual).toBe(false);
        });
    });

});