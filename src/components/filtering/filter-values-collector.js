import React from "react";
import { Plugin, Getter } from "@devexpress/dx-react-core";

const filterValuesComputed = ({ rows, columns, getCellValue }) => {
    
  columns.reduce((acc, { name: colName }) => {
    console.log("filtervalues",acc )
    const values = new Set(rows.map(r => getCellValue(r, colName)));
    acc[colName] = Array.from(values);
    return acc;
  }, {});
}

export const FilterValuesCollector = React.memo(() => (
  <Plugin name="filterValuesCollector">
    <Getter name="columnFilterValues" computed={filterValuesComputed} />
  </Plugin>
));