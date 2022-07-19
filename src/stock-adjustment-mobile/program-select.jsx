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

import React, { useMemo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import ReadOnlyTable from './components/read-only-table.component';
import Toast from './components/toast.component';


const ProgramSelect = ({ offlineService, stockReasonsFactory,
                         existingStockOrderableGroupsFactory, adjustmentType, 
                         sourceDestinationService, setProductOptions, setReasons, 
                         setSourceDestinations, resetAdjustment, setProgram, setToastList }) => {

    const history = useHistory();
    const dispatch = useDispatch();
    const facility = useSelector(state => state[`facilities${adjustmentType}`][`userHomeFacility${adjustmentType}`]);
    const programSelected = useSelector(state => state[`program${adjustmentType}`][`program${adjustmentType}`]);
    const adjustment = useSelector(state => state[`adjustment${adjustmentType}`][`adjustment${adjustmentType}`]);
    
    const programs = facility.supportedPrograms.map(({ id, name }) => ({ value: id, name }));

    const menu = document.getElementsByClassName("header ng-scope")[0];

    useEffect(() => {
        menu.style.display = "";
    }, [menu]);

    const afterSelectProgram = (programId, programName) => {
        const programObject = { programName: programName, programId: programId };
        if (programId !== null) {
            const stateParams = {orderableGroups: null}
            const program = {id: programId}
            existingStockOrderableGroupsFactory.getGroupsWithNotZeroSoh(stateParams, program, facility).then(groups => {
                const productOptions = _.map(groups, group => ({ name: group[0].orderable.fullProductName, value: group }));
                dispatch(setProductOptions(productOptions));
                return productOptions;
            }).then(productOptions => {
                let reasonType = adjustmentType === "Adjustment" ? null : (adjustmentType === "Issue" ? "DEBIT" : "CREDIT" ); 
                if (!reasonType) {
                    stockReasonsFactory.getAdjustmentReasons(program.id, facility.type.id).then(reasons => {
                        const mappedReasons = _.map(reasons, reason => ({ name: reason.name, value: reason }));
                        dispatch(setReasons(mappedReasons));
                        return mappedReasons
                    }).then(mappedReasons => {
                        goToProductPage(programId, programObject, program);
                    });
                }
                else {
                    stockReasonsFactory.getReasons(program.id, facility.type.id, reasonType).then(reasons => {
                        const mappedReasons = _.map(reasons.filter(reason => reason.name.contains('Transfer ')), reason => ({ name: reason.name, value: reason }));
                        dispatch(setReasons(mappedReasons));
                        return mappedReasons
                    }).then(mappedReasons => {
                        goToProductPage(programId, programObject, program);
                    });
                }   
            });
        }
    };

    const goToProductPage = (programId, programObject, program) => {
        sourceDestinationService.getDestinationAssignments(
            programId, facility.id
        ).then(sourceDestinations => {
            const returnedSourceDestination = _.map(sourceDestinations, source => ({ name: source.name, value: source }));
            dispatch(setSourceDestinations(returnedSourceDestination));
            return returnedSourceDestination;
        }).then(returnedSourceDestination => {
            if (programSelected.programId !== program.id) {
                dispatch(resetAdjustment(adjustment));
            }
            dispatch(setProgram(programObject));
            history.push(`/make${adjustmentType}AddProducts`);
        });
    };

    const columns = useMemo(
        () => [
          {
            Header: "Program",
            hideHeader: false,
            columns: [
              {
                Header: "Name",
                accessor: "name",
                width: 200,
                hideHeader: true
              },
              {
                Header: "Value",
                Cell: ({ row }) => (
                    <i 
                        className="fa fa-chevron-right fa-2x" 
                        aria-hidden="true"
                        onClick={() => {
                            afterSelectProgram(row.original.value, row.original.name);
                        }}
                        height="18"
                    />
                ),
                width: 50,
                hideHeader: true 
              }
            ]
          }
        ],
        []
    );

    const hiddenColumns = ['Program','Name', "Value"];

    return (
        <div>
            <div className="page-header-responsive">
                <h2 id='program-select-header'>{adjustmentType}s for {facility.name}</h2>
            </div>
            <div className="page-content">
                <ReadOnlyTable columns={columns} data={programs} hiddenColumns={hiddenColumns}/>
            </div>
            <Toast 
                autoDelete={true}
                autoDeleteTime={4000}
                adjustmentType={adjustmentType}
                setToastList={setToastList}
            />
        </div>
    );
};

export default ProgramSelect;
