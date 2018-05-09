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

describe('StockReasonRepositoryImpl', function() {

    var stockReasonRepositoryImpl, StockReasonRepositoryImpl, $q, $rootScope, PageDataBuilder, ReasonDataBuilder,
        validReasonResourceMock, stockReasonResourceMock, ValidReasonAssignmentDataBuilder, reason,
        validReason, validReason2;

    beforeEach(function() {
        module('stock-valid-reason');
        module('stock-reason', function($provide) {
            validReasonResourceMock = jasmine.createSpyObj('validReasonResource', ['create']);
            $provide.factory('ValidReasonResource', function() {
                return function() {
                    return validReasonResourceMock;
                };
            });

            stockReasonResourceMock = jasmine.createSpyObj('stockReasonResource', ['create', 'query']);
            $provide.factory('StockReasonResource', function() {
                return function() {
                    return stockReasonResourceMock;
                };
            });
        });

        inject(function($injector) {
            StockReasonRepositoryImpl = $injector.get('StockReasonRepositoryImpl');
            ValidReasonAssignmentDataBuilder = $injector.get('ValidReasonAssignmentDataBuilder');
            PageDataBuilder = $injector.get('PageDataBuilder');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
        });

        stockReasonRepositoryImpl = new StockReasonRepositoryImpl();
        validReason = new ValidReasonAssignmentDataBuilder().build();
        validReason2 = new ValidReasonAssignmentDataBuilder().build();
        reason = new ReasonDataBuilder()
            .withoutId()
            .withAssignments([validReason, validReason2])
            .build();

        stockReasonResourceMock.create.andReturn($q.resolve(reason));
        validReasonResourceMock.create.andReturn($q.resolve(validReason));
        stockReasonResourceMock.query.andReturn($q.resolve(
            new PageDataBuilder().withContent([validReason, validReason2])));
    });

    describe('create', function() {

        it('should reject if reason download fails', function() {
            stockReasonResourceMock.create.andReturn($q.reject());

            var rejected;
            stockReasonRepositoryImpl.create(reason)
            .catch(function() {
                rejected = true;
            });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockReasonResourceMock.create).toHaveBeenCalled();
            expect(validReasonResourceMock.create).not.toHaveBeenCalled();
        });

        it('should reject if valid reason download fails', function() {
            validReasonResourceMock.create.andReturn($q.reject());

            var rejected;
            stockReasonRepositoryImpl.create(reason)
            .catch(function() {
                rejected = true;
            });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockReasonResourceMock.create).toHaveBeenCalled();
            expect(validReasonResourceMock.create).toHaveBeenCalled();
        });

        it('should build proper response', function() {
            var result;
            stockReasonRepositoryImpl.create(reason)
            .then(function(response) {
                result = response;
            });
            $rootScope.$apply();

            expect(stockReasonResourceMock.create).toHaveBeenCalled();
            expect(validReasonResourceMock.create).toHaveBeenCalled();
            expect(result).not.toBeUndefined();
        });

        it('should sent a valid reason creation for every assignment', function() {
            var createdReason = new ReasonDataBuilder()
                .withId('some-reason-id')
                .buildResponse();

            stockReasonResourceMock.create.andReturn($q.resolve(createdReason));

            stockReasonRepositoryImpl.create(reason);
            $rootScope.$apply();

            expect(validReasonResourceMock.create).toHaveBeenCalledWith({
                program: validReason.program,
                facilityType: validReason.facilityType,
                reason: {
                    id: createdReason.id
                }
            });
            expect(validReasonResourceMock.create).toHaveBeenCalledWith({
                program: validReason2.program,
                facilityType: validReason2.facilityType,
                reason: {
                   id: createdReason.id
                }
            });
        });
    });

    describe('query', function() {

        it('should reject if reason download fails', function() {
            stockReasonResourceMock.query.andReturn($q.reject());

            var rejected;
            stockReasonRepositoryImpl.query()
            .catch(function() {
                rejected = true;
            });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockReasonResourceMock.query).toHaveBeenCalled();
        });

        it('should build proper response', function() {
            var result;
            stockReasonRepositoryImpl.query()
            .then(function(response) {
                result = response;
            });
            $rootScope.$apply();

            expect(stockReasonResourceMock.query).toHaveBeenCalled();
            expect(result).not.toBeUndefined();
        });
    });
});