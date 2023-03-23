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
        'chooseDateModalService', 'program', 'facility', 'draft',
        'displayLineItemsGroup', 'confirmService', 'physicalInventoryService', 'MAX_INTEGER_VALUE',
        'VVM_STATUS', 'reasons', 'stockReasonsCalculations', 'loadingModalService', '$window',
        'stockmanagementUrlFactory', 'accessTokenFactory', 'orderableGroupService', '$filter', '$q',
        'offlineService', 'physicalInventoryDraftCacheService', 'stockCardService', 'LotResource',
        'editLotModalService'];

    function controller($scope, $state, $stateParams, addProductsModalService, messageService,
                        physicalInventoryFactory, notificationService, alertService,
                        chooseDateModalService, program, facility, draft, displayLineItemsGroup,
                        confirmService, physicalInventoryService, MAX_INTEGER_VALUE, VVM_STATUS,
                        reasons, stockReasonsCalculations, loadingModalService, $window,
                        stockmanagementUrlFactory, accessTokenFactory, orderableGroupService, $filter, $q,
                        offlineService, physicalInventoryDraftCacheService, stockCardService,
                        LotResource, editLotModalService) {

        var vm = this;
        vm.$onInit = onInit;
        vm.cacheDraft = cacheDraft;
        vm.quantityChanged = quantityChanged;
        vm.checkUnaccountedStockAdjustments = checkUnaccountedStockAdjustments;

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
                    return !isEmpty(lineItem.quantity);
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
         * @name includeInactive
         * @type {Boolean}
         *
         * @description
         * When true shows inactive items
         */
        vm.includeInactive = $stateParams.includeInactive;

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
         * @name isSubmitted
         * @type {boolean}
         *
         * @description
         * If submitted once, set this to true and allow to do validation.
         */

        vm.isSubmitted = $stateParams.isSubmitted;

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
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name showVVMStatusColumn
         * @type {boolean}
         *
         * @description
         * Indicates if Hide buttons column should be visible.
         */
        vm.showHideButtonColumn = false;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name offline
         * @type {boolean}
         *
         * @description
         * Holds information about internet connection
         */
        vm.offline = offlineService.isOffline;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name draft
         * @type {Object}
         *
         * @description
         * Holds physical inventory draft.
         */
        vm.draft = draft;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name dataChanged
         * @type {boolean}
         *
         * @description
         * A flag that changes its value when the data in the form is changed. Used by saving-indicator
         */
        vm.dataChanged = false;

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
            var notYetAddedItems = _.chain(draft.lineItems)
                .difference(_.flatten(vm.displayLineItemsGroup))
                .value();

            var orderablesWithoutAvailableLots = draft.lineItems.map(function(item) {
                return item.orderable;
            }).filter(function(orderable) {
                return !notYetAddedItems.find(function(item) {
                    return orderable.id === item.orderable.id;
                });
            })
                .filter(function(orderable, index, filtered) {
                    return filtered.indexOf(orderable) === index;
                })
                .map(function(uniqueOrderable) {
                    return {
                        lot: null,
                        orderable: uniqueOrderable,
                        quantity: null,
                        stockAdjustments: [],
                        stockOnHand: null,
                        vvmStatus: null,
                        $allLotsAdded: true
                    };
                });

            orderablesWithoutAvailableLots.forEach(function(item) {
                notYetAddedItems.push(item);
            });

            addProductsModalService.show(notYetAddedItems, draft.lineItems).then(function() {
                $stateParams.program = vm.program;
                $stateParams.facility = vm.facility;
                $stateParams.noReload = true;

                draft.$modified = true;
                vm.cacheDraft();

                //Only reload current state and avoid reloading parent state
                $state.go($state.current.name, $stateParams, {
                    reload: $state.current.name
                });
            });
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name editLot
         *
         * @description
         * Pops up a modal for users to edit lot for selected line item.
         *
         * @param {Object} lineItem line items to be edited.
         */
        vm.editLot = function(lineItem) {
            var addedLineItems = _.flatten(draft.lineItems);
            editLotModalService.show(lineItem, addedLineItems).then(function() {
                $stateParams.draft = draft;
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
         * @name getStatusDisplay
         *
         * @description
         * Pops up a modal for users to hide product for physical inventory.
         *
         * @param  {Object} lineItem line items to be hidded.
         */
        vm.hideLineItem = function(lineItem) {
            var itemToHide = lineItem;
            confirmService.confirm(
                messageService.get('stockPhysicalInventoryDraft.deactivateItem', {
                    product: lineItem.orderable.fullProductName,
                    lot: lineItem.displayLotMessage
                }),
                'stockPhysicalInventoryDraft.deactivate'
            ).then(function() {
                loadingModalService.open();
                stockCardService.deactivateStockCard(lineItem.stockCardId).then(function() {
                    draft.lineItems.find(function(item) {
                        if (item.stockCardId === itemToHide.stockCardId) {
                            return item;
                        }
                    }).active = false;
                    vm.draft = draft;
                    vm.saveDraft(true);
                    $state.go($state.current.name, $stateParams, {
                        reload: $state.current.name
                    });
                    notificationService.success('stockPhysicalInventoryDraft.deactivated');
                })
                    .catch(function() {
                        loadingModalService.close();
                    });
            });
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name search
         *
         * @description
         * It searches from the total line items with given keyword and/or includeInactive.
         * If keyword and includeInactive are empty then all line items will be shown.
         */
        vm.search = function() {
            $stateParams.page = 0;
            $stateParams.keyword = vm.keyword;
            $stateParams.includeInactive = vm.includeInactive;
            $stateParams.program = vm.program;
            $stateParams.facility = vm.facility;
            $stateParams.noReload = true;

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
        vm.saveDraft = function(withNotification) {
            loadingModalService.open();
            return physicalInventoryFactory.saveDraft(draft).then(function() {
                if (!withNotification) {
                    notificationService.success('stockPhysicalInventoryDraft.saved');
                }

                draft.$modified = undefined;
                vm.cacheDraft();

                $stateParams.program = vm.program;
                $stateParams.facility = vm.facility;
                draft.lineItems.forEach(function(lineItem) {
                    if (lineItem.$isNewItem) {
                        lineItem.$isNewItem = false;
                    }
                });
                $stateParams.noReload = true;

                $state.go($state.current.name, $stateParams, {
                    reload: $state.current.name
                });
            }, function(errorResponse) {
                loadingModalService.close();
                alertService.error(errorResponse.data.message);
            });
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name canEditLot
         *
         * @description
         * Checks if user can edit lot if it was created during inventory
         *
         * @param {Object} lineItem line item to edit
         */
        vm.canEditLot = function(lineItem) {
            return lineItem.lot && lineItem.$isNewItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name saveOnPageChange
         *
         * @description
         * Save physical inventory draft on page change.
         */
        vm.saveOnPageChange = function() {
            var params = {};
            params.noReload = true;
            params.isSubmitted = vm.isSubmitted;

            return $q.resolve(params);
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name validateOnPageChange
         *
         * @description
         * Validate physical inventory draft if form was submitted once.
         */
        vm.validateOnPageChange = function() {
            if ($stateParams.isSubmitted === true) {
                validate();
                $scope.$broadcast('openlmis-form-submit');
            }
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
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name submit
         *
         * @description
         * Submit physical inventory.
         */
        vm.submit = function() {
            vm.isSubmitted = true;

            var error = validate();
            if (error) {
                $scope.$broadcast('openlmis-form-submit');
                alertService.error(error);
            } else {
                chooseDateModalService.show().then(function(resolvedData) {
                    loadingModalService.open();

                    draft.occurredDate = resolvedData.occurredDate;
                    draft.signature = resolvedData.signature;

                    return saveLots(draft, function() {
                        physicalInventoryService.submitPhysicalInventory(draft).then(function() {
                            notificationService.success('stockPhysicalInventoryDraft.submitted');
                            confirmService.confirm('stockPhysicalInventoryDraft.printModal.label',
                                'stockPhysicalInventoryDraft.printModal.yes',
                                'stockPhysicalInventoryDraft.printModal.no')
                                .then(function() {
                                    $window.open(accessTokenFactory.addAccessToken(getPrintUrl(draft.id)),
                                        '_blank');
                                })
                                .finally(function() {
                                    $state.go('openlmis.stockmanagement.stockCardSummaries', {
                                        program: program.id,
                                        facility: facility.id,
                                        includeInactive: false
                                    });
                                });
                        }, function(errorResponse) {
                            loadingModalService.close();
                            alertService.error(errorResponse.data.message);
                            physicalInventoryDraftCacheService.removeById(draft.id);
                        });
                    });
                });
            }
        };

        function saveLots(draft, submitMethod) {
            var lotPromises = [],
                lotResource = new LotResource(),
                errorLots = [];

            draft.lineItems.forEach(function(lineItem) {
                if (lineItem.lot && lineItem.$isNewItem && !lineItem.lot.id) {
                    lotPromises.push(lotResource.create(lineItem.lot)
                        .then(function(createResponse) {
                            lineItem.$isNewItem = false;
                            return createResponse;
                        })
                        .catch(function(response) {
                            if (response.data.messageKey ===
                                'referenceData.error.lot.lotCode.mustBeUnique' ||
                                response.data.messageKey ===
                                'referenceData.error.lot.tradeItem.required') {
                                errorLots.push({
                                    lotCode: lineItem.lot.lotCode,
                                    error: response.data.messageKey ===
                                    'referenceData.error.lot.lotCode.mustBeUnique' ?
                                        'stockPhysicalInventoryDraft.lotCodeMustBeUnique' :
                                        'stockPhysicalInventoryDraft.tradeItemRequuiredToAddLotCode'
                                });
                            }
                        }));
                }
            });

            return $q.all(lotPromises)
                .then(function(responses) {
                    if (errorLots !== undefined && errorLots.length > 0) {
                        return $q.reject();
                    }
                    responses.forEach(function(lot) {
                        draft.lineItems.forEach(function(lineItem) {
                            if (lineItem.lot && lineItem.lot.lotCode === lot.lotCode
                                && lineItem.orderable.identifiers['tradeItem'] === lot.tradeItemId) {
                                lineItem.lot = lot;
                            }
                        });
                        return draft.lineItems;
                    });
                    return submitMethod();
                })
                .catch(function(errorResponse) {
                    loadingModalService.close();
                    if (errorLots) {
                        var errorLotsReduced = errorLots.reduce(function(result, currentValue) {
                            if (currentValue.error in result) {
                                result[currentValue.error].push(currentValue.lotCode);
                            } else {
                                result[currentValue.error] = [currentValue.lotCode];
                            }
                            return result;
                        }, {});
                        for (var error in errorLotsReduced) {
                            alertService.error(error, errorLotsReduced[error].join(', '));
                        }
                        return $q.reject(errorResponse.data.message);
                    }
                    alertService.error(errorResponse.data.message);
                });
        }

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

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateUnaccountedQuantity
         *
         * @description
         * Validate line item quantity and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateUnaccountedQuantity = function(lineItem) {
            if (lineItem.unaccountedQuantity === 0) {
                lineItem.unaccountedQuantityInvalid = false;
            } else {
                lineItem.unaccountedQuantityInvalid = messageService
                    .get('stockPhysicalInventoryDraft.unaccountedQuantityError');
            }
            return lineItem.unaccountedQuantityInvalid;
        };

        function isEmpty(value) {
            return value === '' || value === undefined || value === null;
        }

        function validate() {
            var qtyError = false;
            var activeError = false;

            _.chain(displayLineItemsGroup).flatten()
                .each(function(item) {
                    if (!item.active) {
                        activeError = 'stockPhysicalInventoryDraft.submitInvalidActive';
                    } else if (vm.validateQuantity(item) || vm.validateUnaccountedQuantity(item)) {
                        qtyError = 'stockPhysicalInventoryDraft.submitInvalid';
                    }
                });
            return activeError || qtyError;
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

            vm.hasLot = _.any(draft.lineItems, function(item) {
                return item.lot;
            });

            draft.lineItems.forEach(function(item) {
                item.unaccountedQuantity =
                    stockReasonsCalculations.calculateUnaccounted(item, item.stockAdjustments);
            });

            vm.updateProgress();
            var orderableGroups = orderableGroupService.groupByOrderableId(draft.lineItems);
            vm.showVVMStatusColumn = orderableGroupService.areOrderablesUseVvm(orderableGroups);
            shouldDisplayHideButtonColumn(draft.lineItems);
            $scope.$watchCollection(function() {
                return vm.pagedLineItems;
            }, function(newList) {
                vm.groupedCategories = $filter('groupByProgramProductCategory')(newList, vm.program.id);
            }, true);

            if (!$stateParams.noReload) {
                vm.cacheDraft();
            }
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
            draft.$modified = true;
            vm.cacheDraft();
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
            vm.checkUnaccountedStockAdjustments(lineItem);
            vm.dataChanged = !vm.dataChanged;
        }

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
        function getPrintUrl(id) {
            return stockmanagementUrlFactory('/api/physicalInventories/' + id + '?format=pdf');
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name cacheDraft
         *
         * @description
         * Cache draft of physical inventory.
         */
        function cacheDraft() {
            physicalInventoryDraftCacheService.cacheDraft(draft);
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name shouldDisplayHideButtonColumn
         *
         * @description
         * Check if column with hide buttons should be displayed.
         */
        function shouldDisplayHideButtonColumn(lineItems) {
            lineItems.forEach(function(item) {
                if (item.active && item.stockOnHand === 0 && !item.$isNewItem) {
                    vm.showHideButtonColumn = true;
                }
            });
        }

        vm.validateOnPageChange();

    }
})();
