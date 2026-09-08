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

describe('openlmis.stockmanagement.physicalInventory.draft state', function() {

    beforeEach(function() {
        /*
         * The draft state hangs off openlmis.stockmanagement.physicalInventory, which the list module
         * registers - without it the child is queued as an orphan and $state.get returns null.
         */
        module('stock-physical-inventory-list');

        /* The resolve asks for these directly, so they have to be in the graph the test loads. */
        module('openlmis-permissions');
        module('referencedata-user');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$injector = $injector;
            this.$rootScope = $injector.get('$rootScope');
            this.permissionService = $injector.get('permissionService');
            this.authorizationService = $injector.get('authorizationService');
            this.ADMINISTRATION_RIGHTS = $injector.get('ADMINISTRATION_RIGHTS');
        });

        this.state = this.$state.get('openlmis.stockmanagement.physicalInventory.draft');

        spyOn(this.authorizationService, 'getUser').andReturn({
            // eslint-disable-next-line camelcase
            user_id: 'user-id'
        });

        /** Runs the resolve the way ui-router would, so its injections are exercised too. */
        this.resolvePermission = function() {
            var resolved;

            this.$injector.invoke(this.state.resolve.hasPermissionToAddNewLot)
                .then(function(value) {
                    resolved = value;
                });
            this.$rootScope.$apply();

            return resolved;
        };
    });

    /**
     * A count creates the batches it added when it is submitted, so adding one needs the
     * administrative right whether it was typed into the add product modal or scanned. The screen
     * resolves it so a scan can be held to the same rule.
     */
    describe('hasPermissionToAddNewLot', function() {

        it('should be granted to a user holding LOTS_MANAGE', function() {
            spyOn(this.permissionService, 'hasPermissionWithAnyProgramAndAnyFacility')
                .andReturn(this.$q.resolve());

            expect(this.resolvePermission()).toBe(true);
            expect(this.permissionService.hasPermissionWithAnyProgramAndAnyFacility)
                .toHaveBeenCalledWith('user-id', {
                    right: this.ADMINISTRATION_RIGHTS.LOTS_MANAGE
                });
        });

        it('should be refused to a user without it', function() {
            spyOn(this.permissionService, 'hasPermissionWithAnyProgramAndAnyFacility')
                .andReturn(this.$q.reject());

            expect(this.resolvePermission()).toBe(false);
        });
    });
});
