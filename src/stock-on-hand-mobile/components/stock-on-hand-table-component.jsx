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
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTable } from 'react-table';
import { setProductData } from "../reducers/product";

const StockOnHandTable = ({
    columns,
    data,
    facility,
    program,
    hiddenColumns,
    isProductExpanded,
    expandedProducts,
    show,
    ...props
}) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable(
        {
            columns,
            data,
            hiddenColumns
        },
    );

    const history = useHistory();
    const dispatch = useDispatch();

    const goToProductInfo = (product) => {
        const facilityId = facility.id;
        const programId = program.id;
        const productId = product.orderable.id;

        dispatch(setProductData(product));

        history.push(`/stockOnHand/${facilityId}/${programId}/${productId}`);
    }

    return (
        <>
            <table { ...getTableProps() } className={`stock-on-hand-table ${!show ? 'hidden' : undefined}`}>
                <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()} >
                        {headerGroup.headers.map((column) => {
                            if (!column.hideHeader) {
                                return <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                            }
                            return  <th className='hidden'/>
                        })}
                    </tr>
                ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map(row => {
                        const productInfo = row.original.canFulfillForMe.map((product) => {
                            return (
                                <tr className={`row-expanded ${!isProductExpanded(expandedProducts, row.original.orderable.id) && 'hidden'}`}>
                                    <td className='cell-expanded'>
                                        <div>Lot Code</div>
                                        <div>Quantity</div>
                                    </td>
                                    <td/>
                                    <td className='cell-expanded'>
                                        <div onClick={() => goToProductInfo(product)}>
                                            {product?.lot?.lotCode ??  'No lot defined'}
                                        </div>
                                        <div>
                                            {product.stockOnHand}
                                        </div>
                                    </td>
                                </tr>
                            );
                        });

                    prepareRow(row);

                    return (
                        <>
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td className='cell-not-expanded' key={cell.getCellProps().key} {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                                })}
                            </tr>
                            {productInfo}
                        </>
                    );
                })}
                </tbody>
            </table>
            {rows.length == 0 &&
                <div className='no-products-found'>
                    No products found.
                </div>
            }
        </>
    );
};

export default StockOnHandTable;
