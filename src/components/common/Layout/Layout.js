import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { Row, Col } from "reactstrap";
import {
  IntegratedSorting,
  SortingState,
  SearchState,
  FilteringState,
  IntegratedFiltering,
  RowDetailState,
  PagingState,
  IntegratedPaging,
} from "@devexpress/dx-react-grid";
import { SearchPanel } from "@devexpress/dx-react-grid-bootstrap4";
import {
  Grid,
  TableHeaderRow,
  VirtualTable,
  TableColumnVisibility,
  TableFilterRow,
  Toolbar,
  ExportPanel,
  TableRowDetail,
  PagingPanel,
} from "@devexpress/dx-react-grid-bootstrap4";
import {
  Template,
  TemplatePlaceholder,
  TemplateConnector,
} from "@devexpress/dx-react-core";
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";
import { GridExporter } from "@devexpress/dx-react-grid-export";
import saveAs from "file-saver";
import MultiSelect from "@khanacademy/react-multi-select";

// COMPONENTS
import ExportExcel from "./../Export/ExportExcel";
import Buttons from "./../Buttons/Buttons";
import FilterCell from "../../common/Filters/FilterCell";
import RowVentaActions from "../Icons/RowVentaActions";

// CONSTANTS
import { compareDates } from "./../../constants";

// CONTEXT
import { GlobalDispatchContext } from "../../../context/GlobalContext";

// GRAPHQL
import {
  client,
  getVentasAllCentros,
  getVentasByCentroFilter,
  getCentros,
  getVentasByCentro
} from "../../graphql";

