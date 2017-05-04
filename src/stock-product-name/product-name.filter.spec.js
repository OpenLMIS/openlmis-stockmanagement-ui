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

describe('prdocutNameFilter', function () {
  var filter, messageService, orderable1, orderable2;

  beforeEach(function () {
    module('stock-product-name');

    inject(function (_$filter_, _messageService_) {
      filter = _$filter_('productName');
      messageService = _messageService_;
    });

    orderable1 = {
      "fullProductName": "Acetylsalicylic Acid",
      "dispensable": {
        "dispensingUnit": ""
      }
    }

    orderable2 = {
      "fullProductName": "Streptococcus Pneumoniae Vaccine II",
      "dispensable": {
        "dispensingUnit": "each"
      }
    }
  });

  it('should convert to product name with no dispensing unit', function () {
    expect(filter(orderable1)).toEqual('Acetylsalicylic Acid');
  });

  it('should convert to product name with given dispensing unit', function () {
    expect(filter(orderable2)).toEqual('stockProductName.productWithDispensingUnit');
  });
});