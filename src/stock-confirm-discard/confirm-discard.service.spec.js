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

describe("confirmDiscardService", function () {

  var q, scope, confirmDiscardService, $state;

  beforeEach(function () {

    module('stock-confirm-discard');
    module('ui.router');

    inject(function (_confirmDiscardService_, _$state_, _$q_) {
      q = _$q_;
      scope = jasmine.createSpyObj('scope', ['$on']);
      confirmDiscardService = _confirmDiscardService_;
    });
  });

  it('should register handler on scope', function () {
    confirmDiscardService.register(scope);
    expect(scope.$on).toHaveBeenCalledWith('$stateChangeStart', jasmine.any(Function));
  });

  it('should register handler on window', function () {
    confirmDiscardService.register(scope);
    expect(window.onbeforeunload).toBeDefined();
  });

});