const Layout = ({
  title,
  rows,
  setRows,
  columns,
  columnsToExport,
  children,
  fetchVentas,
  setEstadoName,
  user,
  lastQuery,
  setLastQuery,
}) => {
  const dispatch = useContext(GlobalDispatchContext);
  const getRowId = (row) => row.id;
  const filterRowMessages = {
    filterPlaceholder: "Filtrar...",
  };
  const [filterRows, setFilterRows] = useState(0);
  const [count, setCount] = useState(null);
  const [pageSizes] = React.useState([5, 10, 15]);
  // SORTING DE FECHAS
  const [integratedSortingColumnExtensions] = useState([
    { columnName: "fecha_venta", compare: compareDates },
  ]);

  // FILTRO COLUMNA
  const columnFilterMultiPredicate = (value, filter, row) => {
    if (!filter.value.length) return true;
    for (let i = 0; i < filter.value.length; i++) {
      if (value === filter.value[i]) return true;
    }


    return IntegratedFiltering.defaultPredicate(value, filter, row);
  };

  const [filteringColumnExtensions, setFilteringColumnExtensions] = useState([
    { columnName: "centro", predicate: columnFilterMultiPredicate },
    { columnName: "estado", predicate: columnFilterMultiPredicate },
  ]);

  // EXPORT EXCEL
  const onSave = (workbook) => {
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        "Servicios.xlsx"
      );
    });
  };
  const [rowsExport, setRowsExport] = useState(null);
  const exporterRef = useRef(null);

  const startExport = useCallback(() => {
    exporterRef.current.exportGrid();
  }, [exporterRef]);

  const exportMessages = {
    exportAll: "Exportar todo",
  };

  // FILTRO BÚSQUEDA
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  //const [lastQuery, setLastQuery] = useState();

  const getQueryString = () => {
    let filter;
    if (
      user.rolDesc !== "BRICOMART_CENTRO" &&
      user.rolDesc !== "BRICOMART_INPROECO_CENTRO"
    ) {
      filter = columns
        .reduce((acc, { name }) => {
          if (name === "id") {
            console.log("id");
            //acc.push(`{"${name}": {"_eq": "${searchValue}"}}`);
          } else if (name === "estado") {
            acc.push(
              `{"estado_venta": {"nombre": {"_ilike": "%${searchValue}%"}}}`
            );
          } else acc.push(`{"${name}": {"_ilike": "%${searchValue}%"}}`);
          return acc;
        }, [])
        .join(",");

      if (columns.length > 1) {
        filter = `${filter}`;
      }
      return `{"_or":[${filter}]}`;
    }

    filter = columns
      .reduce((acc, { name }) => {
        if (name === "id") {
          /* console.log("id"); */
          //acc.push(`{"${name}": {"_eq": "${searchValue}"}}`);
        } else if (name === "estado") {
          acc.push(
            `{"estado_venta": {"nombre": {"_ilike": "%${searchValue}%"}}}`
          );
        } else acc.push(`{"${name}": {"_ilike": "%${searchValue}%"}}`);
        return acc;
      }, [])
      .join(",");

    if (columns.length > 1) {
      filter = `${filter}`;
    }
    return `{"_and":[{"centro_id":{"_eq":"${user.centroId}"}}, {"_or":[${filter}]}]}`;
  };

  const loadData = (excelExport = false) => {
    const queryString = getQueryString();
    console.log(JSON.parse(queryString));
    let limit = excelExport ? 10000 : 500;
    if (
      (queryString && excelExport) ||
      (queryString !== lastQuery && !loading)
    ) {
      client
        .query({
          query:
            user.rolDesc !== "BRICOMART_CENTRO" &&
              user.rolDesc !== "BRICOMART_INPROECO_CENTRO"
              ? getVentasAllCentros
              : getVentasByCentroFilter,
          fetchPolicy: "no-cache",
          variables: {
            limit: limit,
            fields: JSON.parse(queryString),
          },
        })
        .then((res) => {
          const results = setEstadoName(res.data.ventas_bricomart);
          if (!excelExport) {
            setRows(results);
            setLastQuery(queryString);
          } else {
            setRowsExport(results, () => startExport(rowsExport));
            startExport();
          }
        });
      if (!excelExport) setLastQuery(queryString);
    }
  };

  const dataCountFilter = () => {
    const queryString = getQueryString();
    client
      .query({
        query:
          user.rolDesc !== "BRICOMART_CENTRO" &&
            user.rolDesc !== "BRICOMART_INPROECO_CENTRO"
            ? getVentasAllCentros
            : getVentasByCentro,
        fetchPolicy: "no-cache",
        variables: {

          fields: JSON.parse(queryString),
        },
      })
      .then((res) => {
        const results = res.data.ventas_bricomart.length;
        setCount(results)

      });

  }

  const dataCount = () => {
    client
      .query({
        query:
          user.rolDesc !== "BRICOMART_CENTRO" &&
            user.rolDesc !== "BRICOMART_INPROECO_CENTRO"
            ? getVentasAllCentros
            : getVentasByCentro,
        fetchPolicy: "no-cache",
        variables: {

          fields: lastQuery,
        },
      })
      .then((res) => {
        const results = res.data.ventas_bricomart.length;
        setCount(results)

      });

  }



  const [centros, setCentros] = useState([]);
  const fetchCentros = useCallback(async () => {
    let results = [];
    await client
      .query({
        query: getCentros,
        fetchPolicy: "no-cache",
      })
      .then((res) => {
        console.log(res.data.getCentroProductor);
        for (let centro of res.data.getCentroProductor) {
          results.push(centro.DENOMINACION);
        }
      });
    setCentros(results);
  }, [client, getCentros]);

  useEffect(() => {
    dataCount()
    fetchCentros();

  }, []);

  useEffect(() => {
    dataCountFilter()
  }, [getQueryString])

  useEffect(() => {
    dispatch({ type: "SET_LOAD_VENTAS", payload: { loadVentas: loadData } });
    if (searchValue !== "") {
      loadData();
    } else {
      fetchVentas();
    }
  }, [searchValue]);

  return (
    <div>
      <div className="content">
        <Row>
          <Col xs={12} md={12}>
            <div className="page-title">
              <div className="float-left">
                <h2 className="title">{title}</h2>
              </div>
            </div>
            <div className="col-12">
              <section className="box">
                <div className="content-body">
                  <div className="row">
                    <div className="col-lg-12 card">
                      {!rows ? (
                        <p>Cargando...</p>
                      ) : (
                        <Grid rows={rows} columns={columns} getRowId={getRowId}>
                          <PagingState defaultCurrentPage={0} pageSize={10} />
                          <IntegratedPaging />
                          <SearchState onValueChange={setSearchValue} />
                          <SortingState />
                          <FilteringState defaultFilters={[]} />
                          <RowDetailState />
                          <IntegratedSorting
                            columnExtensions={integratedSortingColumnExtensions}
                          />
                          <IntegratedFiltering
                            columnExtensions={filteringColumnExtensions}
                          />
                          {children}
                          <VirtualTable />
                          <TableHeaderRow showSortingControls />
                          <Toolbar />
                          {/* <TableColumnVisibility
                            hiddenColumnNames={hiddenColumnsNames}
                          />
                          */}
                         {/*  <TableFilterRow
                            messages={filterRowMessages}
                            cellComponent={(props) => (
                              <FilterCell {...props} centros={centros} />
                            )}
                          /> */}
                          <SearchPanel
                            messages={{ searchPlaceholder: "Buscar..." }}
                          />
                          <ExportPanel
                            messages={exportMessages}
                            startExport={() => loadData(true)}
                          />
                          <GridExporter
                            ref={exporterRef}
                            rows={rowsExport}
                            columns={columnsToExport}
                            onSave={onSave}
                          />
                          <TableRowDetail
                            toggleCellComponent={(props) => (
                              <RowVentaActions {...props} />
                            )}
                          />
                          {/* INICIO RECOGER LAS LÍNEAS FILTRADAS */}
                          <Template name="root">
                            <TemplateConnector>
                              {({ rows: filteredRows }) => {
                                console.log(filteredRows);

                                setFilterRows(filteredRows.length);
                                return <TemplatePlaceholder />;
                              }}
                            </TemplateConnector>
                          </Template>
                          {/* FIN RECOGER LAS LÍNEAS FILTRADAS */}
                          <PagingPanel />
                        </Grid>
                      )}

                    </div>
                  </div>
                  <p>Mostrando {filterRows} de {count} resultados</p>
                </div>
              </section>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Layout;
