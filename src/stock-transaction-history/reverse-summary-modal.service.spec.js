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

describe('reverseSummaryModalService', function() {

    var that = this;

    beforeEach(function() {

        module('stock-transaction-history');

        inject(function($injector) {
            that.openlmisModalService = $injector.get('openlmisModalService');
            that.reverseSummaryModalService = $injector.get('reverseSummaryModalService');
            that.$q = $injector.get('$q');
        });

        that.deferred = that.$q.defer();
        spyOn(that.openlmisModalService, 'createDialog').andCallFake(function(config) {
            that.config = config;
            return that.deferred;
        });

        that.lineItems = [{
            quantity: 10
        }];
    });

    describe('confirm', function() {

        it('should open the summary modal in confirmation mode', function() {
            that.reverseSummaryModalService.confirm(that.lineItems, true);

            expect(that.openlmisModalService.createDialog).toHaveBeenCalled();

            expect(that.config.controller).toBe('ReverseSummaryModalController');
            expect(that.config.controllerAs).toBe('vm');
            expect(that.config.templateUrl)
                .toBe('stock-transaction-history/reverse-summary-modal.html');

            expect(that.config.show).toBeTruthy();
            expect(that.config.resolve.lineItems()).toBe(that.lineItems);
            expect(that.config.resolve.showInDoses()).toBe(true);
            expect(that.config.resolve.confirmation()).toBe(true);
        });
    });

    describe('show', function() {

        it('should open the summary modal in result mode', function() {
            that.reverseSummaryModalService.show(that.lineItems, false);

            expect(that.openlmisModalService.createDialog).toHaveBeenCalled();

            expect(that.config.controller).toBe('ReverseSummaryModalController');
            expect(that.config.resolve.lineItems()).toBe(that.lineItems);
            expect(that.config.resolve.showInDoses()).toBe(false);
            expect(that.config.resolve.confirmation()).toBe(false);
        });
    });
});
