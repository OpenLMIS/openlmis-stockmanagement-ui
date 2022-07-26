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
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

import React from 'react';

const BlockList = ({data, dataToDisplay, headerToDisplay, heightOfBlock, onClickAction}) => {
    return (
        <div className="react-block-list-container" style={{width: "100%"}}>
            <div className="react-block-list-content">
                {data.map((row, i) => {
                    return (
                        <div className="react-block-list-container-row" onClick={() => onClickAction(row, i)} style={{height: heightOfBlock, width: "100%",  borderBottom: "1px solid #dbdada", borderTop: "1px solid #dbdada"}}>    
                            {dataToDisplay.map((display, index) => {
                                if (row.hasOwnProperty(display.key)) {
                                    if (headerToDisplay === display.key) {
                                        return ( 
                                            <div className="react-block-list-container-header-text" style={{height: "16px", display: "flex", marginBottom: "16px", marginTop: "16px"}}>
                                                <h3 style={{marginLeft: "5%", fontWeight: "bold", fontSize: "18px"}}>{row[display.key]}</h3>
                                            </div>
                                        );  
                                    } else {
                                        return ( 
                                            <div className="react-block-list-container-text" style={{height: "16px", display: "flex", justifyContent: "space-between", marginBottom: "16px"}}>
                                                <p style={{marginLeft: "5%", fontSize: "16px"}}>{display.textToDisplay}</p>
                                                <p style={{marginRight: "8%", fontSize: "16px", fontWeight: "bold"}}>{row[display.key]}</p>
                                            </div>
                                        );
                                    }    
                                }
                            })}
                        </div>
                    );
                })}  
            </div>
        </div>
    );
};

export default BlockList;
