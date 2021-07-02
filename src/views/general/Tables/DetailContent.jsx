import React, { useState, useCallback } from 'react';
import Dropzone from 'react-dropzone'
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
import { client, getUsersList, getTotalCount, GET_RESIDUOS, FILE_UPLOAD_MUTATION } from "../../../components/graphql";
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
  const [fileNames, setFileNames] = useState([]);

  const fileUpload = (file, base64str) => {
    console.log(file)
    // make fetch api call to upload file
    const fileName = file.name;
    const fileType = file.type;
    const variables = { name: fileName, type: fileType, base64str: base64str };

    client.mutate({
      mutation: FILE_UPLOAD_MUTATION,
      variables: variables
    });
  }
  const onDrop = useCallback(acceptedFiles => {

    setFileNames(acceptedFiles.map(file => file.name));
    for (let i = 0; i < acceptedFiles.length; i++) {

      const reader = new FileReader();
      if (acceptedFiles[i]) {
        reader.readAsBinaryString(acceptedFiles[i]);
      }
      reader.onload = function () {
        const base64str = btoa(reader.result);
        fileUpload(acceptedFiles[i], base64str);
      };
      reader.onerror = function () {
        console.log('Unable to parse file');
      };
      //e.preventDefault() // Stop form submit
    }
  }, [])
  const {
    processValueChange,
    applyChanges,
    cancelChanges,
  } = rest;
  const [residuos, setResiduos] = useState([]);

  client.query({
    query: GET_RESIDUOS,
    variables: {
      CENTRO_PRODUCTOR: row.CENTRO_PRODUCTOR_ID.toString()
    }
  }).then((res) => {
    setResiduos(res.data.getCentroProductorResiduo);

  })
  return (
    <Container>
      <Row>
        <Col sm={4} className="px-2">
          <FieldGroup
            name="CENTRO"
            label="Centro"
            value={row.CENTRO}
            onChange={processValueChange}
          />
        </Col>
        <Col sm={4} className="px-2">
          <FieldGroup
            name="CLIENTE"
            label="CLIENTE"
            value={row.CLIENTE}
            onChange={processValueChange}
          />
        </Col>
        <Col sm={4} className="px-2">
          <FieldGroup
            name="CANTIDAD"
            label="CANTIDAD"
            value={row.CANTIDAD}
            onChange={processValueChange}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={4} className="px-2">
          <FieldGroup
            name="TRANSPORTISTA"
            label="TRANSPORTISTA"
            value={row.TRANSPORTISTA}
            onChange={processValueChange}
          />
        </Col>
        <Col sm={4} className="px-2">
          <Label>Residuo</Label>
          <select
            className="form-control"
            style={{ width: '100%' }}
            name="RESIDUO_ID"
            value={row.RESIDUO_ID}
            onChange={processValueChange}
          >
            {residuos.map(({ RESIDUO_ID, RESIDUO }) => (
              <option key={RESIDUO_ID} value={RESIDUO_ID}>
                {RESIDUO[0].NOMBRE}
              </option>
            ))}
          </select>
        </Col>
        <Col sm={4} className="px-2">
          <FieldGroup
            type="date"
            name="FECHA_REALIZACION"
            label="FECHA REALIZACION"
            value={row.FECHA_REALIZACION}
            onChange={processValueChange}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <FieldGroup
            type="textarea"
            name="OBSERVACIONES"
            label="OBSERVACIONES"
            rows={4}
            value={row.OBSERVACIONES}
            onChange={processValueChange}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="App">
            <Dropzone
              onDrop={onDrop}

            >
              {({
                getRootProps,
                getInputProps,
                isDragActive,
                isDragAccept,
                isDragReject
              }) => {
                const additionalClass = isDragAccept
                  ? "accept"
                  : isDragReject
                    ? "reject"
                    : "";

                return (
                  <div
                    {...getRootProps({
                      className: `dropzone ${additionalClass}`
                    })}
                  >
                    <input {...getInputProps()} />
                    <span>{isDragActive ? "📂" : "📁"}</span>
                    <p>Suelta aquí los documentos o haz click para seleccionarlos.</p>
                  </div>
                );
              }}
            </Dropzone>
            <div>
              <strong>Documentos:</strong>
              <ul>
                {fileNames.map(fileName => (
                  <li key={fileName}>{fileName}</li>
                ))}
              </ul>
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="float-right">
            <Button onClick={applyChanges} color="primary">
              Guardar Cambios
            </Button>
            {' '}
            <Button onClick={cancelChanges}>
              Cancelar Cambios
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};


export const DetailEditCell = () => (
  <Plugin name="detailEdit">
    <Action
      name="toggleDetailRowExpanded"
      action={({ rowId }, { expandedDetailRowIds }, { startEditRows, stopEditRows }) => {
        const rowIds = [rowId];
        const isCollapsing = expandedDetailRowIds.indexOf(rowId) > -1;
        if (isCollapsing) {
          stopEditRows({ rowIds });
        } else {
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
              const changeArgs = {
                rowId,
                change: createRowChange(row, value, name),
              };
              changeRow(changeArgs);
            };

            const applyChanges = () => {
              toggleDetailRowExpanded({ rowId });
              commitChangedRows({ rowIds: [rowId] });
            };
            const cancelChanges = () => {
              console.log(rowId)
              toggleDetailRowExpanded({ rowId });
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