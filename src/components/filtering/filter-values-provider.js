import React from "react";
import {
  Plugin,
  Template,
  TemplateConnector,
  TemplatePlaceholder
} from "@devexpress/dx-react-core";
import { TableHeaderRow, Table } from "@devexpress/dx-react-grid";

const isFilterTableCell = (tableRow, tableColumn) =>
  tableRow.type === TableHeaderRow.ROW_TYPE &&
  tableColumn.type === Table.COLUMN_TYPE;

export const FilterValuesProvider = React.memo(() => (
  <Plugin name="FilterValuesProvider">
    <Template
      name="tableCell"
      predicate={({ tableRow, tableColumn }) =>
        isFilterTableCell(tableRow, tableColumn)
      }
    >
      {params => (
        <TemplateConnector>
          {({ columnFilterValues, filterExpression }, { setHeaderFilter }) => (
            <TemplatePlaceholder
              params={{
                ...params,
                columnFilterValues,
                setHeaderFilter,
                filterValue: (
                  filterExpression.filters.find(
                    ({ columnName }) =>
                      columnName === params.tableColumn.column.name
                  ) || {}
                ).value
              }}
            />
          )}
        </TemplateConnector>
      )}
    </Template>
  </Plugin>
));
