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

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { setFacilityStockOnHand } from '../reducers/facilities';
import { setProgramStockOnHand } from '../reducers/programs';
import StockOnHandTable from '../components/stock-on-hand-table-component';
import Filter from '../components/filter';

const StockOnHand = ({ facilityService, programService, StockCardSummaryRepository }) => {

    const { facilityId, programId } = useParams();
    const history = useHistory();
    const dispatch = useDispatch();

    const [products, setProducts] = useState([]);
    const [filterClicked, setFilterClicked] = useState(false);
    const [expandProductClicked, setExpandProductClicked] = useState(null);

    const facility = useSelector(state => state['facilitiesStockOnHand']['facilityStockOnHand']);
    const program = useSelector(state => state['programsStockOnHand']['programStockOnHand']);

    const queryParams = {
        programId : programId,
        facilityId:  facilityId
    };

    const filters = [
        {
            name: 'includeInactive', 
            type: 'checkbox', 
            displayText: 'Include inactive items'
        },
        {
            name: 'orderableCode',
            type: 'text',
            displayText: 'Product Code'
        },
        {
            name: 'orderableName',
            type: 'text' , 
            displayText: 'Product Name'
        }, 
        {
            name: 'lotCode',
            type: 'text', 
            displayText: 'Lot Code'
        }
    ];

    const handleGoBack = () => {
        history.goBack();
    };

    const downloadFacilityData = () => {
        return facilityService.get(facilityId).then((facility) => {
            dispatch(setFacilityStockOnHand(facility));
        });
    };

    const downloadProgramData = () => {
        return programService.get(programId).then((program) => {
            dispatch(setProgramStockOnHand(program));
        });
    };

    const downloadStockCardSummary = (queryParams) => {
        return new StockCardSummaryRepository().query(queryParams).then((products) => {
            const notNullSOHProducts= products.content.filter((product) => product.stockOnHand != null);
            setProducts(notNullSOHProducts);
        });
    };

    const getExpandedProducts = () => {
        return JSON.parse(localStorage.getItem('expandedProducts')) || [];
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
        localStorage.setItem('expandedProducts', JSON.stringify(expandedProductsToSet));
    };

    const columns =  useMemo(
        () => [
          {
            Header: 'Product Code',
            accessor: 'orderable.productCode'

          },
          {
            Header: 'Name',
            accessor: 'orderable.fullProductName'
          },
          {
            Header: 'Stock on Hand',
            accessor: 'stockOnHand',
            Cell: ({ row }) =>
                <div className='stock-on-hand-value'>
                    <div>
                        {row.original.stockOnHand}
                    </div>
                    <i
                        className={`fa fa-chevron-${isProductExpanded(getExpandedProducts(), row.original.orderable.id) ? 'up' : 'down'}`}
                        aria-hidden='true'
                        onClick={() => {
                            handleExpandView(row.original.orderable.id);
                        }}
                    />
                </div>
           }],
        [] );

    useEffect(() => {
        Promise.all([
            downloadFacilityData(), 
            downloadProgramData(), 
            downloadStockCardSummary(queryParams)
        ]);
    },
    [facilityId, programId]);

    useEffect(() => {}, [expandProductClicked]);

    return (
        <>
            <div className='page-header-responsive with-back-button'>
                <i
                    className='fa fa-chevron-left fa-x'
                    onClick={handleGoBack}
                />
                <h2 id='program-select-header'>
                    {facility && program && `Stock on Hand - ${facility.name} - ${program.name}`}
                </h2>
            </div>
            <Filter
                filters={filters}
                queryParams={queryParams}
                onSubmit={downloadStockCardSummary}
                onClick={() => setFilterClicked(!filterClicked)}
            />
            <StockOnHandTable
                columns={columns}
                data={products}
                facility={facility}
                program={program}
                expandedProducts={getExpandedProducts()}
                isProductExpanded={isProductExpanded}
            />
        </>
    );
};

export default StockOnHand;
