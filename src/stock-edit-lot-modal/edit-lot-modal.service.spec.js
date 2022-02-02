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

describe('editLotModalService', function() {

    var that = this;

    beforeEach(function() {

        module('stock-edit-lot-modal');

        inject(function($injector) {
            that.openlmisModalService = $injector.get('openlmisModalService');
            that.editLotModalService = $injector.get('editLotModalService');
            that.LotDataBuilder = $injector.get('LotDataBuilder');
            that.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            that.$q = $injector.get('$q');
        });

        that.promise = that.$q.defer();
        spyOn(that.openlmisModalService, 'createDialog').andCallFake(function(config) {
            that.config = config;
            return that.promise;
        });

        that.selectedItem =
            {
                orderable: new that.OrderableDataBuilder().build(),
                lot: new that.LotDataBuilder().build()
            };

    });

    describe('show', function() {

        it('should call createDialog function', function() {

            that.editLotModalService.show(that.selectedItem, that.allLineItems, that.addedLineItems);

            expect(that.openlmisModalService.createDialog).toHaveBeenCalled();

            expect(that.config.controller).toBe('EditLotModalController');
            expect(that.config.controllerAs).toBe('vm');
            expect(that.config.templateUrl).toBe('stock-edit-lot-modal/edit-lot-modal.html');
            expect(that.config.show).toBeTruthy();
            expect(angular.isFunction(that.config.resolve.selectedItem)).toBeTruthy();
            expect(angular.isFunction(that.config.resolve.allLineItems)).toBeTruthy();
            expect(angular.isFunction(that.config.resolve.addedLineItems)).toBeTruthy();
        });
    });
});