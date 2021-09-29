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

import React, {useState} from 'react';

const BinButton = props => {
  const {count, index, productArray, removeProductForm} = props;
  const handleClick = () => { removeProductForm(index, productArray)};
  
  if(count > 1){
    return (
      <button className="bin-button" type="button" onClick={handleClick}>
      </button>
    );
  } else {
    return <div className="d-none"></div>
  }
};


export default BinButton;