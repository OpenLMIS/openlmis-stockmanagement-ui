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
     * @name stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     *
     * @description
     * Controller for managing physical inventory draft.
     */
    angular
        .module('stock-physical-inventory-draft')
        .controller('PhysicalInventoryDraftController', controller);

    controller.$inject = ['$scope', '$state', '$stateParams', 'addProductsModalService',
        'messageService', 'physicalInventoryFactory', 'notificationService', 'alertService',
        'confirmDiscardService', 'chooseDateModalService', 'program', 'facility', 'draft',
        'displayLineItemsGroup', 'confirmService', 'physicalInventoryService', 'MAX_INTEGER_VALUE',
        'VVM_STATUS', 'reasons', 'stockReasonsCalculations', 'loadingModalService', '$window',
        'stockmanagementUrlFactory', 'accessTokenFactory', 'orderableGroupService', '$filter',
        '$timeout', 'autoGenerateService', 'REASON_TYPES', 'REASON_CATEGORIES', 'MAX_STRING_VALUE'];

    function controller($scope, $state, $stateParams, addProductsModalService, messageService,
                        physicalInventoryFactory, notificationService, alertService, confirmDiscardService,
                        chooseDateModalService, program, facility, draft, displayLineItemsGroup,
                        confirmService, physicalInventoryService, MAX_INTEGER_VALUE, VVM_STATUS,
                        reasons, stockReasonsCalculations, loadingModalService, $window,
                        stockmanagementUrlFactory, accessTokenFactory, orderableGroupService, $filter,
                        $timeout, autoGenerateService, REASON_TYPES, REASON_CATEGORIES, MAX_STRING_VALUE) {
        var vm = this;

        vm.$onInit = onInit;

        vm.quantityChanged = quantityChanged;
        vm.letCodeChanged = letCodeChanged;
        vm.expirationDateChanged = expirationDateChanged;
        vm.reasonTextChanged = reasonTextChanged;
        vm.checkUnaccountedStockAdjustments = checkUnaccountedStockAdjustments;
        vm.addStockAdjustments = addStockAdjustments;
        vm.addLot = addLot;
        vm.removeLot = removeLot;
        vm.isEmpty = isEmpty;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name displayLineItemsGroup
         * @type {Array}
         *
         * @description
         * Holds current display physical inventory draft line items grouped by orderable id.
         */
        vm.displayLineItemsGroup = displayLineItemsGroup;

        vm.updateProgress = function() {
            vm.itemsWithQuantity = _.filter(vm.displayLineItemsGroup, function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    if (lineItem.orderable && lineItem.orderable.isKit || !isEmpty(lineItem.stockOnHand)) {
                        return !isEmpty(lineItem.quantity) && !vm.validateReasonFreeText(lineItem);
                    }
                    return hasLot(lineItem) && !isEmpty(lineItem.lot.expirationDate) &&
                        !isEmpty(lineItem.quantity) && !vm.validateReasonFreeText(lineItem);
                });
            });
        };

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name program
         * @type {Object}
         *
         * @description
         * Holds current program info.
         */
        vm.program = program;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name facility
         * @type {Object}
         *
         * @description
         * Holds home facility info.
         */
        vm.facility = facility;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name keyword
         * @type {String}
         *
         * @description
         * Holds keywords for searching.
         */
        vm.keyword = $stateParams.keyword;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name vvmStatuses
         * @type {Object}
         *
         * @description
         * Holds list of VVM statuses.
         */
        vm.vvmStatuses = VVM_STATUS;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name groupedCategories
         * @type {Object}
         *
         * @description
         * Holds line items grouped by category.
         */
        vm.groupedCategories = false;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name showVVMStatusColumn
         * @type {boolean}
         *
         * @description
         * Indicates if VVM Status column should be visible.
         */
        vm.showVVMStatusColumn = false;

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name getStatusDisplay
         *
         * @description
         * Returns VVM status display.
         *
         * @param  {String} status VVM status
         * @return {String}        VVM status display name
         */
        vm.getStatusDisplay = function(status) {
            return messageService.get(VVM_STATUS.$getDisplayName(status));
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name addProducts
         *
         * @description
         * Pops up a modal for users to add products for physical inventory.
         */
        vm.addProducts = function() {
            // var notYetAddedItems = _.chain(draft.lineItems)
            //     .difference(_.flatten(vm.displayLineItemsGroup))
            //     .value();
            var flattenDisplayItems = _.flatten(vm.displayLineItemsGroup);
            var notYetAddedItems = _.difference(draft.lineItems, flattenDisplayItems);
            notYetAddedItems = _.filter(notYetAddedItems, function(item) {
                return !_.find(flattenDisplayItems, function(displayItem) {
                    return _.isEqual(displayItem.orderable, item.orderable) &&
                        _.isEqual(displayItem.lot, angular.copy(item.lot));
                });
            });

            addProductsModalService.show(notYetAddedItems, vm.hasLot).then(function() {
                $stateParams.program = vm.program;
                $stateParams.facility = vm.facility;
                $stateParams.draft = draft;

                $stateParams.isAddProduct = true;

                //Only reload current state and avoid reloading parent state
                $state.go($state.current.name, $stateParams, {
                    reload: $state.current.name
                });
            });
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name calculate
         *
         * @description
         * Aggregate values of provided field for a group of line items.
         *
         * @param {Object} lineItems line items to be calculate.
         * @param {String} field     property name of line items to be aggregate.
         */
        vm.calculate = function(lineItems, field) {
            var allEmpty = _.every(lineItems, function(lineItem) {
                return isEmpty(lineItem[field]);
            });
            if (allEmpty) {
                return undefined;
            }

            return _.chain(lineItems).map(function(lineItem) {
                return lineItem[field];
            })
                .compact()
                .reduce(function(memo, num) {
                    return parseInt(num) + memo;
                }, 0)
                .value();
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name search
         *
         * @description
         * It searches from the total line items with given keyword. If keyword is empty then all line
         * items will be shown.
         */
        vm.search = function() {
            $stateParams.page = 0;
            $stateParams.keyword = vm.keyword;
            $stateParams.program = vm.program;
            $stateParams.facility = vm.facility;
            $stateParams.draft = draft;

            //Only reload current state and avoid reloading parent state
            $state.go($state.current.name, $stateParams, {
                reload: $state.current.name
            });
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name saveDraft
         *
         * @description
         * Save physical inventory draft.
         */
        vm.saveDraft = function() {
            loadingModalService.open();
            return physicalInventoryFactory.saveDraft(draft).then(function() {
                notificationService.success('stockPhysicalInventoryDraft.saved');
                resetWatchItems();

                $stateParams.isAddProduct = false;

                $stateParams.program = vm.program;
                $stateParams.facility = vm.facility;
                $stateParams.draft = draft;
                //Reload parent state and current state to keep data consistency.
                $state.go($state.current.name, $stateParams, {
                    reload: true
                });
            }, function() {
                loadingModalService.close();
                alertService.error('stockPhysicalInventoryDraft.saveFailed');
            });
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name delete
         *
         * @description
         * Delete physical inventory draft.
         */
        vm.delete = function() {
            confirmService.confirmDestroy(
                'stockPhysicalInventoryDraft.deleteDraft',
                'stockPhysicalInventoryDraft.delete'
            ).then(function() {
                loadingModalService.open();
                physicalInventoryService.deleteDraft(draft.id).then(function() {
                    $scope.needToConfirm = false;
                    $state.go('openlmis.stockmanagement.physicalInventory', $stateParams, {
                        reload: true
                    });
                })
                    .catch(function() {
                        loadingModalService.close();
                    });
            });
        };

        /**
         * @ngdoc methodfinishInput
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name submit
         *
         * @description
         * Submit physical inventory.
         */
        vm.submit = function() {
            if (validate()) {
                $scope.$broadcast('openlmis-form-submit');
                alertService.error('stockPhysicalInventoryDraft.submitInvalid');
            } else {
                chooseDateModalService.show().then(function(resolvedData) {
                    loadingModalService.open();

                    draft.occurredDate = resolvedData.occurredDate;
                    draft.signature = resolvedData.signature;

                    physicalInventoryService.submitPhysicalInventory(draft).then(function() {
                        notificationService.success('stockPhysicalInventoryDraft.submitted');
                        $state.go('openlmis.stockmanagement.stockCardSummaries', {
                            program: program.id,
                            facility: facility.id
                        });
                        /*confirmService.confirm('stockPhysicalInventoryDraft.printModal.label',
                            'stockPhysicalInventoryDraft.printModal.yes',
                            'stockPhysicalInventoryDraft.printModal.no')
                            .then(function() {
                                $window.open(accessTokenFactory.addAccessToken(getPrintUrl(draft.id)), '_blank');
                            })
                            .finally(function() {
                                $state.go('openlmis.stockmanagement.stockCardSummaries', {
                                    program: program.id,
                                    facility: facility.id
                                });
                            });*/
                    }, function() {
                        loadingModalService.close();
                        alertService.error('stockPhysicalInventoryDraft.submitFailed');
                    });
                });
            }
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateQuantity
         *
         * @description
         * Validate line item quantity and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateQuantity = function(lineItem) {
            if (lineItem.quantity > MAX_INTEGER_VALUE) {
                lineItem.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
            } else if (isEmpty(lineItem.quantity)) {
                lineItem.quantityInvalid = messageService.get('stockPhysicalInventoryDraft.required');
            } else {
                lineItem.quantityInvalid = false;
            }
            return lineItem.quantityInvalid;
        };

        vm.validateLotCode = function(lineItem, lots) {
            if (isEmpty(lineItem.stockOnHand) && !(lineItem.lot && lineItem.lot.id)) {
                if (!hasLot(lineItem)) {
                    lineItem.lotCodeInvalid = messageService.get('stockPhysicalInventoryDraft.required');
                } else if (lineItem.lot.lotCode.length > MAX_STRING_VALUE) {
                    lineItem.lotCodeInvalid = messageService.get('stockPhysicalInventoryDraft.lotCodeTooLong');
                } else if (hasDuplicateLotCode(lineItem, lots)) {
                    lineItem.lotCodeInvalid = messageService.get('stockPhysicalInventoryDraft.lotCodeDuplicate');
                } else {
                    lineItem.lotCodeInvalid = false;
                }
            } else {
                lineItem.lotCodeInvalid = false;
            }
            return lineItem.lotCodeInvalid;
        };

        vm.validExpirationDate = function(lineItem) {
            if (isEmpty(lineItem.stockOnHand) && !(lineItem.lot && lineItem.lot.expirationDate)) {
                lineItem.expirationDateInvalid = true;
            } else {
                lineItem.expirationDateInvalid = false;
            }
            return lineItem.expirationDateInvalid;
        };

        vm.validateReasonFreeText = function(lineItem) {
            if (vm.isFreeTextAllowed(lineItem)) {
                lineItem.reasonFreeTextInvalid = isEmpty(lineItem.reasonFreeText);
            } else {
                lineItem.reasonFreeTextInvalid = false;
            }
            return lineItem.reasonFreeTextInvalid;
        };

        vm.isFreeTextAllowed = function(lineItem) {
            return _.some(lineItem.stockAdjustments, function(stockAdjustment) {
                return stockAdjustment.reason && stockAdjustment.reason.isFreeTextAllowed;
            });
        };

        function isEmpty(value) {
            return value === '' || value === undefined || value === null;
        }

        function hasLot(item) {
            return item.lot && item.lot.lotCode;
        }

        function hasDuplicateLotCode(lineItem, lots) {
            var allLots = lots ? lots : getAllDraftLotCode();
            var duplicatedLineItems = hasLot(lineItem) ? _.filter(allLots, function(lot) {
                return lot === lineItem.lot.lotCode;
            }) : [];
            return duplicatedLineItems.length > 1;
        }

        function validate() {
            var anyError = false;
            var lots = getAllDraftLotCode();
            _.chain(displayLineItemsGroup).flatten()
                .each(function(item) {
                    if (!(item.orderable && item.orderable.isKit)) {
                        anyError = vm.validateLotCode(item, lots) || anyError;
                        anyError = vm.validExpirationDate(item) || anyError;
                    }
                    anyError = vm.validateReasonFreeText(item) | anyError;
                    anyError = vm.validateQuantity(item) || anyError;
                });
            return anyError;
        }

        function getAllDraftLotCode() {
            var lots = [];
            _.each(draft.lineItems, function(item) {
                if (item.lot && item.lot.lotCode) {
                    lots.push(item.lot.lotCode);
                }
            });
            return lots;
        }

        var watchItems = [];

        function resetWatchItems() {
            $scope.needToConfirm = false;
            watchItems = angular.copy(vm.displayLineItemsGroup);
        }

        function onInit() {
            $state.current.label = messageService.get('stockPhysicalInventoryDraft.title', {
                facilityCode: facility.code,
                facilityName: facility.name,
                program: program.name
            });

            vm.reasons = reasons;
            vm.stateParams = $stateParams;
            $stateParams.program = undefined;
            $stateParams.facility = undefined;
            $stateParams.draft = undefined;

            vm.hasLot = _.any(draft.lineItems, function(item) {
                return item.lot;
            });

            vm.updateProgress();
            resetWatchItems();
            $scope.$watch(function() {
                return vm.displayLineItemsGroup;
            }, function(newValue) {
                $scope.needToConfirm = ($stateParams.isAddProduct || !angular.equals(newValue, watchItems));
            }, true);
            confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');

            vm.lotsMapping = orderableGroupService.getOrderableLots(draft.lineItems);
            var orderableGroups = orderableGroupService.groupByOrderableId(draft.lineItems);
            vm.showVVMStatusColumn = orderableGroupService.areOrderablesUseVvm(orderableGroups);
            $scope.$watchCollection(function() {
                return vm.pagedLineItems;
            }, function(newList) {
                var categories = $filter('groupByAllProductProgramProductCategory')(newList, vm.program.id);
                vm.groupedCategories = _.isEmpty(categories) ? [] : categories;
                //vm.groupedCategories = categories;
            }, true);
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name checkUnaccountedStockAdjustments
         *
         * @description
         * Calculates unaccounted and set value to line item.
         *
         * @param   {Object}    lineItem    the lineItem containing stock adjustments
         */
        function checkUnaccountedStockAdjustments(lineItem) {
            lineItem.unaccountedQuantity =
                stockReasonsCalculations.calculateUnaccounted(lineItem, lineItem.stockAdjustments);
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name quantityChanged
         *
         * @description
         * Callback method for quantity change. It will update progress and fire up validations.
         *
         * @param   {Object}    lineItem    the lineItem containing quantity
         */
        function quantityChanged(lineItem) {
            vm.updateProgress();
            vm.validateQuantity(lineItem);
            vm.addStockAdjustments(lineItem);
            vm.checkUnaccountedStockAdjustments(lineItem);
        }

        function letCodeChanged(lineItem) {
            if (lineItem.lot && lineItem.lot.lotCode) {
                lineItem.lot.lotCode = lineItem.lot.lotCode.toUpperCase();
            }
            lineItem.isisTryAuto = false;
            vm.updateProgress();
            vm.finishInput(lineItem);
        }

        function expirationDateChanged(lineItem) {
            vm.updateAutoLot(lineItem);
            vm.updateProgress();
            vm.validExpirationDate(lineItem);
        }

        function reasonTextChanged(lineItem) {
            vm.validateReasonFreeText(lineItem);
            vm.updateProgress();
        }

        function addStockAdjustments(lineItem) {
            var unaccountedQuantity = stockReasonsCalculations.calculateUnaccounted(lineItem,
                lineItem.stockAdjustments);
            if (unaccountedQuantity === lineItem.unaccountedQuantity || isEmpty(lineItem.stockOnHand)) {
                return;
            }
            var reason;
            if (!_.isEmpty(lineItem.stockAdjustments)) {
                lineItem.shouldOpenImmediately = true;
            } else if (unaccountedQuantity > 0) {
                reason = _.find(lineItem.reasons, function(reason) {
                    return reason.reasonType === REASON_TYPES.CREDIT;
                });
            } else if (unaccountedQuantity < 0) {
                reason = _.find(lineItem.reasons, function(reason) {
                    return reason.reasonType === REASON_TYPES.DEBIT;
                });
            }
            if (reason) {
                var adjustment = {
                    reason: reason,
                    quantity: Math.abs(unaccountedQuantity)
                };
                lineItem.stockAdjustments = [adjustment];
            }
        }

        function addLot(lineItem) {
            var newLineItem = _.assign({}, angular.copy(lineItem), {
                stockCardId: null,
                displayLotMessage: undefined,
                lot: null,
                quantity: undefined,
                quantityInvalid: false,
                shouldOpenImmediately: false,
                stockAdjustments: [],
                stockOnHand: undefined,
                unaccountedQuantity: undefined,
                isNewSlot: true
            });
            draft.lineItems.push(newLineItem);
            $stateParams.program = vm.program;
            $stateParams.facility = vm.facility;
            $stateParams.draft = draft;

            $stateParams.isAddProduct = true;

            //Only reload current state and avoid reloading parent state
            $state.go($state.current.name, $stateParams, {
                reload: $state.current.name
            });
        }

        function removeLot(lineItem) {
            var index = _.findIndex(draft.lineItems, function(item) {
                return _.isEqual(item, lineItem);
            });
            if (index === -1) {
                return;
            }
            var hasDuplicateLot = _.filter(draft.lineItems, function(item) {
                if (lineItem.lot && lineItem.lot.id) {
                    return lineItem.lot.id === (item.lot && item.lot.id);
                }
                return _.isEqual(item.orderable, lineItem.orderable) && (!lineItem.lot || !lineItem.lot.id);
            }).length > 1;
            if (hasDuplicateLot) {
                draft.lineItems.splice(index, 1);
            } else {
                _.extend(draft.lineItems[index], {
                    quantity: undefined,
                    isAdded: false,
                    quantityInvalid: false,
                    shouldOpenImmediately: false,
                    unaccountedQuantity: undefined,
                    stockAdjustments: [],
                    lotCodeInvalid: false,
                    expirationDateInvalid: false
                });
            }
            $stateParams.program = vm.program;
            $stateParams.facility = vm.facility;
            $stateParams.draft = draft;

            //Only reload current state and avoid reloading parent state
            $state.go($state.current.name, $stateParams, {
                reload: $state.current.name
            });
        }

        vm.showSelect = function($event, lineItem) {
            if (!lineItem.showSelect) {
                hideAllSelect();
                lineItem.showSelect = true;
                var target = $event.target.parentNode.parentNode.querySelector('.adjustment-custom-item');
                lineItem.positionTop = {
                    top: getOffset(target)
                };
            }
        };

        function hideAllSelect() {
            draft.lineItems.forEach(function(lineItem) {
                lineItem.showSelect = false;
            });
        }

        function getOffset(element) {
            var rect = element.getBoundingClientRect();
            return - (rect.top + window.scrollY);
        }

        vm.hideSelect = function(lineItem) {
            // prevent hide before select, may optimize later
            $timeout(function() {
                lineItem.showSelect = false;
            }, 200);
        };

        vm.keydown = function(lineItem) {
            lineItem.isFromInput = true;
            lineItem.isFromSelect = false;
        };

        $scope.$on('lotCodeChange', function(event, data) {
            var lineItem = data.lineItem;
            refreshLotOptions(lineItem);
            vm.validateLotCode(lineItem);
            vm.validExpirationDate(lineItem);
        });

        vm.finishInput = function(lineItem) {
            if (lineItem.lot && lineItem.isFromInput) {
                var option = _.find(lineItem.lotOptions, function(option) {
                    return lineItem.lot.lotCode === option.lotCode;
                });
                if (isEmpty(option)) {
                    lineItem.lot = {
                        lotCode: lineItem.lot.lotCode
                    };
                } else {
                    lineItem.lot = option;
                }
            }
            refreshLotOptions(lineItem);
            vm.validateLotCode(lineItem);
            vm.validExpirationDate(lineItem);
        };

        function refreshLotOptions(lineItem) {
            var orderableId = lineItem.orderable.id;
            var dispalyLineItems = _.flatten(displayLineItemsGroup);
            var groupLotsMapping = orderableGroupService.getOrderableLots(dispalyLineItems);
            var groupLots = groupLotsMapping[orderableId];
            var lotOptions = _.filter(orderableGroupService.uniqLots(vm.lotsMapping[orderableId]), function(lot) {
                return !_.some(groupLots, function(groupLot) {
                    return groupLot.id === lot.id;
                });
            });
            _.forEach(dispalyLineItems, function(dispalyLineItem) {
                if (dispalyLineItem.orderable.id === orderableId) {
                    dispalyLineItem.lotOptions = lotOptions;
                }
            });
        }

        vm.updateAutoLot = function(lineItem) {
            if (lineItem.lot.isAuto || lineItem.isTryAuto) {
                if (lineItem.lot.expirationDate) {
                    var lotCode = autoGenerateService.autoGenerateLotCode(lineItem);
                    lineItem.lot = {
                        lotCode: lotCode,
                        expirationDate: lineItem.lot.expirationDate,
                        isAuto: true
                    };
                    lineItem.isTryAuto = false;
                } else {
                    lineItem.lot = {};
                }
            }
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name getPrintUrl
         *
         * @description
         * Prepares a print URL for the given physical inventory.
         *
         * @return {String} the prepared URL
         */
        /*function getPrintUrl(id) {
            return stockmanagementUrlFactory('/api/physicalInventories/' + id + '?format=pdf');
        }*/
    }
})();
