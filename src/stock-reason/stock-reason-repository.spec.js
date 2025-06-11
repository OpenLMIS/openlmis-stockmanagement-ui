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

describe('StockReasonRepository', function() {

    var StockReasonRepository, OpenlmisRepositoryMock, Reason, stockReasonRepositoryImplMock;

    beforeEach(function() {
        module('stock-reason', function($provide) {
            OpenlmisRepositoryMock = jasmine.createSpy('OpenlmisRepository');
            $provide.factory('OpenlmisRepository', function() {
                return OpenlmisRepositoryMock;
            });

            stockReasonRepositoryImplMock = jasmine.createSpy('stockReasonRepositoryImpl');
            $provide.factory('StockReasonRepositoryImpl', function() {
                return function() {
                    return stockReasonRepositoryImplMock;
                };
            });

            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            StockReasonRepository = $injector.get('StockReasonRepository');
            Reason = $injector.get('Reason');
        });
    });

    describe('constructor', function() {

        it('should extend OpenlmisRepository', function() {
            new StockReasonRepository();

            expect(OpenlmisRepositoryMock).toHaveBeenCalledWith(Reason, stockReasonRepositoryImplMock);
        });

        it('should pass the given implementation', function() {
            var implMock = jasmine.createSpyObj('impl', ['create']);

            new StockReasonRepository(implMock);

            expect(OpenlmisRepositoryMock).toHaveBeenCalledWith(Reason, implMock);
        });

    });

});