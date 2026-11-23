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

import { handleAlreadySubmitted } from './already-submitted';

describe('handleAlreadySubmitted', function() {

    var physicalInventoryService, alertService, leave;

    beforeEach(function() {
        physicalInventoryService = jasmine.createSpyObj('physicalInventoryService', ['isAlreadySubmitted']);
        alertService = jasmine.createSpyObj('alertService', ['error']);
        leave = jasmine.createSpy('leave');
    });

    it('should tell the user to start a new physical inventory and leave the draft if it was already submitted',
        function() {
            var response = {
                data: {
                    messageKey: 'stockmanagement.error.physicalInventory.isSubmitted'
                }
            };
            physicalInventoryService.isAlreadySubmitted.andReturn(true);

            var handled = handleAlreadySubmitted(response, physicalInventoryService, alertService, leave);

            expect(handled).toBe(true);
            expect(physicalInventoryService.isAlreadySubmitted).toHaveBeenCalledWith(response);
            expect(alertService.error).toHaveBeenCalledWith('stockPhysicalInventory.alreadySubmitted');
            expect(leave).toHaveBeenCalled();
        });

    it('should leave any other error to the caller', function() {
        physicalInventoryService.isAlreadySubmitted.andReturn(false);

        var handled = handleAlreadySubmitted({
            status: 500
        }, physicalInventoryService, alertService, leave);

        expect(handled).toBe(false);
        expect(alertService.error).not.toHaveBeenCalled();
        expect(leave).not.toHaveBeenCalled();
    });
});
