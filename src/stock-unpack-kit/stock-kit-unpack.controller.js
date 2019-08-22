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
     * @ngdoc controller
     * @name stock-unpack-kit.controller:KitUnpackController
     *
     * @description
     * Controller for making adjustment.
     */
    angular
        .module('stock-unpack-kit')
        .controller('KitUnpackController', controller);

    controller.$inject = ['$state', 'facility', 'unpackKits'];

    function controller($state, facility, unpackKits) {
        var vm = this;

        vm.$onInit = function() {
            vm.facility = facility;
            vm.unpackKits = unpackKits;
        };

        vm.proceed = function(kit) {
            // $state.go('openlmis.stockmanagement.' + adjustmentType.state + '.creation', {
            //     programId: program.id,
            //     program: program,
            //     facility: facility,
            //     draft: draft
            // });
            console.log('click uppack button', kit);
        };
    }
})();
