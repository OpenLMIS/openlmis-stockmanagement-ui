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

import React, {useEffect, useState, useRef} from 'react';
import { useHistory, useParams } from 'react-router-dom';
import AddProductForm from './add-product-form';

const AddProductPage = props => {
    const {facilityFactory, orderableGroupService} = props;
    const { physicalInventoryId } = useParams();
    // const {facilityFactory, orderableGroupService, programId, physicalInventoryId} = props;
    const [facilityId, setFacilityId] = useState("e6799d64-d10d-4011-b8c2-0e4d4a3f65ce");
    let programId="dce17f2e-af3e-40ad-8e00-3496adef44c3";
    // Two above lines to remove
    const [productNames, setProductNames] = useState([]);
    let orderableGroup = [];
    const history = useHistory();
    const childRef = useRef();
    const [productArray, setProductArray] = useState([<AddProductForm
        orderableGroupService={orderableGroupService}
        productNames={productNames}
        index={0}
        key={0}
        item={{}}
        removeProductFromArray={() => removeProductFromArray(0)}
        ref={childRef}
        physicalInventoryId={physicalInventoryId}
        />]);

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
                            value: product[0].lot.id
                        }
                    }));
                })
        }
    );

    const addNewEmptyProductForm = () => {
        let i;
        for(i = 0; i < productArray.length; i++)
        if(productArray[i] == null) {
            productArray[i] = newObject;
            break;
        }
        productArray.filter(item => item.key !== i.toString());
        productArray.push( <AddProductForm
            orderableGroupService={orderableGroupService}
            productNames={productNames}
            index={i}
            key={productArray.length}
            item={{}}
            removeProductFromArray={(i) => removeProductFromArray(i)}
            ref={childRef}
            physicalInventoryId={physicalInventoryId}
            />);
        setProductArray(productArray);
    };

    const removeProductFromArray = (i) => {
        const newArray =  [...productArray.slice(0, i), ...productArray.slice(i + 1)];
        setProductArray(newArray);
    };

    const returnToDraftPage = () => {
        history.goBack();
    };

    return (
        <div className="page-container">
            <div className="page-header-mobile">
                <h2>Add Products to Physical Inventory</h2>
                <button onClick={addNewEmptyProductForm} className={"add-products-button"}>Add</button>
            </div>
            <div className="form-container">
                <div className="form-body">
                    { productArray.map((item, i) => {
                            return(
                                <AddProductForm
                                    orderableGroupService={orderableGroupService}
                                    productNames={productNames}
                                    index={i}
                                    key={i}
                                    item={item}
                                    removeProductFromArray={() => removeProductFromArray(i)}
                                    ref={childRef}
                                />
                            )
                        }
                    )}
                </div>
                <div className="form-footer">
                    <button type="button" onClick={() => returnToDraftPage()}>
                        <span>Cancel</span>
                    </button>
                    <button type="button" className="add-items-button primary" onClick={() => childRef.current.onSubmit() }>{productArray.length} Items</button>
                </div>
            </div>
        </div>
    )
};

export default AddProductPage;
