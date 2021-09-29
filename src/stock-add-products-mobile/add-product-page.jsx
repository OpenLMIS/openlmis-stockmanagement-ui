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

import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import AddProductForm from './add-product-form';
import FooterButtons from './footer-buttons';

const AddProductPage = props => {
    const {facilityFactory, orderableGroupService} = props;
    // const {facilityFactory, orderableGroupService, programId, physicalInventoryId} = props;
    const [facilityId, setFacilityId] = useState("e6799d64-d10d-4011-b8c2-0e4d4a3f65ce");
    let programId="dce17f2e-af3e-40ad-8e00-3496adef44c3";
    let physicalInventoryId="9a0d7e16-0f92-45b7-b0da-165f2bfdf1e0";
    // Two above lines to remove
    const [productNames, setProductNames] = useState([]);
    const [count, setCount] = useState(1) 
    let orderableGroup = [];
    const history = useHistory();
    let [productArray, setProductArray] = useState([...Array(count)]);

    useEffect(
        () => {
            facilityFactory.getUserHomeFacility()
                .then(facility => {setFacilityId(facility.id)});
                orderableGroup = orderableGroupService.findAvailableProductsAndCreateOrderableGroups(programId, facilityId, false);

                orderableGroup.then(orderableGroup => {
                    setProductNames(orderableGroup.map(product => {
                        return {
                            name: product[0].orderable.fullProductName,
                            value: product[0].orderable.id,
                            selectedItem: product[0]
                        }
                    }));
                });

                orderableGroup.then(orderableGroup => {
                    setLotCodes(orderableGroup.map(product => {
                        return {
                            name: product[0].lot.lotCode,
                        }
                    }));
                })
        }, []
    );

    const addNewEmptyProductForm = () => {
        productArray.push((_, i) => 
                    <AddProductForm 
                    orderableGroupService={orderableGroupService}
                    productNames={productNames}
                    count={count}
                    index={i}
                    productArray={productArray}
                    setProductArray={setProductArray}
                    setCount={setCount}
                    />)
        setProductArray(productArray);
        setCount(count + 1);
    }
  
    const returnToDraftPage = () => {
        history.goBack();
    }

    return ( 
    <div className="page-mobile">
        <div className="page-container">
            <div className="page-header-mobile">
                <h2>Add Products to Physical Inventory</h2>
                <button onClick={addNewEmptyProductForm} className={"add-products-button"}>Add</button>
            </div>
            <div className="page-content">
                { productArray.map((_, i) => 
                    <AddProductForm 
                    orderableGroupService={orderableGroupService}
                    productNames={productNames}
                    count={count}
                    index={i}
                    productArray={productArray}
                    setProductArray={setProductArray}
                    setCount={setCount}
                    />)
                }
            </div>
        </div>
        <FooterButtons
                count={count}
                returnToDraftPage={returnToDraftPage}
                onSubmit={() => onSubmit()}
        >
        </FooterButtons>
    </div>
    )
}

export default AddProductPage;
