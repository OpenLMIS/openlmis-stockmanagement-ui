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
        validReason, validReason2, validReason3;

    beforeEach(function() {
        module('stock-valid-reason');
        module('stock-reason', function($provide) {
            validReasonResourceMock = jasmine.createSpyObj('validReasonResource', ['create', 'delete', 'query']);
            $provide.factory('ValidReasonResource', function() {
                return function() {
                    return validReasonResourceMock;
                };
            });

            stockReasonResourceMock = jasmine.createSpyObj('stockReasonResource', ['create', 'query', 'update', 'get']);
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
        validReason3 = new ValidReasonAssignmentDataBuilder().build();
        reason = new ReasonDataBuilder()
            .withoutId()
            .withAddedAssignments([validReason, validReason2])
            .buildJson();

        stockReasonResourceMock.create.and.returnValue($q.resolve(reason));
        validReasonResourceMock.create.and.returnValue($q.resolve(validReason));
        stockReasonResourceMock.query.and.returnValue($q.resolve(
            new PageDataBuilder().withContent([validReason, validReason2])
        ));
        validReasonResourceMock.delete.and.returnValue($q.resolve());
    });

    describe('create', function() {

        it('should reject if reason download fails', function() {
            stockReasonResourceMock.create.and.returnValue($q.reject());

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
            validReasonResourceMock.create.and.returnValue($q.reject());

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

            stockReasonResourceMock.create.and.returnValue($q.resolve(createdReason));

            stockReasonRepositoryImpl.create(reason);
            $rootScope.$apply();

            expect(validReasonResourceMock.create).toHaveBeenCalledWith({
                program: validReason.program,
                facilityType: validReason.facilityType,
                hidden: false,
                reason: {
                    id: createdReason.id
                }
            });

            expect(validReasonResourceMock.create).toHaveBeenCalledWith({
                program: validReason2.program,
                facilityType: validReason2.facilityType,
                hidden: false,
                reason: {
                    id: createdReason.id
                }
            });
        });
    });

    describe('update', function() {

        beforeEach(function() {
            reason = new ReasonDataBuilder()
                .withAddedAssignments([validReason])
                .withRemovedAssignments([validReason3])
                .withAssignments([validReason, validReason2])
                .buildJson();

            stockReasonResourceMock.update.and.returnValue($q.resolve(reason));
            validReasonResourceMock.create.and.returnValue($q.resolve(validReason));
        });

        it('should reject if reason download fails', function() {
            stockReasonResourceMock.update.and.returnValue($q.reject());

            var rejected;
            stockReasonRepositoryImpl.update(reason)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockReasonResourceMock.update).toHaveBeenCalled();
            expect(validReasonResourceMock.create).not.toHaveBeenCalled();
            expect(validReasonResourceMock.delete).not.toHaveBeenCalled();
        });

        it('should reject if valid reason download fails', function() {
            validReasonResourceMock.create.and.returnValue($q.reject());

            var rejected;
            stockReasonRepositoryImpl.update(reason)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockReasonResourceMock.update).toHaveBeenCalled();
            expect(validReasonResourceMock.create).toHaveBeenCalled();
            expect(validReasonResourceMock.delete).toHaveBeenCalled();
        });

        it('should reject if valid reason delete fails', function() {
            validReasonResourceMock.delete.and.returnValue($q.reject());

            var rejected;
            stockReasonRepositoryImpl.update(reason)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockReasonResourceMock.update).toHaveBeenCalled();
            expect(validReasonResourceMock.create).toHaveBeenCalled();
            expect(validReasonResourceMock.delete).toHaveBeenCalled();
        });

        it('should reject if reason is undefined', function() {
            var rejected;

            stockReasonRepositoryImpl.update(undefined)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockReasonResourceMock.update).toHaveBeenCalled();
            expect(validReasonResourceMock.create).not.toHaveBeenCalled();
            expect(validReasonResourceMock.delete).not.toHaveBeenCalled();
        });

        it('should build proper response', function() {
            var result;

            stockReasonRepositoryImpl.update(reason)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(stockReasonResourceMock.update).toHaveBeenCalled();
            expect(validReasonResourceMock.create).toHaveBeenCalled();
            expect(validReasonResourceMock.delete).toHaveBeenCalled();
            expect(result).not.toBeUndefined();
        });

        it('should sent a valid reason creation and deletion for every assignment', function() {
            var response = new ReasonDataBuilder().buildResponse();

            stockReasonResourceMock.update.and.returnValue($q.resolve(response));

            stockReasonRepositoryImpl.update(reason);
            $rootScope.$apply();

            expect(validReasonResourceMock.create).toHaveBeenCalledWith({
                program: validReason.program,
                facilityType: validReason.facilityType,
                hidden: false,
                reason: {
                    id: response.id
                }
            });

            expect(validReasonResourceMock.delete).toHaveBeenCalledWith(validReason3);
        });
    });

    describe('get', function() {

        beforeEach(function() {
            reason = new ReasonDataBuilder()
                .withAssignments([validReason, validReason2])
                .buildJson();
        });

        it('should reject if reason download fails', function() {
            stockReasonResourceMock.get.and.returnValue($q.reject());

            var rejected;
            stockReasonRepositoryImpl.get(reason.id)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockReasonResourceMock.get).toHaveBeenCalled();
            expect(validReasonResourceMock.query).not.toHaveBeenCalled();
        });

        it('should build proper response', function() {
            stockReasonResourceMock.get.and.returnValue($q.resolve(reason));
            validReasonResourceMock.query.and.returnValue($q.resolve([validReason, validReason2]));

            var result;
            stockReasonRepositoryImpl.get(reason.id)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(stockReasonResourceMock.get).toHaveBeenCalled();
            expect(validReasonResourceMock.query).toHaveBeenCalledWith({
                reason: reason.id
            });

            expect(result).not.toBeUndefined();
            expect(result.assignments).toEqual([validReason, validReason2]);
        });
    });

    describe('query', function() {

        it('should reject if reason download fails', function() {
            stockReasonResourceMock.query.and.returnValue($q.reject());

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
