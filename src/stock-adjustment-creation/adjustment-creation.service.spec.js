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

describe('stockAdjustmentCreationService', function() {

    var service, messageService, stockEventRepositoryMock, $q, $rootScope, lineItem1, lineItem2, lineItem3;

    beforeEach(function() {
        module('stock-adjustment-creation', function($provide) {
            stockEventRepositoryMock = jasmine.createSpyObj('stockEventRepository', ['create']);
            $provide.factory('StockEventRepository', function() {
                return function() {
                    return stockEventRepositoryMock;
                };
            });
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            service = $injector.get('stockAdjustmentCreationService');
            messageService = $injector.get('messageService');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');

            lineItem1 = {
                orderable: {
                    id: 'c9e65f02-f84f-4ba2-85f7-e2cb6f0989af',
                    productCode: 'C1',
                    fullProductName: 'Streptococcus Pneumoniae Vaccine II',
                    dispensable: {
                        displayUnit: ''
                    }
                },
                stockOnHand: 100,
                quantity: 233,
                reason: {
                    id: 'r1',
                    name: 'clinic return'
                },
                reasonFreeText: 'free',
                occurredDate: '2016-04-01',
                assignment: {
                    name: 'WH-001'
                },
                srcDstFreeText: 'good source'
            };
            lineItem2 = {
                orderable: {
                    id: '2400e410-b8dd-4954-b1c0-80d8a8e785fc',
                    productCode: 'C2',
                    fullProductName: 'Acetylsalicylic Acid',
                    dispensable: {
                        displayUnit: 'each'
                    }
                },
                stockOnHand: null,
                quantity: 4,
                reason: {
                    id: 'r1',
                    name: 'clinic return'
                },
                reasonFreeText: 'donate',
                occurredDate: '2017-04-01 GMT+02:00'
            };
            lineItem3 = {
                orderable: {
                    id: '2400e410-b8dd-4954-b1c0-80d8a8e785fc',
                    productCode: 'C2',
                    fullProductName: 'Acetylsalicylic Acid',
                    dispensable: {
                        displayUnit: 'each'
                    }
                },
                stockOnHand: 1000,
                quantity: null,
                reason: {
                    id: 'r2',
                    name: 'damage'
                },
                occurredDate: '2017-04-01 GMT-02:00',
                assignment: {
                    name: 'WH-xyz'
                },
                srcDstFreeText: 'bad destination'
            };

        });
    });

    describe('search', function() {
        var addedItems;

        beforeEach(function() {
            addedItems = [lineItem1, lineItem2, lineItem3];
        });

        it('should search by productCode', function() {
            expect(angular.equals(service.search('c2', addedItems), [lineItem2, lineItem3])).toBeTruthy();
        });

        it('should search by fullProductName', function() {
            spyOn(messageService, 'get').andCallFake(function(message) {
                if (message === 'stockProductName.productWithDisplayUnit') {
                    return 'Acetylsalicylic Acid - each';
                }
                return message;

            });

            expect(angular.equals(service.search('Vaccine', addedItems), [lineItem1])).toBeTruthy();
        });

        it('should search by stockOnHand', function() {
            expect(angular.equals(service.search('10', addedItems), [lineItem1, lineItem3])).toBeTruthy();
        });

        it('should search by reason name', function() {
            expect(angular.equals(service.search('damage', addedItems), [lineItem3])).toBeTruthy();
        });

        it('should search by reason free text', function() {
            expect(angular.equals(service.search('donate', addedItems), [lineItem2])).toBeTruthy();
        });

        it('should search by quantity', function() {
            expect(angular.equals(service.search('233', addedItems), [lineItem1])).toBeTruthy();
        });

        it('should consider timezone in search by occurredDate', function() {
            expect(service.search('01/04/2017', addedItems)).toEqual([lineItem3]);
            expect(service.search('31/03/2017', addedItems)).toEqual([lineItem2]);
        });

        it('should search by assignment name', function() {
            expect(service.search('wh', addedItems)).toEqual([lineItem1, lineItem3]);
        });

        it('should search by assignment free text', function() {
            expect(service.search('destination', addedItems)).toEqual([lineItem3]);
        });

        it('should return all items when keyword is empty', function() {
            expect(angular.equals(service.search('', addedItems), [lineItem1, lineItem2, lineItem3])).toBeTruthy();
        });

        it('should search by non-existence phrase', function() {
            lineItem1.reason.name = undefined;

            expect(angular.equals(service.search('fff', addedItems), [])).toBeTruthy();
        });

    });

    describe('submit adjustments', function() {
        it('should submit adjustments', function() {
            var programId = 'p01';
            var facilityId = 'f01';
            var orderableId = 'o01';
            var reasonId = 'r01';
            var date = new Date();
            var sourceId = 'wh-001';
            var srcDstFreeText = 'donate';
            var lineItems = [{
                orderable: {
                    id: orderableId
                },
                quantity: 100,
                occurredDate: date,
                vvmStatus: 'STAGE_1',
                reason: {
                    id: reasonId,
                    isFreeTextAllowed: false
                },
                assignment: {
                    node: {
                        id: sourceId
                    }
                },
                srcDstFreeText: srcDstFreeText
            }];

            var event = {
                programId: programId,
                facilityId: facilityId,
                lineItems: [{
                    orderableId: orderableId,
                    lotId: null,
                    quantity: 100,
                    extraData: {
                        vvmStatus: 'STAGE_1'
                    },
                    occurredDate: date,
                    reasonId: reasonId,
                    sourceId: sourceId,
                    sourceFreeText: srcDstFreeText
                }]
            };

            spyOn($rootScope, '$emit');
            stockEventRepositoryMock.create.andReturn($q.resolve(event));

            service.submitAdjustments(programId, facilityId, lineItems, {
                state: 'receive'
            });
            $rootScope.$apply();

            expect(stockEventRepositoryMock.create).toHaveBeenCalledWith(event);
            expect($rootScope.$emit)
                .toHaveBeenCalledWith('openlmis-referencedata.offline-events-indicator');
        });
    });
});

