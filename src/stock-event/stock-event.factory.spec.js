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

describe('StockEventFactory', function() {

    var stockEventFactory, PhysicalInventoryDataBuilder, PhysicalInventoryLineItemDataBuilder, PhysicalInventoryLineItemAdjustmentDataBuilder,
        OrderableDataBuilder, LotDataBuilder, physicalInventory;

    beforeEach(function() {
        module('stock-event');
        // we need this module for builders but we cannot add it to the above module
        // dependencies because it is already in the below module dependencies
        module('stock-physical-inventory');

        inject(function($injector) {
            stockEventFactory = $injector.get('stockEventFactory');

            PhysicalInventoryDataBuilder = $injector.get('PhysicalInventoryDataBuilder');
            PhysicalInventoryLineItemDataBuilder = $injector.get('PhysicalInventoryLineItemDataBuilder');
            PhysicalInventoryLineItemAdjustmentDataBuilder = $injector.get('PhysicalInventoryLineItemAdjustmentDataBuilder');

            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            LotDataBuilder = $injector.get('LotDataBuilder');
        });

        var orderable1 = new OrderableDataBuilder().withFullProductName('Streptococcus Pneumoniae Vaccine II').build(),
            orderable2 = new OrderableDataBuilder().build(),
            lot = new LotDataBuilder().build(),
            stockAdjustments = [new PhysicalInventoryLineItemAdjustmentDataBuilder().build()],
            physicalInventoryLineItems = [
                new PhysicalInventoryLineItemDataBuilder().withOrderable(orderable1).withStockAdjustments(stockAdjustments).buildAsAdded(),
                new PhysicalInventoryLineItemDataBuilder().withOrderable(orderable2).withStockOnHand(null).withQuantity(4).buildAsAdded(),
                new PhysicalInventoryLineItemDataBuilder().withOrderable(orderable2).withLot(lot).withStockOnHand(null).withQuantity(null).buildAsAdded()
            ];

        physicalInventory = new PhysicalInventoryDataBuilder().withLineItems(physicalInventoryLineItems).build();
    });

    it("should create stock event from physical inventory", function () {
        var event = stockEventFactory.createFromPhysicalInventory(physicalInventory);

        expect(event.id).toBeUndefined();
        expect(event.resourceId).toEqual(physicalInventory.id);
        expect(event.lineItems.length).toEqual(3);

        for (i = 0; i < physicalInventory.lineItems.length; i += 1) {
            expect(event.lineItems[i].orderableId).toEqual(physicalInventory.lineItems[i].orderable.id);

            if (physicalInventory.lineItems[i].lot) {
                expect(event.lineItems[i].lotId).toEqual(physicalInventory.lineItems[i].lot.id);
            } else {
                expect(event.lineItems[i].lotId).toEqual(null);
            }

            expect(event.lineItems[i].quantity).toEqual(physicalInventory.lineItems[i].quantity);
            expect(event.lineItems[i].occurredDate).toEqual(physicalInventory.occurredDate);
            expect(event.lineItems[i].vvmStatus).toEqual(physicalInventory.lineItems[i].vvmStatus);

            for (j = 0; j < physicalInventory.lineItems[i].stockAdjustments.length; j += 1) {
                expect(event.lineItems[i].stockAdjustments[j].reasonId).toEqual(physicalInventory.lineItems[i].stockAdjustments[j].reason.id);
                expect(event.lineItems[i].stockAdjustments[j].quantity).toEqual(physicalInventory.lineItems[i].stockAdjustments[j].quantity);
            }
        }
    });
});
