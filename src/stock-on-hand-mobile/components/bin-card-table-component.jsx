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

import React, { useState } from 'react';
import { useTable } from 'react-table';
import Tooltip from '../../react-components/modals/tooltip';

const BinCardTable = ({
    columns,
    data,
    hiddenColumns,
    isProductExpanded,
    expandedProducts,
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

    const [quantityInfoDisplayed, setQuantityInfoDisplayed] = useState(false);
    const quantityInfo = 'The value on the left is the number of adjustments ' +
    'while the number in brackets is the current stock on hand.';

    return (
        <>
            <table { ...getTableProps() } {...props} className='stock-on-hand-table bin-card-table'>
                <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()} >
                        {headerGroup.headers.map((column) => {
                            if (!column.hideHeader) {
                                return <th 
                                tabIndex='1'
                                {...column.getHeaderProps()}
                                onClick={column.id === 'quantity' ? () => {setQuantityInfoDisplayed(!quantityInfoDisplayed)} : undefined}
                                onBlur={() => setQuantityInfoDisplayed(false)}
                                >
                                    {column.render('Header')}
                                    {
                                        quantityInfoDisplayed && column.id === 'quantity' && <Tooltip displayText={quantityInfo}/>
                                    }
                                </th>
                            }
                            return <th className='hidden'/>
                        })}
                    </tr>
                ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row) => {
                        const productBinCardInfo = 
                        <>
                            <tr className={`row-expanded ${!isProductExpanded(expandedProducts, row.original.id) && 'hidden'}`}>
                                    <td className='cell-expanded' colSpan='2'>
                                        Receive from
                                    </td>
                                    <td className='cell-expanded' colSpan='2'>
                                        {row.original.source ? row.original.source.name : '-'}
                                    </td>
                            </tr>
                            <tr className={`row-expanded ${!isProductExpanded(expandedProducts, row.original.id) && 'hidden'}`}>
                                    <td className='cell-expanded' colSpan='2'>
                                        Issue to
                                    </td>
                                    <td className='cell-expanded' colSpan='2'>
                                        {row.original.destination ? row.original.destination.name : '-'}
                                    </td>
                            </tr>
                            <tr className={`row-expanded ${!isProductExpanded(expandedProducts, row.original.id) && 'hidden'}`}>
                                    <td className='cell-expanded' colSpan='2'>
                                        Signature
                                    </td>
                                    <td className='cell-expanded' colSpan='2'>
                                        {row.original.signature ? row.original.signature : '-'}
                                    </td>
                            </tr>
                        </>

                        prepareRow(row);

                        return (           
                            <>
                                <tr 
                                {...row.getRowProps()}
                                className={isProductExpanded(expandedProducts, row.original.id) ? 'row-with-info-expanded'
                                : undefined}
                                >
                                    {row.cells.map(cell => {
                                        return <td
                                            className='cell-not-expanded'
                                            key={cell.getCellProps().key}
                                            {...cell.getCellProps()}
                                            >
                                                {cell.render('Cell')}
                                            </td>;
                                    })}
                                </tr>
                                {productBinCardInfo}
                            </>
                        );
                    })}
                </tbody>
            </table>
        </>
    );
};

export default BinCardTable;
