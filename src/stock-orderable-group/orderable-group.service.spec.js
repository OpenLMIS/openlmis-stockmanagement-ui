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

describe('orderableGroupService', function () {

  var service;

  var lot1 = {id: 'lot id 1'};

  var item1 = {orderable: {id: "a"}, lot: lot1};
  var item2 = {orderable: {id: "a"}};
  var item3 = {orderable: {id: "b"}};


  beforeEach(function () {
    module('stock-orderable-group');
    module('referencedata');

    inject(function (_orderableGroupService_) {
      service = _orderableGroupService_;
    });
  });

  it('should group items by orderable id', function () {
    //given
    var items = [item1, item2, item3];

    //when
    var groups = service.groupByOrderableId(items);

    //then
    expect(groups).toEqual([
      [item1, item2],
      [item3]]);
  });

  it('should find item in group by lot', function () {
    //given
    var items = [item1, item2, item3];

    //when
    var found = service.findByLotInOrderableGroup(items, lot1);

    //then
    expect(found).toBe(item1);
  });

  it('should find item in group by NULL lot', function () {
    //given
    var items = [item1, item2, item3];

    //when
    var found = service.findByLotInOrderableGroup(items, null);

    //then
    expect(found).toBe(item2);
  });

  it('should find lots in orderable group', function () {
    //given
    var group = [item1, item2];

    //when
    var lots = service.lotsOf(group);

    //then
    expect(lots[0]).toEqual({lotCode: "orderableGroupService.noLotDefined"});
    expect(lots[1]).toEqual(lot1);
  });

});
