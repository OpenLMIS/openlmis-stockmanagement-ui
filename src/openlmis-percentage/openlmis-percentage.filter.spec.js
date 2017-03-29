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

describe('percentage', function () {
  var filter;

  beforeEach(function () {
    module('physical-inventory');

    inject(function (_$filter_) {
      filter = _$filter_('percentage');
    });
  });

  it('should convert to percentage format with no decimal', function () {
    expect(filter(0)).toEqual('0%');
    expect(filter(0.5555)).toEqual('56%');
    expect(filter(0.5545)).toEqual('55%');
    expect(filter(0.5)).toEqual('50%');
  });

  it('should convert to percentage format with given decimal', function () {
    expect(filter(0.5555, 2)).toEqual('55.55%');
    expect(filter(0.5, 2)).toEqual('50.00%');
  });
});
