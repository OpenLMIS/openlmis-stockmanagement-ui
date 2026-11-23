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

// The alert has to open while the rejection is handled: the global server error handler shows its
// generic alert shortly after, and skips it while another alert is open.
export const handleAlreadySubmitted = (response, physicalInventoryService, alertService, leave) => {
    if (!physicalInventoryService.isAlreadySubmitted(response)) {
        return false;
    }

    alertService.error('stockPhysicalInventory.alreadySubmitted');
    leave();

    return true;
};
