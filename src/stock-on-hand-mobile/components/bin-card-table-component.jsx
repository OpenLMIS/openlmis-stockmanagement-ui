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
import { useTable } from 'react-table';

const BinCardTable = ({
    columns,
    data,
    hiddenColumns,
    // isProductExpanded,
    // expandedProducts,
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

    console.log(data);

    return (
        <>
            <table { ...getTableProps() } className='stock-on-hand-table bin-card-table'>
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
                    {rows.map((row) => {
                        prepareRow(row);
                        return (            <>
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td className='cell-not-expanded' key={cell.getCellProps().key} {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                                })}
                            </tr>
                            {/* {productInfo} */}
                        </>)
                    })}
                    {/* {rows.map(row => {
                        const productInfo = row.original.canFulfillForMe.map((product) => {
                            return (
                                <tr className={`row-expanded ${!isProductExpanded(expandedProducts, row.original.orderable.id) && 'hidden'}`}>
                                    <td className='cell-expanded'>
                                        <div className='info-cell'>
                                            <div>Lot Code</div>
                                            <div>Quantity</div>
                                        </div>
                                    </td>
                                    <td/>
                                    <td className='cell-expanded'>
                                        <div className='info-cell'>
                                            <div onClick={() => goToProductInfo(product)}>
                                                {product?.lot?.lotCode ??  'No lot defined'}
                                            </div>
                                            <div>
                                                {product.stockOnHand}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        });

                    prepareRow(row); */}

                    {/* return ( */}
            
                    {/* ); */}
                 {/* })} */}
                </tbody>
            </table>
        </>
    );
};

export default BinCardTable;
