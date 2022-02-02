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

describe('EditLotModalController', function() {

    var that = this;

    beforeEach(function() {

        module('stock-edit-lot-modal');

        inject(function($injector) {
            that.$controller = $injector.get('$controller');
            that.$rootScope = $injector.get('$rootScope');
            that.$q = $injector.get('$q');
            that.LotDataBuilder = $injector.get('LotDataBuilder');
            that.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
        });

        that.deferred = that.$q.defer();

        that.orderable = new that.OrderableDataBuilder()
            .withIdentifiers({
                tradeItem: 'trade-item-id-1'
            })
            .build();
        that.lot1 = new that.LotDataBuilder().build();
        that.lot2 = new that.LotDataBuilder()
            .withCode('1234')
            .build();

        that.selectedItem = {
            isAdded: true,
            orderable: that.orderable,
            lot: that.lot1
        };

        that.item = {
            isAdded: true,
            orderable: that.orderable,
            lot: that.lot2
        };

        that.vm = that.$controller('EditLotModalController', {
            allLineItems: [that.item, that.selectedItem],
            addedLineItems: [that.item],
            selectedItem: that.selectedItem,
            newLot: that.selectedItem.lot,
            modalDeferred: that.deferred
        });
        that.vm.$onInit();
    });

    describe('modal close', function() {

        it('should not assign values from newLot to selectedItem', function() {
            that.vm.newLot.lotCode = 'test123';

            that.deferred.reject();
            that.$rootScope.$apply();

            expect(that.selectedItem.lot.lotCode).not.toEqual(that.vm.newLot.lotCode);
        });
    });

    describe('updateItem', function() {

        it('should assign values from newLot to selectedItem', function() {
            that.vm.newLot.lotCode = 'test123';
            that.vm.newLot.expirationDate = new Date();

            spyOn(that.deferred, 'resolve');
            that.vm.updateItem();

            expect(that.selectedItem.lot.lotCode).toEqual(that.vm.newLot.lotCode);
            expect(that.selectedItem.lot.expirationDate).toEqual(that.vm.newLot.expirationDate);
        });
    });

    describe('validate', function() {

        it('should assign error message when expirationDate smaller than current date', function() {
            that.vm.newLot.expirationDate = '2019-09-09';

            that.vm.updateItem();

            expect(that.vm.newLot.expirationDateInvalid).toBeDefined();
        });

        it('should not assign error message when expirationDate equals current date', function() {
            that.vm.newLot.expirationDate = new Date();

            that.vm.updateItem();

            expect(that.vm.newLot.expirationDateInvalid).not.toBeDefined();
        });

        it('should assign error message when new lot code exist in allLineItems', function() {
            that.vm.newLot.lotCode = '1234';

            that.vm.updateItem();

            expect(that.vm.newLot.lotCodeInvalid).toBeDefined();
        });

        it('should not assign error message when new lot code not exist in allLineItems', function() {
            that.vm.newLot.lotCode = '2233';

            that.vm.updateItem();

            expect(that.vm.newLot.lotCodeInvalid).not.toBeDefined();
        });
    });
});