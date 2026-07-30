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

describe('TransactionHistoryReverseController', function() {

    let vm, $controller, $q, $rootScope, $state, stockEvent, lineItems, reasons, REASON_TYPES,
        QUANTITY_UNIT, quantityUnitCalculateService, transactionHistoryReverseFactory,
        reverseSummaryModalService, signatureModalService, alertService, loadingModalService,
        notificationService, resource;

    beforeEach(function() {
        module('stock-transaction-history');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            $state = $injector.get('$state');
            REASON_TYPES = $injector.get('REASON_TYPES');
            transactionHistoryReverseFactory = $injector.get('transactionHistoryReverseFactory');
            reverseSummaryModalService = $injector.get('reverseSummaryModalService');
            signatureModalService = $injector.get('signatureModalService');
            alertService = $injector.get('alertService');
            loadingModalService = $injector.get('loadingModalService');
            notificationService = $injector.get('notificationService');
        });

        reasons = [{
            id: 'credit-reason',
            name: 'Cancelled issue',
            reasonCategory: 'ADJUSTMENT',
            reasonType: 'CREDIT',
            isFreeTextAllowed: true,
            tags: ['cancel']
        }, {
            id: 'debit-reason',
            name: 'Cancelled receipt',
            reasonCategory: 'ADJUSTMENT',
            reasonType: 'DEBIT',
            isFreeTextAllowed: false,
            tags: ['cancel']
        }, {
            id: 'transfer-reason',
            name: 'Transfer In',
            reasonCategory: 'TRANSFER',
            reasonType: 'CREDIT',
            tags: ['cancel']
        }, {
            id: 'untagged-adjustment',
            name: 'Damage',
            reasonCategory: 'ADJUSTMENT',
            reasonType: 'CREDIT',
            tags: []
        }];

        lineItems = [issueRow('line-1'), receiveRow('line-2')];

        stockEvent = {
            id: 'event-1',
            type: 'ISSUE',
            documentNumber: 'DOC-1',
            username: 'user'
        };

        QUANTITY_UNIT = {
            PACKS: 'PACKS',
            DOSES: 'DOSES'
        };
        quantityUnitCalculateService = {
            recalculateSOHQuantity: jasmine.createSpy('recalculateSOHQuantity')
                .andCallFake(function(quantity) {
                    return quantity;
                })
        };

        spyOn($state, 'go').andReturn();
        spyOn(transactionHistoryReverseFactory, 'clear').andReturn();
        spyOn(alertService, 'error').andReturn();
        spyOn(loadingModalService, 'open').andReturn();
        spyOn(loadingModalService, 'close').andReturn();
        spyOn(notificationService, 'success').andReturn();
        spyOn(signatureModalService, 'show').andReturn($q.resolve({
            signature: 'the-signature'
        }));
        spyOn(reverseSummaryModalService, 'show').andReturn($q.resolve());
        spyOn(reverseSummaryModalService, 'confirm').andReturn($q.resolve());

        resource = {
            cancel: jasmine.createSpy('cancel').andReturn($q.resolve('cancellation-event')),
            getLineItems: jasmine.createSpy('getLineItems').andReturn($q.resolve({
                content: []
            }))
        };

        vm = $controller('TransactionHistoryReverseController', {
            $stateParams: {
                stockEventId: 'event-1'
            },
            stockEvent: stockEvent,
            reverseLineItems: lineItems,
            reasons: reasons,
            STOCK_ADJUSTMENT_FREE_TEXT_MAX_LENGTH: 255,
            QUANTITY_UNIT: QUANTITY_UNIT,
            quantityUnitCalculateService: quantityUnitCalculateService,
            TransactionHistoryResource: function() {
                return resource;
            }
        });
        vm.$onInit();
    });

    function issueRow(id) {
        return {
            stockEventLineItemId: id,
            orderable: {
                productCode: 'C100',
                fullProductName: 'Levora'
            },
            destination: {
                name: 'Balaka'
            },
            quantity: 10,
            stockOnHand: 40,
            $currentStockOnHand: 40,
            documentNumber: 'DOC-1',
            $isIssue: true,
            $isReceive: false,
            $reversalReasonType: 'CREDIT',
            $reversible: true,
            $selected: false,
            $errors: {}
        };
    }

    function receiveRow(id) {
        return {
            stockEventLineItemId: id,
            orderable: {
                productCode: 'C200',
                fullProductName: 'Depo'
            },
            source: {
                name: 'Central WH'
            },
            quantity: 25,
            stockOnHand: 20,
            $currentStockOnHand: 20,
            documentNumber: 'DOC-1',
            $isIssue: false,
            $isReceive: true,
            $reversalReasonType: 'DEBIT',
            $reversible: true,
            $selected: false,
            $errors: {}
        };
    }

    describe('$onInit', function() {

        it('should expose the line items, the stock event and the document number', function() {
            expect(vm.lineItems).toBe(lineItems);
            expect(vm.stockEventId).toEqual('event-1');
            expect(vm.stockEvent).toBe(stockEvent);
            expect(vm.documentNumber).toEqual('DOC-1');
            expect(vm.freeTextMaxLength).toEqual(255);
        });

        it('should keep only cancel tagged adjustment reasons, split by type', function() {
            expect(vm.reasonsByType[REASON_TYPES.CREDIT]).toEqual([reasons[0]]);
            expect(vm.reasonsByType[REASON_TYPES.DEBIT]).toEqual([reasons[1]]);
        });
    });

    describe('recalculateQuantity', function() {

        it('should delegate to the calculate service with the orderable net content', function() {
            lineItems[0].orderable.netContent = 84;
            vm.quantityUnit = QUANTITY_UNIT.PACKS;

            vm.recalculateQuantity(140, lineItems[0]);

            expect(quantityUnitCalculateService.recalculateSOHQuantity)
                .toHaveBeenCalledWith(140, 84, false);
        });

        it('should report doses when the doses unit is selected', function() {
            vm.quantityUnit = QUANTITY_UNIT.DOSES;

            expect(vm.showInDoses()).toBe(true);
        });
    });

    describe('reasonsFor', function() {

        it('should offer only credit reasons for a cancelled issue', function() {
            expect(vm.reasonsFor(lineItems[0])).toEqual([reasons[0]]);
        });

        it('should offer only debit reasons for a cancelled receive', function() {
            expect(vm.reasonsFor(lineItems[1])).toEqual([reasons[1]]);
        });
    });

    describe('getNewStockOnHand', function() {

        it('should credit the quantity back when cancelling an issue', function() {
            expect(vm.getNewStockOnHand(lineItems[0])).toEqual(50);
        });

        it('should debit the quantity away when cancelling a receive', function() {
            expect(vm.getNewStockOnHand(lineItems[1])).toEqual(-5);
        });

        it('should return undefined when the stock on hand is unknown', function() {
            lineItems[0].$currentStockOnHand = null;

            expect(vm.getNewStockOnHand(lineItems[0])).toBeUndefined();
        });

        it('should base the preview on the current balance, not the historical one', function() {
            lineItems[0].stockOnHand = 350;
            lineItems[0].$currentStockOnHand = 300;

            expect(vm.getNewStockOnHand(lineItems[0])).toEqual(310);
        });
    });

    describe('selectionChanged', function() {

        it('should clear the reason, free text and errors of an unticked line', function() {
            lineItems[0].$selected = false;
            lineItems[0].$reason = reasons[0];
            lineItems[0].$reasonFreeText = 'a comment';
            lineItems[0].$errors = {
                reasonInvalid: true
            };
            lineItems[0].$lineError = {
                message: 'blocked'
            };

            vm.selectionChanged(lineItems[0]);

            expect(lineItems[0].$reason).toBeUndefined();
            expect(lineItems[0].$reasonFreeText).toBeUndefined();
            expect(lineItems[0].$errors).toEqual({});
            expect(lineItems[0].$lineError).toBeUndefined();
        });

        it('should leave a ticked line alone', function() {
            lineItems[0].$selected = true;
            lineItems[0].$reason = reasons[0];

            vm.selectionChanged(lineItems[0]);

            expect(lineItems[0].$reason).toEqual(reasons[0]);
        });
    });

    describe('reasonChanged', function() {

        it('should drop free text the new reason does not allow', function() {
            lineItems[1].$reason = reasons[1];
            lineItems[1].$reasonFreeText = 'a comment';

            vm.reasonChanged(lineItems[1]);

            expect(lineItems[1].$reasonFreeText).toBeUndefined();
        });

        it('should keep free text the new reason allows and clear the error', function() {
            lineItems[0].$reason = reasons[0];
            lineItems[0].$reasonFreeText = 'a comment';
            lineItems[0].$errors.reasonInvalid = true;

            vm.reasonChanged(lineItems[0]);

            expect(lineItems[0].$reasonFreeText).toEqual('a comment');
            expect(lineItems[0].$errors.reasonInvalid).toBe(false);
        });

        it('should clear the server side line error so a stale marker does not linger', function() {
            lineItems[0].$reason = reasons[0];
            lineItems[0].$lineError = {
                messageKey: 'stockmanagement.error.event.cancellation.reason.invalid',
                message: 'Reason is not valid for this movement.'
            };

            vm.reasonChanged(lineItems[0]);

            expect(lineItems[0].$lineError).toBeUndefined();
        });
    });

    describe('submit', function() {

        it('should warn and not send anything when nothing is selected', function() {
            vm.submit();
            $rootScope.$apply();

            expect(alertService.error)
                .toHaveBeenCalledWith('stockTransactionHistoryReverse.noLinesSelected');

            expect(signatureModalService.show).not.toHaveBeenCalled();
            expect(resource.cancel).not.toHaveBeenCalled();
        });

        it('should mark lines without a reason as invalid and not send anything', function() {
            lineItems[0].$selected = true;

            vm.submit();
            $rootScope.$apply();

            expect(lineItems[0].$errors.reasonInvalid).toBe(true);
            expect(alertService.error)
                .toHaveBeenCalledWith('stockTransactionHistoryReverse.reasonRequired');

            expect(resource.cancel).not.toHaveBeenCalled();
        });

        it('should mark lines that would drop the stock on hand below zero', function() {
            lineItems[1].$selected = true;
            lineItems[1].$reason = reasons[1];

            vm.submit();
            $rootScope.$apply();

            expect(lineItems[1].$errors.stockOnHandInvalid).toBe(true);
            expect(alertService.error)
                .toHaveBeenCalledWith('stockTransactionHistoryReverse.negativeStockOnHand');

            expect(resource.cancel).not.toHaveBeenCalled();
        });

        it('should show the impact for confirmation before collecting the signature', function() {
            lineItems[0].$selected = true;
            lineItems[0].$reason = reasons[0];

            vm.submit();
            $rootScope.$apply();

            expect(reverseSummaryModalService.confirm)
                .toHaveBeenCalledWith([lineItems[0]], false);

            expect(lineItems[0].$newStockOnHand).toEqual(50);
            expect(signatureModalService.show).toHaveBeenCalled();
        });

        it('should send nothing when the user backs out of the confirmation', function() {
            lineItems[0].$selected = true;
            lineItems[0].$reason = reasons[0];
            reverseSummaryModalService.confirm.andReturn($q.reject());

            vm.submit();
            $rootScope.$apply();

            expect(signatureModalService.show).not.toHaveBeenCalled();
            expect(resource.cancel).not.toHaveBeenCalled();
            expect(lineItems[0].$selected).toBe(true);
        });

        it('should abort quietly without opening the loading modal when the signature is cancelled',
            function() {
                lineItems[0].$selected = true;
                lineItems[0].$reason = reasons[0];
                signatureModalService.show.andReturn($q.reject());

                vm.submit();
                $rootScope.$apply();

                expect(signatureModalService.show).toHaveBeenCalled();

                expect(loadingModalService.open).not.toHaveBeenCalled();
                expect(resource.cancel).not.toHaveBeenCalled();
                expect(alertService.error).not.toHaveBeenCalled();

                expect($state.go).not.toHaveBeenCalled();
            });

        it('should clear stale server side line errors before re-validating', function() {
            lineItems[0].$lineError = {
                messageKey: 'stockmanagement.error.event.lineItem.blocked.physicalInventory',
                message: 'Blocked by a physical inventory.'
            };

            vm.submit();
            $rootScope.$apply();

            expect(lineItems[0].$lineError).toBeUndefined();
        });

        it('should not ask for confirmation when the ui validation fails', function() {
            lineItems[0].$selected = true;

            vm.submit();
            $rootScope.$apply();

            expect(reverseSummaryModalService.confirm).not.toHaveBeenCalled();
        });

        it('should send the signature and the selected lines with their reasons', function() {
            lineItems[0].$selected = true;
            lineItems[0].$reason = reasons[0];
            lineItems[0].$reasonFreeText = 'wrong facility';

            vm.submit();
            $rootScope.$apply();

            expect(resource.cancel).toHaveBeenCalledWith('event-1', {
                signature: 'the-signature',
                lineItems: [{
                    stockEventLineItemId: 'line-1',
                    reasonId: 'credit-reason',
                    reasonFreeText: 'wrong facility'
                }]
            });
        });

        it('should show the summary, notify and go back to the detail view on success', function() {
            lineItems[0].$selected = true;
            lineItems[0].$reason = reasons[0];
            resource.getLineItems.andReturn($q.resolve({
                content: [{
                    quantity: 10
                }]
            }));

            vm.submit();
            $rootScope.$apply();

            expect(resource.getLineItems).toHaveBeenCalledWith('cancellation-event', {
                page: 0,
                size: 2
            });

            expect(reverseSummaryModalService.show).toHaveBeenCalledWith([{
                quantity: 10
            }], false);

            expect(transactionHistoryReverseFactory.clear).toHaveBeenCalled();
            expect(notificationService.success)
                .toHaveBeenCalledWith('stockTransactionHistoryReverse.cancelled');

            expect($state.go).toHaveBeenCalledWith(
                'openlmis.stockmanagement.transactionHistory.detail', {
                    stockEventId: 'event-1'
                }, {
                    reload: true
                }
            );
        });

        it('should still show the summary modal when its line items cannot be loaded', function() {
            lineItems[0].$selected = true;
            lineItems[0].$reason = reasons[0];
            resource.getLineItems.andReturn($q.reject());

            vm.submit();
            $rootScope.$apply();

            expect(reverseSummaryModalService.show).toHaveBeenCalledWith([], false);
            expect($state.go).toHaveBeenCalled();
        });

        it('should flag the lines the server refused and report the general message', function() {
            lineItems[0].$selected = true;
            lineItems[0].$reason = reasons[0];
            lineItems[1].$selected = true;
            lineItems[1].$reason = reasons[1];
            lineItems[1].$currentStockOnHand = 30;

            const lineError = {
                stockEventLineItemId: 'line-2',
                messageKey: 'stockmanagement.error.event.lineItem.blocked.physicalInventory',
                message: 'A physical inventory was recorded after the movement.'
            };
            resource.cancel.andReturn($q.reject({
                data: {
                    message: 'One or more line items cannot be cancelled.',
                    lineErrors: [lineError]
                }
            }));

            vm.submit();
            $rootScope.$apply();

            expect(lineItems[0].$lineError).toBeUndefined();
            expect(lineItems[1].$lineError).toEqual(lineError);
            expect(alertService.error)
                .toHaveBeenCalledWith('stockTransactionHistoryReverse.lineErrors');

            expect(loadingModalService.close).toHaveBeenCalled();
            expect($state.go).not.toHaveBeenCalled();
        });

        it('should report the server message when the failure is not per line', function() {
            lineItems[0].$selected = true;
            lineItems[0].$reason = reasons[0];
            resource.cancel.andReturn($q.reject({
                data: {
                    message: 'The stock data has changed since it was loaded.'
                }
            }));

            vm.submit();
            $rootScope.$apply();

            expect(alertService.error)
                .toHaveBeenCalledWith('The stock data has changed since it was loaded.');

            expect(lineItems[0].$lineError).toBeUndefined();
        });

        it('should not report a failure when something after a successful cancel goes wrong',
            function() {
                lineItems[0].$selected = true;
                lineItems[0].$reason = reasons[0];
                reverseSummaryModalService.show.andReturn($q.reject());

                vm.submit();
                $rootScope.$apply();

                expect(alertService.error).not.toHaveBeenCalled();
                expect(notificationService.success)
                    .toHaveBeenCalledWith('stockTransactionHistoryReverse.cancelled');

                expect($state.go).toHaveBeenCalled();
            });

        it('should fall back to a generic message when the server sends none', function() {
            lineItems[0].$selected = true;
            lineItems[0].$reason = reasons[0];
            resource.cancel.andReturn($q.reject({}));

            vm.submit();
            $rootScope.$apply();

            expect(alertService.error)
                .toHaveBeenCalledWith('stockTransactionHistoryReverse.cancelFailed');
        });
    });

    describe('goToDetail', function() {

        it('should discard the cached selection and return to the detail view', function() {
            vm.goToDetail();

            expect(transactionHistoryReverseFactory.clear).toHaveBeenCalled();
            expect($state.go).toHaveBeenCalledWith(
                'openlmis.stockmanagement.transactionHistory.detail', {
                    stockEventId: 'event-1'
                }
            );
        });
    });
});
