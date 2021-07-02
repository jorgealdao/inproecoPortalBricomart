import React, { useState, useEffect } from 'react';

import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
  Container, Row, Col, Label, FormGroup, Input,
} from 'reactstrap';
//import ReactDOM from "react-dom";
import ReactDataGrid from "react-data-grid";
//import "./styles.css";
import { client, getRetiradas, getTotalCount, GET_RETIRADA_COLS } from "../../../components/graphql";
import { gql } from "apollo-boost";
import {Popup, PopupEditing} from "./PopupEditing";

import {
  FilteringState,
  IntegratedFiltering,
  GroupingState,
  DataTypeProvider,
  EditingState,
  PagingState,
  IntegratedPaging,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,
  TableFilterRow,
  TableGroupRow,
  GroupingPanel,
  TableEditRow,
  TableEditColumn,
  PagingPanel,
  DragDropProvider,
  Toolbar,
  TableInlineCellEditing
} from '@devexpress/dx-react-grid-bootstrap4';
import '@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css';

const getRowId = row => row.id;
const editColumnMessages = {
  addCommand: 'Nuevo',
  editCommand: 'Editar',
  deleteCommand: 'Borrar',
  commitCommand: 'Grabar',
  cancelCommand: 'Cancelar',
};

const filterRowMessages = {
  filterPlaceholder: 'Filtrar...',
};

const BooleanFormatter = ({ value }) => (
  <span className="badge badge-secondary">{value}</span>
);

const BooleanEditor = ({ value, onValueChange, column, onBlur, autoFocus }) => (
  <select
    className="form-control"
    value={value}
    onChange={(e) => {
      onValueChange(e.target.value === value);

    }}
    onBlur={() => onValueChange(value)}
    autoFocus={autoFocus}
  >
    <option value="Martínez Cano - Tenerife">Martínez Cano - Tenerife</option>
    <option value="Acteco">Acteco</option>
    <option value="ECOASIMELEC">ECOASIMELEC</option>
    <option value="Rimetal">Rimetal</option>
  </select>
);

const BooleanTypeProvider = (props) => (
  <DataTypeProvider
    formatterComponent={BooleanFormatter}
    editorComponent={BooleanEditor}
    {...props}
  />
);



