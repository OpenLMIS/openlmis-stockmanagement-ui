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

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name stock-physical-inventory-draft.PhysicalInventoryDraftWatcher
     *
     * @description
     * Provides auto-save feature to the draft. Notifies when changes are being made to the
     * watched draft - this can be avoided by silencing the watcher.
     */
    angular
        .module('stock-physical-inventory-draft')
        .factory('PhysicalInventoryDraftWatcher', factory);

    factory.$inject = ['$timeout', 'physicalInventoryDraftCacheService'];

    function factory($timeout, physicalInventoryDraftCacheService) {

        PhysicalInventoryDraftWatcher.prototype.disableWatcher = disableWatcher;
        PhysicalInventoryDraftWatcher.prototype.enableWatcher = enableWatcher;

        return PhysicalInventoryDraftWatcher;

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.PhysicalInventoryDraftWatcher
         * @name PhysicalInventoryDraftWatcher
         *
         * @description
         * Creates physical inventory draft watcher for changes in draft line items.
         *
         * @param  {Scope}              scope       scope that draft is in
         * @param  {Object}             draft draft to set watcher on
         * @return {PhysicalInventoryDraftWatcher}             watcher object
         */
        function PhysicalInventoryDraftWatcher(scope, draft) {
            this.enabled = true;

            addWatcher(scope, draft, 'lineItems', this);
        }

        function enableWatcher() {
            this.enabled = true;
        }

        function disableWatcher() {
            this.enabled = false;
        }

        function addWatcher(scope, draft, valueToWatch, watcher) {
            scope.$watch(function() {
                return draft[valueToWatch];
            }, function(oldValue, newValue) {
                if (oldValue !== newValue && watcher.enabled) {
                    $timeout.cancel(watcher.syncTimeout);
                    watcher.syncTimeout = $timeout(function() {
                        draft.$modified = true;
                        physicalInventoryDraftCacheService.cacheDraft(draft);
                        watcher.syncTimeout = undefined;
                    }, 500);
                }
            }, true);
        }
    }

})();
