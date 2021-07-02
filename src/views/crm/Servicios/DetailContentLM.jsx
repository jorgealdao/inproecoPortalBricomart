import React, { useState, useCallback, useEffect, useContext } from 'react';
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
import { client, getUsersList, getTotalCount,GET_TIPO_DOCUMENTOS, GET_ESTADO_BY_ID, GET_CENTRO_PRODUCTOR_RESIDUO, GET_RETIRADA_COLS,GET_ESTADOS, FILE_UPLOAD_MUTATION, GET_RETIRADA_DOCUMENTOS, GET_FACTURAS, GET_FACTURAS_BY_NUMERO, GET_FACTURA_RETIRADA } from "../../../components/graphql";
import { API_INPRONET } from "../../../components/constants";
import { gql } from "apollo-boost";

import FormText from 'reactstrap/lib/FormText';

function FieldGroup({ id, label, ...props }) {
  return (
    <FormGroup>
      <Label>{label}</Label>
      <Input {...props} />
    </FormGroup>
  );
}

const Context = React.createContext({ factura: "", setFactura: () => {}});

export const DetailContent = ({ row, ...rest }) => {
  const [fileNames, setFileNames] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);

  const [newFiles, setNewFiles] = useState([]);
  const [, updateState] = React.useState();

  console.log(row)
  const fileUpload = (file, base64str) => {
    // make fetch api call to upload file
    const fileName = file.name;
    const fileType = file.type;
    const variables = { name: fileName, type: fileType, base64str: base64str };

    client.mutate({
      mutation: FILE_UPLOAD_MUTATION,
      variables: variables
    });
  }
  let documents = []
  const eliminarPendienteObservaciones = (idRetirada) => {
    const docData = new FormData();
    docData.append("accion", "eliminarPendienteObservaciones")
    docData.append("retiradaId", idRetirada)
                        
    const requestOptions = {
      method: 'POST',
      body: docData
    };
    fetch(`${API_INPRONET}/core/controller/RetiradaController.php`, requestOptions)
    .then(response => response.text())
    .then(res => console.log(res));

  }

  useEffect(() => {
    
    setObservaciones(row.OBSERVACIONES);
    
    if (row.PENDIENTE_REVISAR_OBSERVACIONES) {
      eliminarPendienteObservaciones(row.ID);
      row.PENDIENTE_REVISAR_OBSERVACIONES = false;
    }

    client.query({
      query: GET_RETIRADA_COLS,
      variables: {
        RETIRADA_ID: row.ID.toString(),
        CENTRO_PRODUCTOR: row.CENTRO_PRODUCTOR_ID.toString(),
        CENTRO_PRODUCTOR_RESIDUO_ID: row.CENTRO_PRODUCTOR_RESIDUO_ID.toString()
      },
      fetchPolicy: 'no-cache'
    }).then(async (res) => {
      setResiduos(res.data.getCentroProductorResiduo);
      setTransportistas(res.data.getCentroProductorResiduoTransportista);
      setGestores(res.data.getCentroProductorResiduoGestor);

      let documents = []
      for(const documento of res.data.getRetiradaDocumento) {
        console.log(documento)
        await client.query({ 
          query: GET_RETIRADA_DOCUMENTOS,
          variables: {
            DOCUMENTO_ID: documento.DOCUMENTO_ID.toString()
          }
        }).then((res) => {
          documents.push(res.data.getDocumento[0])
        })
      }
      // console.log("documents", documents)
      setFileNames(documents)     
      
    })
    client.query({
      query: GET_ESTADOS,
    }).then((res) => {
        
      let states = res.data.getEstadoRetirada;
      states.sort((a, b) => a.nombre.localeCompare(b.nombre))
      setEstados(states)
    })

    //QUERY PARA ASOCIAR FACTURA A LA RETIRADA EN CASO DE QUE TENGA
    /* client.query({
      query: GET_FACTURA_RETIRADA,
      fetchPolicy: 'no-cache',
      variables: {
        id: row.id.toString()
      }
    }).then((res) => {
      let facturaAsociada = res.data.getRetirada[0].numFactura;
      if(facturaAsociada !== null){
        row.FACTURA = facturaAsociada
      }
    }) */
    
    // client.query({
    //   query: GET_RESIDUOS_CENTRO,
    //   variables: {
    //     CENTRO_PRODUCTOR: row.CENTRO_PRODUCTOR_ID.toString()
    //   }
    // }).then((res) => {
        
    //   let states = res.data.getCentroProductorResiduo;
    //   states.sort((a, b) => a.nombre.localeCompare(b.nombre))
    //   setEstados(states)
    // })
    // client.query({
    //   query: GET_GESTOR,
    // }).then((res) => {
        
    //   let states = res.data.getEstadoRetirada;
    //   states.sort((a, b) => a.nombre.localeCompare(b.nombre))
    //   setEstados(states)
    // })
    client.query({
      query: GET_TIPO_DOCUMENTOS,
    }).then((res) => {
        //console.log("TIPOS", res.data)
      let tipos = res.data.getTipoDocumento;
      tipos.sort((a, b) => a.nombre.localeCompare(b.nombre))
      setTipoDocumentos(tipos)
    })
  }, [])

  const onDrop = useCallback(acceptedFiles => {
    setNewFiles(newFiles.concat(acceptedFiles))
    let newFileNames = []
    acceptedFiles.forEach((file)=> {
      newFileNames.push({
        "NOMBRE": file.name,
        "RUTA":"","TIPO_DOCUMENTO_ID":"", "IS_NEW": true })
    })
    const files = fileNames.concat(newFileNames)
    setFileNames(files);
    row['documents'] = files;
    setUploadFiles(acceptedFiles);
  })

  const changeType = (event)=> {

    const selectedFiles = fileNames.map((fileName)=> {
      if(fileName.NOMBRE === event.target.name) {
        fileName.TIPO_DOCUMENTO_ID = event.target.value
      }
      return fileName;
    })

    setFileNames(selectedFiles)
  }

  //QUERY PARA ASOCIAR FACTURA A LA RETIRADA EN CASO DE QUE TENGA
    client.query({
    query: GET_FACTURA_RETIRADA,
    fetchPolicy: 'no-cache',
    variables: {
      id: row.id.toString()
    }
  }).then((res) => {
    let facturaAsociada = res.data.getRetirada[0].numFactura;
    if(facturaAsociada !== null){
      //setFactura(facturaAsociada)
      row.FACTURA = facturaAsociada
    }
  })
  

  const {
    processValueChange,
    applyChanges,
    cancelChanges
  } = rest;
  // COLECCIONES PARA SELECTS
  const [residuos, setResiduos] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [gestores, setGestores] = useState([]);
  const [estados, setEstados] = useState([]);
  const [tipoDocumentos, setTipoDocumentos] = useState([]);
  const [invalidFactura, setInvalidFactura] = useState(false)
  //const [factura, setFactura] = useState(row.FACTURA)
  const [deleteModal, setDeleteModal] = useState(false)

  const [observaciones, setObservaciones] = useState(row.OBSERVACIONES);

  //FORMATEO DE FECHA PARA QUE COJA EL VALOR BIEN EL INPUT DE FECHA
  let formattedDate = row.FECHA_REALIZACION ? row.FECHA_REALIZACION.split("/").reverse().join("-") : null
  
  // MULTIQUERY PARA OBTENER TODO LO NECESARIO

  const quitarDocumento = (name) => {

      setNewFiles(newFiles.filter(item => item.name !== name.NOMBRE))
    //if (index !== -1) {
      setFileNames(fileNames.filter(item => item !== name));
    //}

  }

  //GUARDAR EL ID DEL DOCUMENTO PARA EL BORRADO
  const [documentoId, setDocumentoId] = useState()

  const toggleDeleteModal = () => {
    setDeleteModal(!deleteModal)
};

  const DeleteConfirmation = ({isOpen, toggle}) => {

    const deleteDocumento = async (e) => {
      e.preventDefault();
      var data = new FormData();
      data.append('accion', "eliminarDocumentoRetirada" );
      data.append('retiradaId', row.id );
      data.append('documentoId', documentoId );

      const requestOptions = {
          method: 'POST',
          body: data
      };

      await fetch(`${API_INPRONET}/core/controller/RetiradaController.php`, requestOptions)
      .then(response => response.text())
      .then(data => {
          console.log(data)
      });

      console.log(fileNames)
      const changedDocs = fileNames.filter(fila => {
        console.log(fila)
        return fila.ID !== documentoId
      })

      setFileNames(changedDocs)
      setDeleteModal(!deleteModal)     
    }

    return(
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Confirmación de borrado</ModalHeader>
            <ModalBody>
                ¿Seguro que desea eliminar el documento?
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={()=>setDeleteModal(!deleteModal)}>
                    Cancelar
                </Button>
                {' '}
                <Button color="primary" type="submit" onClick={deleteDocumento}>
                    Borrar
                </Button>
            </ModalFooter>
        </Modal>
    )
  }

  return (
    <Container>
      <Row>
       <Col sm={4} className="px-2">
          <Label>GESTOR</Label>
          <select
            className="form-control"
            style={{ width: '100%' }}
            name="GESTOR_ID"
            value={row.GESTOR_ID}
            onChange={processValueChange}
          >
            {gestores.map(({ GESTOR_ID, GESTOR }) => (
              <option key={GESTOR_ID} value={GESTOR_ID}>
                {GESTOR[0].NOMBRE}
              </option>
            ))}
          </select>
        </Col> 
        <Col sm={4} className="px-2">
          <Label>TRANSPORTISTA</Label>
          <select
            className="form-control"
            style={{ width: '100%' }}
            name="TRANSPORTISTA_ID"
            value={row.TRANSPORTISTA_ID}
            onChange={processValueChange}
          >
            {transportistas.map(({ TRANSPORTISTA_ID, TRANSPORTISTA }) => (
              <option key={TRANSPORTISTA_ID} value={TRANSPORTISTA_ID}>
                {TRANSPORTISTA[0].NOMBRE}
              </option>
            ))}
          </select>
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
            type="date"
            name="FECHA_REALIZACION"
            label="FECHA REALIZACION"
            value={formattedDate}
            onChange={processValueChange}
          />
        </Col>
        <Col sm={4} className="px-2">
          <Label>ESTADO</Label>
          <select
            className="form-control"
            style={{ width: '100%' }}
            name="ESTADO_RETIRADA_ID"
            value={row.ESTADO_RETIRADA_ID}
            onChange={processValueChange}
          >
            {estados.map(({ ID, nombre }) => (
              <option key={ID} value={ID}>
                {nombre}
              </option>
            ))}
          </select>
        </Col>
        <Col sm={4} className="px-2">
          <FieldGroup
            name="LER"
            label="LER"
            readOnly 
            value={row.LER}
            onChange={processValueChange}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={4} className="px-2">
          <Label>RESIDUO</Label>
          <select
            className="form-control"
            style={{ width: '100%' }}
            name="RESIDUO_ID"
            value={row.RESIDUO_ID}
            onChange={processValueChange}
          >
            {residuos.map(({ RESIDUO_ID, RESIDUO, ID }) => {
              return (
                <option key={RESIDUO_ID} value={RESIDUO_ID}>
                  {RESIDUO[0].NOMBRE}
                </option>
              )
            }
            )}
          </select>
        </Col>
        <Col sm={4} className="px-2">
          <FieldGroup
            name="FACTURA"
            label="FACTURA"
            value={row.FACTURA}
            onChange={processValueChange}
            onBlur={async (e) => {
              if(e.target.value === ""){
                setInvalidFactura(false)
              } else {
                const facturaQuery = await client.query({
                  query: GET_FACTURAS_BY_NUMERO,
                  fetchPolicy: 'no-cache',
                  variables: {
                    numFactura: e.target.value
                  }
                })
                const response = await facturaQuery;

                if(response.data.getFacturasView.length === 0){
                  //return
                  setInvalidFactura(true)
                } else {
                  console.log('there',response.data.getFacturasView)
                  setInvalidFactura(false)
                }
              }
            }}
          />
          {invalidFactura ? (<FormText color="danger">No existe ninguna factura con el número indicado</FormText>) : (<></>)}
        </Col>
      </Row>
      <Row>
        <Col>
        <span>Observaciones Anteriores</span>
        {observaciones === 'undefined' || observaciones === null ? (<></>) : (<div dangerouslySetInnerHTML={{__html: `${observaciones}`}}/>)}
          {/* <div dangerouslySetInnerHTML={{__html: `${observaciones}`}}/> */}

          <FieldGroup
            type="textarea"
            name="OBSERVACIONES_NEW"
            label="OBSERVACIONES"
            rows={4}
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
                {fileNames.map(fileName => {
                  return (
                  <li key={fileName.NOMBRE}>
                    <span><a href={`${API_INPRONET}/${fileName.RUTA}`} style={{padding: "20px"}}>{fileName.NOMBRE}</a></span>
                    {fileName.IS_NEW ? 
                    <select name={fileName.NOMBRE} value={fileName.TIPO_DOCUMENTO_ID} style={{width: "280px"}} onChange={changeType}>
                      {tipoDocumentos.map(({ ID, nombre }) => (
                        <option key={ID} value={ID}>
                          {nombre}
                        </option>
                      ))}
                      </select>
                    : 
                      <button>{fileName.TIPO_DOCUMENTO[0].NOMBRE}</button>
                    }
                   
                    {fileName.IS_NEW && (<span onClick={()=> quitarDocumento(fileName)}>Quitar</span>)}
                    <button onClick={(e)=>{
                      e.preventDefault()
                      toggleDeleteModal()
                      setDocumentoId(fileName.ID)
                    }}><i className="oi oi-trash"/></button>
                    <DeleteConfirmation isOpen={deleteModal} toggle={toggleDeleteModal} />
                  </li>
                )})}
              </ul>
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="float-right">
            <Button onClick={()=>applyChanges(newFiles, fileNames)} color="primary">
              Guardar Cambios
            </Button>
            {' '}
            <Button onClick={cancelChanges}>
              Borrar Cambios
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

let editObservaciones = false;
let baseText = ""

export const DetailEditCell = () => {
  //const {user} = useContext(AuthContext);
  const loggedUser = JSON.parse(sessionStorage.getItem("user"))
  const [newFactura, setNewFactura] = useState()
  const {factura} = useContext(Context);
  const {setFactura} = useContext(Context);

  return (
    <Plugin name="detailEdit">
      <Action
        name="toggleDetailRowExpanded"
        action={( rowId , { expandedDetailRowIds }, { startEditRows, stopEditRows }) => {
          //console.log("toogle", rowId)
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
                if(name === "FACTURA"){
                  setNewFactura(value)
                }

                /* if(name === "FECHA_REALIZACION"){
                  console.log(value)
                } */

                if(name === "RESIDUO_ID"){
                  //console.log(value)
                  client.query({
                    query: GET_CENTRO_PRODUCTOR_RESIDUO,
                    variables: {
                      centroId: row.CENTRO_PRODUCTOR_ID.toString(),
                      residuoId: value.toString()
                    }
                  }).then(res => {
                    const changeResiduo = {
                      rowId,
                      change: createRowChange(row, res.data.getCentroProductorResiduo[0].residuo[0].nombre, "RESIDUO")
                    }
                    const changeCentroProductorResiduo = {
                      rowId,
                      change: createRowChange(row,res.data.getCentroProductorResiduo[0].id, "CENTRO_PRODUCTOR_RESIDUO_ID")
                    }

                    changeRow(changeResiduo);
                    changeRow(changeCentroProductorResiduo);
                  })
                }

                if(name === "ESTADO_RETIRADA_ID"){
                  client.query({
                    query: GET_ESTADO_BY_ID,
                    variables: {
                      id: value.toString()
                    }
                  }).then(res => {
                    const changeEstadoName = {
                      rowId,
                      change: createRowChange(row, res.data.getEstadoRetirada[0].nombre, "ESTADO")
                    }
                    changeRow(changeEstadoName)
                  })
                }

                if(name == "OBSERVACIONES_NEW") {
                  const now = moment().format('DD/MM/YYYY hh:mm')
                  let fullValue = ""
                  if(!editObservaciones) {
                    row.OBSERVACIONES = row.OBSERVACIONES == null ? "" : row.OBSERVACIONES 
                    //baseText = row.OBSERVACIONES + now + " - AUTOMATICO - "
                    baseText = row.OBSERVACIONES + now + " - " + loggedUser.nickname + " - "
                  } 
                  fullValue = baseText + value
                  
                  const changeObservaciones = {
                    rowId,
                    change: createRowChange(row, fullValue, "OBSERVACIONES"),
                  };
                  changeRow(changeObservaciones);
                  editObservaciones = true
                  //console.log("CHANGE OBSER", changeObservaciones)
                } 
                
                  let changeArgs = {
                    rowId,
                    change: createRowChange(row, value, name),
                  };
                  changeRow(changeArgs);
                
                  // FORZAMOS EL REFRESCO DEL CAMPO FACTURA DEBIDO A UN BUG
                  if(name != "FACTURA"){
                    changeArgs = {
                      rowId,
                      change: createRowChange(row, row.FACTURA, "FACTURA"),
                    };
                    changeRow(changeArgs);  
                  }
              };
  
              const applyChanges = async (files=[], fileNames=[]) => {
                if(newFactura && newFactura !== ""){
                  const facturaQuery = await client.query({
                        query: GET_FACTURAS_BY_NUMERO,
                        fetchPolicy: 'no-cache',
                        variables: {
                            numFactura: newFactura
                        }
                    })
                  const response = await facturaQuery;

                  if(response.data.getFacturasView.length === 0){
                    return
                  }
                }

                if(files.length>0 && fileNames.length>0) {
  
                  files.forEach((doc) => {
                    console.log(doc)
                    let fileDataFiltered = []
                    // files.map(doc => {
                      //console.log("doc",doc)
                      const filterred = fileNames.filter(file => {
                        //console.log("file",file)
  
                        return doc.name === file.NOMBRE
                      })
                      //console.log("filterred",filterred)
  
                      if(filterred.length>0) fileDataFiltered = filterred;
                    // })
                    //console.log("fileDataFiltered", fileDataFiltered)
                    const docData = new FormData();
                    docData.append("accion", "adjuntarDocumentoRetirada")
                    docData.append("retiradaId", rowId)
                    docData.append("tipoId", fileDataFiltered[0].TIPO_DOCUMENTO_ID)
                    docData.append('documento', doc)
                                        
                    const requestOptions = {
                      method: 'POST',
                      body: docData
                    };
                    fetch(`${API_INPRONET}/core/controller/RetiradaController.php`, requestOptions)
                    .then(response => response.text())
                    .then(res => console.log(res));
                    //axios.post('http://52.16.77.109/inproecoweb2_0/core/controller/RetiradaController.php', docData)
              
                  })
                }
                //console.log(rowId)
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