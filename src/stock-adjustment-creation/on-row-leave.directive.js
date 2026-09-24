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
     * @ngdoc directive
     * @restrict A
     * @name stock-adjustment-creation.directive:onRowLeave
     *
     * @description
     * Evaluates the given expression when the user leaves the table row, that is when focus moves to an
     * element outside of the row or to no element at all, and then shows the validation messages of the row the
     * way a submit does. Only a row the user has clicked, tapped or typed in can be left, so focus the screen
     * puts into a row by itself, like the autofocus of a newly added line item, and keys that only move focus,
     * like Tab, do not count. Focus that moves into an open select or date picker dropdown of the row, or into a
     * modal, still counts as the row: the decision then waits for the next click or focus that lands outside of
     * the row and outside of any such popup.
     *
     * @example
     * ```
     * <tr ng-repeat="lineItem in vm.items" on-row-leave="vm.validateLineItem(lineItem)">
     * ```
     */
    angular
        .module('stock-adjustment-creation')
        .directive('onRowLeave', directive);

    var POPUPS = '.select2-dropdown, .datepicker, .modal',
        NAVIGATION_KEYS = ['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'OS', 'CapsLock', 'Escape'];

    directive.$inject = ['$document', '$timeout'];

    function directive($document, $timeout) {
        return {
            restrict: 'A',
            link: link
        };

        function link(scope, element, attrs) {
            var used = false,
                pendingCheck,
                namespace = '.onRowLeave' + scope.$id,
                nextInteraction = ['mousedown', 'touchstart', 'focusin'].map(function(eventName) {
                    return eventName + namespace;
                }).join(' ');

            // a tap on a touch screen fires mousedown as well, while a swipe that only scrolls the page does not
            element.on('mousedown', markAsUsed);
            element.on('keydown', markAsUsedByKey);
            element.on('focusout', onFocusOut);
            scope.$on('$destroy', cleanUp);

            function markAsUsed() {
                used = true;
            }

            function markAsUsedByKey(event) {
                if (!event.ctrlKey && !event.metaKey && !event.altKey && NAVIGATION_KEYS.indexOf(event.key) === -1) {
                    used = true;
                }
            }

            function onFocusOut() {
                // A click on a date picker day blurs the input and closes the picker before the check runs,
                // so the dropdown state has to be taken while the focus is still moving.
                scheduleCheck(hasOpenDropdown());
            }

            function scheduleCheck(dropdownWasOpen) {
                $timeout.cancel(pendingCheck);
                pendingCheck = $timeout(function() {
                    checkFocus(dropdownWasOpen);
                }, 0, false);
            }

            function checkFocus(dropdownWasOpen) {
                var focused = $document[0].activeElement;

                if (!used || element[0].contains(focused)) {
                    return;
                }

                if (dropdownWasOpen || hasOpenDropdown() || isInside(focused, '.modal')) {
                    waitForInteractionElsewhere();
                    return;
                }

                scope.$apply(function() {
                    scope.$eval(attrs.onRowLeave);
                    // tr-openlmis-invalid shows the messages of a row only after a digest has seen the row focused,
                    // which does not happen when its only control was a select with a search box
                    scope.$broadcast('openlmis-form-submit');
                });
            }

            function waitForInteractionElsewhere() {
                $document.off(namespace).on(nextInteraction, function(event) {
                    if (!element[0].contains(event.target) && !isInside(event.target, POPUPS)) {
                        $document.off(namespace);
                        scheduleCheck(false);
                    }
                });
            }

            function hasOpenDropdown() {
                return element.find('.select2-container--open').length > 0 ||
                    _.some(element.find('input'), isDatepickerShown);
            }

            function isDatepickerShown(input) {
                var datepicker = angular.element(input).data('datepicker');
                return !!datepicker && datepicker.picker.is(':visible');
            }

            function isInside(node, selector) {
                return angular.element(node).closest(selector).length > 0;
            }

            function cleanUp() {
                $timeout.cancel(pendingCheck);
                $document.off(namespace);
                element.off('mousedown', markAsUsed);
                element.off('keydown', markAsUsedByKey);
                element.off('focusout', onFocusOut);
            }
        }
    }

})();
