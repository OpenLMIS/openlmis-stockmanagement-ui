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

import React, { useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import BinCardTable from '../components/bin-card-table-component';

const ProductDetails = ({ stockCardService, messageService }) => {

    const history = useHistory();

    const product = useSelector(state => state['productStockOnHand']['productData']);
    const facility = useSelector(state => state['facilitiesStockOnHand']['facilityStockOnHand']);
    const program = useSelector(state => state['programsStockOnHand']['programStockOnHand']);

    const [productBinCard, setProductBinCard] = useState([]);
    const [binCardDisplayed, setBinCardDisplayed] = useState(false);
    const [expandProductClicked, setExpandProductClicked] = useState(null);

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(
            { 
                x: e.targetTouches[0].clientX,
                y: e.targetTouches[0].clientY
            }
        );
    };
    
    const onTouchMove = (e) =>  setTouchEnd( { 
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
    });
    
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const yDistance = touchStart.y - touchEnd.y
        const xDistance = touchStart.x - touchEnd.x;
        const isLeftSwipe = xDistance > minSwipeDistance && yDistance < 100;
        const isRightSwipe = xDistance < -minSwipeDistance && yDistance < 100;

        let displayBinCard;
        
        if (isLeftSwipe && !binCardDisplayed || isLeftSwipe && binCardDisplayed) {
            displayBinCard = true
        } else if (isRightSwipe && !binCardDisplayed || isRightSwipe && !binCardDisplayed || isRightSwipe && binCardDisplayed)  {
            displayBinCard = false;
        }
        
        binCardDisplayed != displayBinCard && setBinCardDisplayed(displayBinCard);
    };


    const dateFormat = (date) => {
        if (typeof date !== 'string') {
            return (
                date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()
            );
        }
        else {
            const correctDate = new Date(date);

            return (
                correctDate.getDate()+"/"+(correctDate.getMonth()+1)+"/"+correctDate.getFullYear()
            );
        }
    };

    const productData = [
        { name: 'Stock on Hand', value: product?.stockOnHand },
        { name: 'Product Code', value: product?.orderable?.productCode },
        { name: 'Lot Code', value: product?.lot?.lotCode ?? 'No lot defined' },
        { name: 'Expiry Date', value: product?.lot ? dateFormat(product?.lot?.expirationDate) : 'No lot defined'  },
        { name: 'Program', value: program?.name },
        { name: 'Facility Name', value: facility?.name },
    ];

    const columns =  useMemo(
        () => [
          {
            Header: 'Date',
            accessor: 'occurredDate'
          },
          {
            Header: 'Reason',
            accessor: 'reason.name'
          },
          {
            Header: () => 
                    <div>
                        Quantity <i className='fa fa-question-circle'/>
                    </div>,
            id: 'quantity',
            accessor: 'quantity',
            Cell: ({row}) => 
                    <div className='stock-on-hand'>
                        <div>
                            {row.original.quantity}
                        </div>
                        <div>
                            {`(${row.original.stockOnHand})`}
                        </div>
                    </div>
           },
            {
                Header: ' ',
                accessor: 'id',
                Cell: ({row}) =>
                    <i
                        className={`fa fa-chevron-${isProductExpanded(getExpandedProducts(), row.original.id) ? 'up' : 'down'}`}
                        aria-hidden='true'
                        onClick={() => {
                            handleExpandView(row.original.id);
                        }}
                    />
            }],
        []);

    const handleGoBack = () => {
        history.goBack();
    };

    const getExpandedProducts = () => {
        return JSON.parse(localStorage.getItem('expandedProductsBinCard')) || [];
    };

    const isProductExpanded = (expandedProducts, productId)=>  {
        return expandedProducts.filter((expandedProductId) => expandedProductId == productId).length > 0;
    };

    const handleExpandView = (productId) => {
        const expandedProducts = getExpandedProducts();
        const isExpanded = isProductExpanded(expandedProducts, productId);

        const expandedProductsToSet = isExpanded ?
        expandedProducts.filter((expandedProductId) => expandedProductId != productId) :
            [...expandedProducts, productId];

        setExpandProductClicked(`${productId}${isExpanded}`);
        localStorage.setItem('expandedProductsBinCard', JSON.stringify(expandedProductsToSet));
    };

    const getSignedQuantity = (adjustment) => {
        return adjustment.reason.reasonType === REASON_TYPES.DEBIT ? -adjustment.quantity
        : adjustment.quantity;
    }

    const getReason = (lineItem) => {
        if (lineItem.reasonFreeText) {
            return messageService.get('stockCard.reasonAndFreeText', {
                name: lineItem.reason.name,
                freeText: lineItem.reasonFreeText
            });
        }
        return lineItem.reason.isPhysicalReason()
            ? messageService.get('stockCard.physicalInventory')
            : lineItem.reason.name;
    };

    const prepareStockCard = (stockCard) => {
        const items = [];
        let previousSoh;

        stockCard.lineItems.forEach((lineItem) => {
            if (lineItem.stockAdjustments.length > 0) {
                lineItem.stockAdjustments.slice().forEach(function(adjustment, i) {
                    let lineValue = ineItem.copy();
                    if (i !== 0) {
                        lineValue.stockOnHand = previousSoh;
                    }
                    lineValue.reason = getReason(lineValue);
                    lineValue.quantity = adjustment.quantity;
                    lineValue.stockAdjustments = [];
                    items.push(lineValue);
                    previousSoh = lineValue.stockOnHand - getSignedQuantity(adjustment);
                });
            } else {
                items.push(lineItem);
            }
        });   

        return items.reverse();
    };


    const downloadBinCardData = () => {
        return stockCardService.getStockCard(product.stockCard.id).then((stockCard) => {
            setProductBinCard(prepareStockCard(stockCard));
        });
    };

    useEffect(() => {
        downloadBinCardData();
    }, [product]);

    useEffect(() => {}, [expandProductClicked]);

    return (
        <div className='product-main'>
            <div className='page-header-responsive with-back-button fixed'>
                <i
                    className='fa fa-chevron-left fa-x'
                    onClick={handleGoBack}
                />
                <h2 id='program-select-header'>
                    {program && `Bin Card for ${program.name}`}
                </h2>
            </div>
            <div className='product-nav'>
                <div 
                className={`nav-button ${!binCardDisplayed ? 'active' : undefined}`} 
                onClick={() => setBinCardDisplayed(false)}
                >
                    Product Info
                </div>
                <div 
                className={`nav-button ${binCardDisplayed ? 'active' : undefined}`}
                onClick={() => setBinCardDisplayed(true)}
                >
                    Bin Card
                </div>
            </div>
            <div 
                className='swipe'
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className={`product-info ${binCardDisplayed ? 'hidden' : undefined}`}>
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
                <div className={`${!binCardDisplayed ? 'hidden' : undefined}`}>
                    <BinCardTable
                        columns={columns}
                        data={productBinCard}
                        expandedProducts={getExpandedProducts()}
                        isProductExpanded={isProductExpanded}
                    />
                </div>
            </div>
        </div>
    )
}
export default ProductDetails;
