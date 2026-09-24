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

describe('onRowLeave directive', function() {

    beforeEach(function() {
        module('stock-adjustment-creation', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$compile = $injector.get('$compile');
            this.$rootScope = $injector.get('$rootScope');
            this.$timeout = $injector.get('$timeout');
        });

        this.$scope = this.$rootScope.$new();
        this.$scope.onLeave = jasmine.createSpy('onLeave');

        this.table = this.$compile(
            '<table>' +
                '<tr on-row-leave="onLeave()">' +
                    '<td><input id="first"/></td>' +
                    '<td><input id="second"/></td>' +
                    '<td id="state">{{state}}</td>' +
                '</tr>' +
            '</table>'
        )(this.$scope);
        this.outside = angular.element('<button>outside</button>');
        this.otherOutside = angular.element('<input id="other"/>');
        angular.element('body')
            .append(this.table)
            .append(this.outside)
            .append(this.otherOutside);
        this.$rootScope.$apply();
        this.$timeout.flush(0);

        this.first = this.table.find('#first');
        this.second = this.table.find('#second');
        this.dropdown = angular.element('<span class="select2-container select2-container--open"></span>');
        this.picker = angular.element('<div class="datepicker"><span class="day">20</span></div>');
    });

    afterEach(function() {
        this.$scope.$destroy();
        this.table.remove();
        this.outside.remove();
        this.otherOutside.remove();
        this.picker.remove();
    });

    it('should evaluate the expression when focus moves out of a used row', function() {
        clickOn(this.first);
        this.outside.focus();
        this.$timeout.flush();

        expect(this.$scope.onLeave).toHaveBeenCalled();
    });

    it('should evaluate the expression when focus moves to no element', function() {
        clickOn(this.first);
        this.first.blur();
        this.$timeout.flush();

        expect(this.$scope.onLeave).toHaveBeenCalled();
    });

    it('should evaluate the expression inside a digest and show the messages of the row', function() {
        var shown = jasmine.createSpy('shown');
        this.$scope.$on('openlmis-form-submit', shown);
        this.$scope.onLeave.andCallFake(function() {
            this.$scope.state = 'left';
        }.bind(this));

        clickOn(this.first);
        this.outside.focus();
        this.$timeout.flush();

        expect(this.table.find('#state').text()).toEqual('left');
        expect(shown).toHaveBeenCalled();
    });

    it('should not evaluate the expression while focus stays in the row', function() {
        clickOn(this.first);
        this.second.focus();
        this.$timeout.flush();

        expect(this.$scope.onLeave).not.toHaveBeenCalled();
    });

    it('should not evaluate the expression for a row that only got focus from the screen', function() {
        this.first.focus();
        this.outside.focus();
        this.$timeout.flush();

        expect(this.$scope.onLeave).not.toHaveBeenCalled();
    });

    it('should count typing in the row as using it', function() {
        this.first.focus();
        pressKey(this.first, {
            key: 'a'
        });
        this.outside.focus();
        this.$timeout.flush();

        expect(this.$scope.onLeave).toHaveBeenCalled();
    });

    it('should not count keys that only move focus or start a shortcut as using the row', function() {
        this.first.focus();
        pressKey(this.first, {
            key: 'Shift'
        });
        pressKey(this.first, {
            key: 'Tab'
        });
        pressKey(this.first, {
            key: 'c',
            metaKey: true
        });
        this.outside.focus();
        this.$timeout.flush();

        expect(this.$scope.onLeave).not.toHaveBeenCalled();
    });

    it('should wait while a select dropdown of the row is open', function() {
        this.table.find('td:last').append(this.dropdown);

        clickOn(this.first);
        this.outside.focus();
        this.$timeout.flush();

        expect(this.$scope.onLeave).not.toHaveBeenCalled();

        this.dropdown.removeClass('select2-container--open');
        this.outside.trigger('mousedown');
        this.$timeout.flush();

        expect(this.$scope.onLeave).toHaveBeenCalled();
    });

    it('should evaluate the expression once when the user leaves after closing the dropdown', function() {
        this.table.find('td:last').append(this.dropdown);

        clickOn(this.first);
        this.outside.focus();
        this.$timeout.flush();
        this.dropdown.removeClass('select2-container--open');
        this.outside.trigger('mousedown');
        this.$timeout.flush();
        this.otherOutside.trigger('mousedown');

        expect(this.$timeout.verifyNoPendingTasks).not.toThrow();
        expect(this.$scope.onLeave.callCount).toBe(1);
    });

    it('should notice a keyboard user leaving after the dropdown closed', function() {
        this.table.find('td:last').append(this.dropdown);

        clickOn(this.first);
        this.outside.focus();
        this.$timeout.flush();
        this.dropdown.removeClass('select2-container--open');
        this.otherOutside.focus();
        this.$timeout.flush();

        expect(this.$scope.onLeave).toHaveBeenCalled();
    });

    it('should keep waiting while the user works in an open dropdown', function() {
        var options = angular.element('<span class="select2-dropdown"><span class="option">A</span></span>');
        this.table.find('td:last').append(this.dropdown);
        angular.element('body').append(options);

        clickOn(this.first);
        this.outside.focus();
        this.$timeout.flush();
        options.find('.option').trigger('mousedown');
        this.$timeout.flush(0);

        expect(this.$scope.onLeave).not.toHaveBeenCalled();

        this.dropdown.removeClass('select2-container--open');
        this.outside.trigger('mousedown');
        this.$timeout.flush();

        expect(this.$scope.onLeave).toHaveBeenCalled();

        options.remove();
    });

    it('should wait while a date picker of the row is shown', function() {
        showPickerFor(this.second, this.picker);

        clickOn(this.first);
        this.outside.focus();
        this.$timeout.flush();

        expect(this.$scope.onLeave).not.toHaveBeenCalled();

        this.picker.hide();
        this.outside.trigger('mousedown');
        this.$timeout.flush();

        expect(this.$scope.onLeave).toHaveBeenCalled();
    });

    it('should not take a date picker closed by a quick click on a day for leaving the row', function() {
        showPickerFor(this.second, this.picker);

        clickOn(this.second);
        this.second.blur();
        this.picker.hide();
        this.$timeout.flush();

        expect(this.$scope.onLeave).not.toHaveBeenCalled();

        this.outside.trigger('mousedown');
        this.outside.focus();
        this.$timeout.flush();

        expect(this.$scope.onLeave).toHaveBeenCalled();
    });

    it('should keep waiting when a click on a date picker day closes it', function() {
        showPickerFor(this.second, this.picker);

        clickOn(this.first);
        this.outside.focus();
        this.$timeout.flush();
        this.picker.find('.day').trigger('mousedown');
        this.picker.hide();
        this.$timeout.flush(0);

        expect(this.$scope.onLeave).not.toHaveBeenCalled();
    });

    it('should wait while focus is in a modal opened from the row', function() {
        var modal = angular.element('<div class="modal"><button>OK</button></div>');
        angular.element('body').append(modal);

        clickOn(this.first);
        modal.find('button').focus();
        this.$timeout.flush();

        expect(this.$scope.onLeave).not.toHaveBeenCalled();

        modal.remove();
        this.outside.trigger('mousedown');
        this.outside.focus();
        this.$timeout.flush();

        expect(this.$scope.onLeave).toHaveBeenCalled();
    });

    it('should not evaluate the expression when focus comes back to the row from its dropdown', function() {
        this.table.find('td:last').append(this.dropdown);

        clickOn(this.first);
        this.outside.focus();
        this.$timeout.flush();

        this.dropdown.removeClass('select2-container--open');
        this.second.focus();
        this.$timeout.flush(0);

        expect(this.$scope.onLeave).not.toHaveBeenCalled();
    });

    it('should cancel a pending check once the row is destroyed', function() {
        clickOn(this.first);
        this.outside.focus();
        this.$scope.$destroy();

        expect(this.$timeout.verifyNoPendingTasks).not.toThrow();
    });

    it('should stop waiting once the row is destroyed', function() {
        this.table.find('td:last').append(this.dropdown);

        clickOn(this.first);
        this.outside.focus();
        this.$timeout.flush();
        this.$scope.$destroy();
        this.outside.trigger('mousedown');

        expect(this.$timeout.verifyNoPendingTasks).not.toThrow();
    });

    function clickOn(input) {
        input.trigger('mousedown');
        input.focus();
    }

    function pressKey(input, properties) {
        input.trigger(angular.element.Event('keydown', properties));
    }

    function showPickerFor(input, picker) {
        angular.element('body').append(picker);
        input.data('datepicker', {
            picker: picker
        });
    }

});
