import React, { useState, useCallback, useEffect } from 'react';
import Dropzone from 'react-dropzone'
import axios from 'axios';
import moment from 'moment';
import "./styles.css"
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
  Container, Row, Col, Label, FormGroup, Input,
} from 'reactstrap';
import {
  Plugin, Template, TemplateConnector, TemplatePlaceholder, Action
} from '@devexpress/dx-react-core';
import {
  TableRowDetail,
} from '@devexpress/dx-react-grid-bootstrap4';
import { client, getUsersList, getTotalCount,GET_TIPO_DOCUMENTOS, GET_RETIRADA_COLS,GET_ESTADOS, FILE_UPLOAD_MUTATION, GET_RETIRADA_DOCUMENTOS, GET_FACTURAS, GET_FACTURA_RETIRADA } from "../../../components/graphql";
import { gql } from "apollo-boost";

function FieldGroup({ id, label, ...props }) {
  return (
    <FormGroup>
      <Label>{label}</Label>
      <Input {...props} />
    </FormGroup>
  );
}
export const DetailContent = ({ row, ...rest }) => {

  //const [, updateState] = React.useState();

  useEffect(() => {
    console.log(row.OBSERVACIONES)
    setObservaciones(row.OBSERVACIONES);

  }, [])
  
  const {
    processValueChange,
    applyChanges,
    cancelChanges
  } = rest;

  console.log("ROW", row)

  //LAS OBSERVACIONES NO LLEGAN CON HTML, SOLO UN STRING CON EL COMENTARIO
  const [observaciones, setObservaciones] = useState(row.OBSERVACIONES);

  return (
    <Container>
      <Row>
        <Col>
        <span>Observaciones Anteriores</span>
          {/* <div dangerouslySetInnerHTML={{__html: `${observaciones}`}}/> */}
          <div>{observaciones}</div>

         {/*  <FieldGroup
            type="textarea"
            name="OBSERVACIONES_NEW"
            label="OBSERVACIONES"
            rows={4}
            onChange={processValueChange}
          /> */}

        </Col>
      </Row>
      <Row>
        {/* <Col>
          <div className="float-right">
            <Button onClick={()=>applyChanges(newFiles, fileNames)} color="primary">
              Guardar Cambios
            </Button>
            {' '}
            <Button onClick={cancelChanges}>
              Borrar Cambios
            </Button>
          </div>
        </Col> */}
      </Row>
    </Container>
  );
};

let editObservaciones = false;
let baseText = ""

export const DetailEditCell = () => {

  return (
    <Plugin name="detailEdit">
      <Action
        name="toggleDetailRowExpanded"
        action={( rowId , { expandedDetailRowIds }, { startEditRows, stopEditRows }) => {
          console.log("toogle", rowId)
          const rowIds = [rowId];
          const isCollapsing = expandedDetailRowIds.indexOf(rowId) > -1;
          if (isCollapsing) {
  
            stopEditRows({ rowIds });
            
            const index = expandedDetailRowIds.indexOf(rowId)
            expandedDetailRowIds.splice(index, 1);
          } else {
            //stopEditRows(expandedDetailRowIds);
  
            startEditRows({ rowIds });
          }
        }}
      />
      <Template
        name="tableCell"
        predicate={({ tableRow }) => tableRow.type === TableRowDetail.ROW_TYPE}
      >
        {params => (
          <TemplateConnector>
            {({
              tableColumns,
              createRowChange,
              rowChanges,
            }, {
              changeRow,
              commitChangedRows,
              cancelChangedRows,
              toggleDetailRowExpanded,
            }) => {
              if (tableColumns.indexOf(params.tableColumn) !== 0) {
                return null;
              }
              const { tableRow: { rowId } } = params;
              const row = { ...params.tableRow.row, ...rowChanges[rowId] };
              const processValueChange = ({ target: { name, value } }) => {
                console.log("change", name, value)
                if(name == "OBSERVACIONES_NEW") {
                  const now = moment().format('DD/MM/YYYY hh:mm')
                  let fullValue = ""
                  if(!editObservaciones) {
                    row.OBSERVACIONES = row.OBSERVACIONES == null ? "" : row.OBSERVACIONES 
                    baseText = row.OBSERVACIONES + now + " - AUTOMATICO - "
                  } 
                  fullValue = baseText + value
                  
                  const changeObservaciones = {
                    rowId,
                    change: createRowChange(row, fullValue, "OBSERVACIONES"),
                  };
                  changeRow(changeObservaciones);
                  editObservaciones = true
                  console.log("CHANGE OBSER", changeObservaciones)
                } 
                
                  const changeArgs = {
                    rowId,
                    change: createRowChange(row, value, name),
                  };
                  changeRow(changeArgs);
                            
              };
  
              const applyChanges = () => {
                console.log(rowId)
                toggleDetailRowExpanded({ rowId });
                commitChangedRows({ rowIds: [rowId] });
              };
              const cancelChanges = () => {
                console.log("cancel", rowId)
                toggleDetailRowExpanded( rowId );
                cancelChangedRows({ rowIds: [rowId] });
              };
  
              return (
                <TemplatePlaceholder params={{
                  ...params,
                  row,
                  tableRow: {
                    ...params.tableRow,
                    row,
                  },
                  changeRow,
                  processValueChange,
                  applyChanges,
                  cancelChanges,
                }}
                />
              );
            }}
          </TemplateConnector>
        )}
      </Template>
    </Plugin>
  );
}



export const DetailCell = ({
  children, changeRow, editingRowIds, addedRows, processValueChange,
  applyChanges, cancelChanges,
  ...restProps
}) => {
  const { row } = restProps;

  return (
    <TableRowDetail.Cell {...restProps}>
      {React.cloneElement(children, {
        row, changeRow, processValueChange, applyChanges, cancelChanges,
      })}
    </TableRowDetail.Cell>
  );
};