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

describe('StockAdjustmentController', function() {

    var vm, state, facility, programs;

    beforeEach(function() {

        module('stock-adjustment');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.ADJUSTMENT_TYPE = $injector.get('ADJUSTMENT_TYPE');
            this.$controller = $injector.get('$controller');
            this.messageService = $injector.get('messageService');
            this.localStorageService = $injector.get('localStorageService');
        });

        state = jasmine.createSpyObj('$state', ['go']);

        programs = [{
            name: 'HIV',
            id: '1'
        }, {
            name: 'TB',
            id: '2'
        }];
        facility = {
            id: '10134',
            name: 'National Warehouse',
            supportedPrograms: programs
        };

        vm = this.$controller('StockAdjustmentController', {
            facility: facility,
            programs: programs,
            adjustmentType: this.ADJUSTMENT_TYPE.ADJUSTMENT,
            $state: state
        });

        this.events = {};
        this.events['user_1'] = [
            {
                programId: programs[0].id,
                facilityId: facility.id,
                lineItems: [{
                    orderableId: 'orderableid-1'
                }]
            },
            {
                programId: programs[0].id,
                facilityId: facility.id,
                lineItems: [{
                    orderableId: 'orderableid-1',
                    sourceId: 'sourceId-1'
                }]
            }
        ];

        spyOn(this.localStorageService, 'get').and.returnValue(angular.fromJson(this.events));
    });

    it('should init programs properly', function() {
        expect(vm.programs).toEqual(programs);
    });

    it('should go to stock adjustment draft page when proceed', function() {
        var chooseProgram = {
            name: 'HIV',
            id: '1'
        };

        vm.proceed(chooseProgram);

        expect(state.go).toHaveBeenCalledWith('openlmis.stockmanagement.adjustment.creation', {
            programId: '1',
            program: {
                name: 'HIV',
                id: '1'
            },
            facility: facility
        });
    });

    it('should find offline Adjustment events', function() {
        expect(vm.offlineStockEvents()).toEqual(true);
    });

    it('should not find offline events if no Adjustment Type events', function() {
        var receiveEvents = {};
        receiveEvents['user_1'] = [
            {
                programId: programs[0].id,
                facilityId: facility.id,
                lineItems: [{
                    sourceId: 'sourceId-1'
                }]
            }
        ];

        this.localStorageService.get.and.returnValue(angular.fromJson(receiveEvents));

        expect(vm.offlineStockEvents()).toEqual(false);
    });

    it('should go to Pending Offline Events page', function() {
        vm.goToPendingOfflineEventsPage();

        expect(state.go).toHaveBeenCalledWith('openlmis.pendingOfflineEvents');
    });

});
