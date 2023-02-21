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
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProductDetails = () => {

    const history = useHistory();

    const product = useSelector(state => state['productStockOnHand']['productData']);
    const facility = useSelector(state => state['facilitiesStockOnHand']['facilityStockOnHand']);
    const program = useSelector(state => state['programsStockOnHand']['programStockOnHand']);

    const dateFormat = (date) => {
        if (typeof date !== 'string'){
            return (
                date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()
            )
        }
        else {
            const correctDate = new Date(date);

            return (
                correctDate.getDate()+"/"+(correctDate.getMonth()+1)+"/"+correctDate.getFullYear()
            )
        }

    }

    const productData = [
        { name: 'Stock on Hand', value: product?.stockOnHand },
        { name: 'Product Code', value: product?.orderable?.productCode },
        { name: 'Lot Code', value: product?.lot?.lotCode ?? 'No lot defined' },
        { name: 'Expiry Date', value: product?.lot ? dateFormat(product?.lot?.expirationDate) : 'No lot defined'  },
        { name: 'Program', value: program?.name },
        { name: 'Facility Name', value: facility?.name },
    ]

    const handleGoBack = () => {
        history.goBack();
    };


    return (
        <div className='product-main'>
            <div className='page-header-responsive with-back-button'>
                <i
                    className='fa fa-chevron-left fa-x'
                    onClick={handleGoBack}
                />
                <h2 id='program-select-header'>
                    {program && `Bin Card for ${program.name}`}
                </h2>
            </div>
            <div className='product-nav'>
                <div className='nav-button active'>Product Info</div>
                <div className='nav-button'>Bin Card</div>
            </div>
            <div className='product-info'>
                <div className='product-title'>
                    {`${product?.orderable?.fullProductName} - ${product?.orderable?.dispensable?.displayUnit}`}
                </div>
                {productData?.map((element, index) => {
                    return (
                        <div key={index} className='product-info-row'>
                            <div className='left-column'>{element?.name}</div>
                            <div className='right-column'>{element?.value}</div>
                        </div>
                    );
                })}
                <div className='product-info-row'>
                    <div className='left-column gray-text'>Last Updated</div>
                    <div className='right-column gray-text'>{dateFormat(product?.orderable?.lastModified)}</div>
                </div>
            </div>
        </div>
    )
}
export default ProductDetails;