export default () => {
  const remoteData = (query) => {
    return client.query({
      query: getRetiradas,
      variables: {
        offset: 0,
        limit: 10
      }
    }).then((res) => {
      let results = []
      for (let i = 0; i < res.data.getRetiradasView.length; i++) {
        res.data.getRetiradasView[i].id = res.data.getRetiradasView[i].ID;
        results.push(res.data.getRetiradasView[i])
      }

      setRows(results)
    })
  }
  const [columns] = useState([
    { name: "ID", title: "id" },
    { name: "CENTRO", title: "Centro" },
    { name: "RESIDUO", title: "Residuo" },
    { name: "CLIENTE", title: "Cliente" },
    { name: "CANTIDAD", title: "Cantidad" },
    { name: "OBSERVACIONES", title: "Observaciones" },
    { name: "TRANSPORTISTA", title: "Transportista" },
  ]);
  const [booleanColumns] = useState(["TRANSPORTISTA"]);
  const [residuoColumns] = useState(["RESIDUO"]);
  const [residuos, setResiduos] = useState(null);
  const [rows, setRows] = useState(null);
  useEffect(() => {
    remoteData("test")
  }, [])

  const ResiduoFormatter = ({ value }) => (
    <span>{value}</span>
  );
  
  const ResiduoEditor = ({ value, onValueChange, row, column, onBlur, autoFocus }) => {
    console.log("row", row);
    if(row && row.id == 160215) {
      console.log("entro")
    client.query({
      query: GET_RETIRADA_COLS,
      variables: {
        CENTRO_PRODUCTOR: row.CENTRO_PRODUCTOR_ID.toString()
      }
    }).then((res) => {
      // let results = []
      // for (let i = 0; i < res.data.getCentroProductorResiduo.length; i++) {
      //   res.data.getRetiradasView[i].id = res.data.getRetiradasView[i].ID;
      //   results.push(res.data.getRetiradasView[i])
      // }
  
      setResiduos(res.data.getCentroProductorResiduo)
    })}
    return (
    <select
      className="form-control"
      value={value}
      onChange={(e) => {
        //console.log("change")
        onValueChange(e.target.value === value);
  
      }}
      onBlur={() => onValueChange(value)}
      autoFocus={autoFocus}
    >
      {residuos && residuos.map((residuo) => 
        <option value="{residuo.RESIDUO_ID}">{residuo.RESIDUO[0].NOMBRE}</option>
      )}
    </select>
  )
  };
  
  const ResiduoTypeProvider = (props) => (
    <DataTypeProvider
      formatterComponent={ResiduoFormatter}
      editorComponent={ResiduoEditor}
      {...props}
    />
  );
  const commitChanges = ({ added, changed, deleted }) => {
    let changedRows;

    if (added) {
      const startingAddedId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 0;
      changedRows = [
        ...rows,
        ...added.map((row, index) => ({
          id: startingAddedId + index,
          ...row,
        })),
      ];
    }
    if (changed) {
      let id = null;
      // updateTodo({ variables: {id, OBSERVACIONES: input.value } });
      changedRows = rows.map(row => {
        if (changed[row.id]) {
          id = row.id;
          return { ...row, ...changed[row.id] }
        } else {
          return row;
        }
      });

      if (id && changed[id]) {
        console.log(changed)
        const fields = Object.keys(changed[id]);
        const field = fields[0];
        /* SEND MUTATION AND UPDATE THE CACHE MANUALLY */
        let variables = {}
        variables.ID = id.toString();
        variables[field] = changed[id][field]
        console.log(variables)

        client.mutate({
          mutation: gql`
          mutation MyMutation($${field}: String = "", $ID: String = "") {
            updateRetirada(RETIRADA: {${field}: $${field}}, where: {ID: $ID}) {
              ID
              ${field}
            }
          }
          `,
          variables: variables,
          update: (cache, { data }) => {
            try {
              /* BECAUSE WE ARE UPDATING A DIFFERENT COLLECTION WE NEED TO UPDATE THE CACHE MANUALLY */
              let { getRetiradasView } = cache.readQuery({
                query: getRetiradas, variables: {
                  offset: 0,
                  limit: 10
                }
              });
              const retiradas = getRetiradasView.map((retirada) => {
                if (retirada.ID == data.updateRetirada.ID) {
                  retirada[field] = data.updateRetirada[field]
                  return retirada
                }
                return retirada
              })
              cache.writeQuery({
                query: getRetiradas,
                data: {
                  'getRetiradasView': retiradas
                }
              });
            } catch (e) {
              console.log(e)
              // We should always catch here,
              // as the cache may be empty or the query may fail
            }
          }
        })
      }
    }
    if (deleted) {
      const deletedSet = new Set(deleted);
      changedRows = rows.filter(row => !deletedSet.has(row.id));
    }
    setRows(changedRows);
  };
  if (!rows) {
    return "loading...";
  }
  return (
    <div>
      <div className="content">
        <Row>
          <Col xs={12} md={12}>

            <div className="page-title">
              <div className="float-left">
                <h1 className="title">Data Grid</h1>
              </div>
            </div>
            <div className="col-12">
              <section className="box ">
                <header className="panel_header">
                  <h2 className="title float-left">Data Grid - Edit Cell</h2>

                </header>
                <div className="content-body">
                  <div className="row">
                    <div className="col-lg-12">
                      <Grid
                        rows={rows}
                        columns={columns}
                        getRowId={getRowId}
                      >
                        <BooleanTypeProvider for={booleanColumns} />
                        <ResiduoTypeProvider for={residuoColumns} />
                        <FilteringState defaultFilters={[]} />

                        <EditingState
                          onCommitChanges={commitChanges}
                        />
                        <IntegratedFiltering />
                        <PagingState
                          defaultCurrentPage={0}
                          defaultPageSize={5}
                        />
                        <IntegratedPaging />
                        <Table />
                        <TableHeaderRow />
                        <TableInlineCellEditing />
                        <TableEditColumn
                          showAddCommand
                          showEditCommand
                          showDeleteCommand
                          messages={editColumnMessages}
                        />
                        <PopupEditing popupComponent={Popup} />

                        <TableFilterRow
                          messages={filterRowMessages}
                        />
                        <PagingPanel
                          pageSizes={[10, 25, 50]}
                        />
                      </Grid>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
