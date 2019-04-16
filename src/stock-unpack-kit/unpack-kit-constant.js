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
     * @ngdoc object
     * @name stock-unpack-kit.KIT_UNPACK_REASON_ID
     *
     * @description
     * Provides default reason ids for unpack and unpacked from kit.
     */
    angular
        .module('stock-unpack-kit')
        .constant('UNPACK_REASONS', reasons());

    function reasons() {
        var settings = {};
        settings['KIT_UNPACK_REASON_ID'] = '@@KIT_UNPACK_REASON_ID';
        settings['UNPACKED_FROM_KIT_REASON_ID'] = '@@UNPACKED_FROM_KIT_REASON_ID';
        return settings;
    }
})();