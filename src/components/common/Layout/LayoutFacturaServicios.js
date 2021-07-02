import React, { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import {
  IntegratedSorting,
  SortingState,
  RowDetailState,
  SelectionState,
  IntegratedSelection,
  //TableColumnResizing,
} from "@devexpress/dx-react-grid";
import {
  Grid,
  TableHeaderRow,
  VirtualTable,
  TableColumnVisibility,
  TableFilterRow,
  Toolbar,
  TableRowDetail,
  TableSelection,
} from "@devexpress/dx-react-grid-bootstrap4";
import {
  Template,
  TemplatePlaceholder,
  TemplateConnector,
} from "@devexpress/dx-react-core";
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";

// COMPONENTS
import FilterCell from "../../common/Filters/FilterCell";
import RowFacturaServicioActions from "../Icons/RowFacturaServicioActions";

// CONSTANTS
import { compareDates } from "./../../constants";
import CheckAsociarServicioFactura from "../Inputs/CheckAsociarServicioFactura";

let arrayTotal = [];

const LayoutFacturaServicios = ({
  children,
  rows,
  setRows,
  columns,
  getServicios,
  setCheckedRows,
  checkedRows,
  totalServicios,
  setTotalServicios,
  baseImponible,
  setAllowedSendFactura,
}) => {
  const getRowId = (row) => row.ID;
  const filterRowMessages = {
    filterPlaceholder: "Filtrar...",
  };
  const [filterRows, setFilterRows] = useState(null);
  const [selectionRows, setSelectionRows] = useState([]);

  // SORTING DE FECHAS
  const [integratedSortingColumnExtensions] = useState([
    { columnName: "FECHA_REALIZACION", compare: compareDates },
    { columnName: "FECHA_SOLICITUD", compare: compareDates },
  ]);

  const [tableColumnExtensions] = useState([
    { columnName: "ID", width: 80 },
    { columnName: "CANTIDAD", width: 100 },
  ]);

  const onSelectionChanged = (selection) => {
    setSelectionRows(selection);
    setCheckedRows(
      rows.filter(
        (row) =>
          selection.findIndex((selectId) => selectId === getRowId(row)) !== -1
      )
    );
    arrayTotal = rows.filter(
      (row) =>
        selection.findIndex((selectId) => selectId === getRowId(row)) !== -1
    );
    let suma = 0;
    for (const checkedRow of arrayTotal) {
      suma = suma + parseFloat(checkedRow.TOTAL);
    }
    setTotalServicios(suma);
    isFacturaValid(suma);
  };

  const isFacturaValid = (importeTotal) => {
    console.log(importeTotal, baseImponible);
    if (importeTotal == baseImponible) setAllowedSendFactura(true);
    else setAllowedSendFactura(false);
  };

  return (
    <Col xs={10} md={12}>
      {!rows ? (
        <p>Cargando...</p>
      ) : (
        <Grid rows={rows} columns={columns} getRowId={getRowId}>
          {/* <DocumentColumnIcon /> */}
          <SortingState />
          <IntegratedSorting
            columnExtensions={integratedSortingColumnExtensions}
          />
          {children}
          <RowDetailState />
          <SelectionState
            selection={selectionRows}
            onSelectionChange={onSelectionChanged}
          />
          <IntegratedSelection />
          <VirtualTable columnExtensions={tableColumnExtensions} />
          <TableHeaderRow showSortingControls />
          <TableSelection />
          {/* <TableColumnResizing defaultColumnWidths={tableColumnExtensions} /> */}
          {/* <Toolbar /> */}
          <TableColumnVisibility />
          <TableRowDetail
            toggleCellComponent={(props) => (
              <RowFacturaServicioActions
                {...props}
                getServicios={getServicios}
                setCheckedRows={setCheckedRows}
                checkedRows={checkedRows}
              />
            )}
          />
          {/* <TableFilterRow
                  messages={filterRowMessages}
                  cellComponent={(props) => (
                    <FilterCell {...props} {...dataFilters} />
                  )}
                /> */}
          {/* <ExportExcel
                            rowsToExport={!filterRows ? rows : filterRows}
                            columns={columns}
                          /> */}
          {/* INICIO RECOGER LAS LÍNEAS FILTRADAS */}
          <Template name="root">
            <TemplateConnector>
              {({ rows: filteredRows }) => {
                setFilterRows(filteredRows);
                return <TemplatePlaceholder />;
              }}
            </TemplateConnector>
          </Template>
          {/* FIN RECOGER LAS LÍNEAS FILTRADAS */}
        </Grid>
      )}
    </Col>
  );
};

export default LayoutFacturaServicios;
