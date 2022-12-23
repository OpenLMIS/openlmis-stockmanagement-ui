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

export const RadioButton = (props) => {
    const { changed, id, isSelected, label, additionalInfo="", value } = props;
    return (
      <div className="RadioButton">
        <input
            id={id}
            onChange={changed}
            value={value}
            type="radio"
            checked={isSelected}
        />
        <label 
          style={{display: "inline-block", fontFamily: "Arial", fontSize: "16px", padding: "4px 16px", fontWeight: "400"}} 
          htmlFor={id}
        >
          {label} 
          <p style={{color: "#A4A4A4", display: "inline-block"}}>{additionalInfo}</p>
        </label>
      </div>
    );
};
  