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

describe('PhysicalInventoryListController', function() {

    var vm, q, rootScope, state, facility, programs, messageService, physicalInventoryService,
        physicalInventoryFactory;

    beforeEach(function() {

        module('stock-physical-inventory-list');

        inject(
            function(_messageService_, $controller,
                $q, $rootScope) {

                messageService = _messageService_;
                physicalInventoryService = jasmine.createSpyObj('physicalInventoryService', ['createDraft']);
                physicalInventoryFactory = jasmine.createSpyObj('physicalInventoryFactory', ['getDraft']);

                q = $q;
                rootScope = $rootScope;
                state = jasmine.createSpyObj('$state', ['go']);

                programs = [{
                    name: 'HIV',
                    id: '1'
                }, {
                    name: 'TB',
                    id: '2'
                }];
                facility = {
                    id: '10134',
                    name: 'National Warehouse',
                    supportedPrograms: programs
                };

                vm = $controller('PhysicalInventoryListController', {
                    facility: facility,
                    programs: programs,
                    messageService: messageService,
                    physicalInventoryService: physicalInventoryService,
                    physicalInventoryFactory: physicalInventoryFactory,
                    drafts: [{
                        programId: '1'
                    }, {
                        programId: '2'
                    }],
                    $state: state
                });
            }
        );
    });

    it('should init programs and physical inventory drafts properly', function() {
        expect(vm.programs).toEqual(programs);
        expect(vm.drafts).toEqual([{
            programId: '1'
        }, {
            programId: '2'
        }]);
    });

    it('should get program name by id', function() {
        expect(vm.getProgramName('1')).toEqual('HIV');
        expect(vm.getProgramName('2')).toEqual('TB');
    });

    it('should get physical inventory draft status', function() {
        expect(vm.getDraftStatus(true)).toEqual('stockPhysicalInventory.notStarted');
        expect(vm.getDraftStatus(false)).toEqual('stockPhysicalInventory.draft');
    });

    it('should go to physical inventory page when proceed', function() {
        var draft = {
            id: 123,
            programId: '1',
            starter: false
        };
        physicalInventoryFactory.getDraft.andReturn(q.when(draft));
        vm.editDraft(draft);
        rootScope.$apply();

        expect(state.go).toHaveBeenCalledWith('openlmis.stockmanagement.physicalInventory.draft', {
            id: draft.id,
            draft: draft,
            program: {
                name: 'HIV',
                id: '1'
            },
            facility: facility
        });
    });

    it('should create draft to get id and go to physical inventory when proceed', function() {
        var draft = {
            programId: '1',
            starter: false
        };
        var id = '456';
        physicalInventoryFactory.getDraft.andReturn(q.when(draft));
        physicalInventoryService.createDraft.andReturn(q.when({
            id: id
        }));

        vm.editDraft(draft);
        rootScope.$apply();

        expect(physicalInventoryService.createDraft).toHaveBeenCalledWith(draft.programId, facility.id);
        expect(state.go).toHaveBeenCalledWith('openlmis.stockmanagement.physicalInventory.draft', {
            id: id,
            draft: draft,
            program: {
                name: 'HIV',
                id: '1'
            },
            facility: facility
        });
    });
});
