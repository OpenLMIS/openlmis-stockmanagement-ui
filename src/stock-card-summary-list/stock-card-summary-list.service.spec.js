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

describe('stockCardSummaryListService', function() {

    var productNameFilter, service, stockCardSummaries;

    beforeEach(function() {
        module('stock-card-summary-list', function($provide) {
            productNameFilter = jasmine.createSpyObj('productNameFilter', ['search']);
            $provide.service('productNameFilter', function() {
                return productNameFilter;
            });
        });

        inject(function($injector) {
            service = $injector.get('stockCardSummaryListService');
            productNameFilter = $injector.get('productNameFilter');

            stockCardSummaries = [
                {
                    orderable: {
                        id: '2400e410-b8dd-4954-b1c0-80d8a8e785fc',
                        productCode: 'C2',
                        fullProductName: 'Acetylsalicylic Acid',
                        dispensable: {
                            displayUnit: 'each'
                        }
                    },
                    canFulfillForMe: []
                },
                {
                    orderable: {
                        id: 'c9e65f02-f84f-4ba2-85f7-e2cb6f0989af',
                        productCode: 'C1',
                        fullProductName: 'Streptococcus Pneumoniae Vaccine II',
                        dispensable: {
                            displayUnit: ''
                        }
                    },
                    canFulfillForMe: []
                }
            ];
        });
    });

    describe('search', function() {
        var addedItems;

        beforeEach(function() {
            addedItems = stockCardSummaries;
        });

        it('should return all items when keyword is empty', function() {
            expect(angular.equals(service
                .search('', addedItems), stockCardSummaries)).toBeTruthy();
        });
    });
});