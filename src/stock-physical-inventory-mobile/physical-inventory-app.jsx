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

import React from 'react';
import ProgramSelectFormComponent from "./program-select-form.component";
import PhysicalInventoryForm from "./physical-inventory-form.component";

class PhysicalInventoryApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            programs: [],
            stage: 'PROGRAM_SELECTION',
            facilityId: null,
            programId: null
        }

        this.setStage = this.setStage.bind(this);
    }

    componentDidMount() {
        this.props.facilityFactory.getUserHomeFacility()
            .then(facility => {
                this.setState({
                    facilityId: facility.id,
                    programs: facility.supportedPrograms.map(p => {
                        return {
                            id: p.id,
                            name: p.name
                        }
                    })
                })
            })
    }

    setStage(stage, context) {
        switch (stage) {
            case 'PHYSICAL_INVENTORY_FORM':
                this.setState({
                    stage: stage,
                    programId: context.programId
                });
                break
            case 'PROGRAM_SELECTION':
            default:
                this.setState({
                    stage: stage
                });
        }
    }

    render() {
        const handleProgramChange = programId => {
            this.setStage('PHYSICAL_INVENTORY_FORM', {programId: programId});
        }

        return (
            <div>
                <h2>Physical inventory (Mobile)</h2>
                {
                    this.state.stage === 'PROGRAM_SELECTION'
                    && <ProgramSelectFormComponent programs={this.state.programs} onSubmit={handleProgramChange}/>
                }
                {
                    this.state.stage === 'PHYSICAL_INVENTORY_FORM'
                    && this.state.programId !== null
                    && <PhysicalInventoryForm
                        physicalInventoryFactory={this.props.physicalInventoryFactory}
                        facilityId={this.state.facilityId}
                        programId={this.state.programId}/>
                }
            </div>
        )
    }
}


export default PhysicalInventoryApp;
