import React, { useState, useEffect, useCallback, useContext } from 'react'
import { Col, Row, Form, FormGroup, Label, Input,  Button } from "reactstrap";
import Dropzone from "react-dropzone";

//graphql
import { client, getProvincias, getMunicipiosByProvincia, getCentros, insertVentaBricomart, getZonaByCentro, getZonaName, getDocumentPath, updateDocumentPath } from '../../../components/graphql';

// constants
import { API_INPRONET } from '../../../components/constants';

const FormularioNuevaVenta = () => {

    const [provincias, setProvincias] = useState();
    const [localidades, setLocalidades] = useState();
    const [centros, setCentros] = useState();
    const [datosForm, setDatosForm] = useState({});

      // ESTADOS PARA DOCUMENTOS
    const [fileNames, setFileNames] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [tipoDocumentos, setTipoDocumentos] = useState();
    const [uploadFiles, setUploadFiles] = useState([]);
    const [documentSavedId, setDocumentSavedId] = useState();

    const onDrop = useCallback((acceptedFiles) => {
        setNewFiles(newFiles.concat(acceptedFiles));
        let newFileNames = [];
        acceptedFiles.forEach((file) => {
          newFileNames.push({
            NOMBRE: file.name,
            RUTA: "",
            TIPO_DOCUMENTO_ID: "",
            IS_NEW: true,
          });
        });
        const files = fileNames.concat(newFileNames);
        setFileNames(files);
        setUploadFiles(acceptedFiles);
      });

    const changeType = (event) => {
    const selectedFiles = fileNames.map((fileName) => {
        if (fileName.NOMBRE === event.target.name) {
        fileName.TIPO_DOCUMENTO_ID = event.target.value;
        }
        return fileName;
    });
    setFileNames(selectedFiles);
    };

    const saveDocuments = async (files=[], fileNames=[]) => {
        console.log(files, fileNames)
      if(files.length>0 && fileNames.length>0) {
          let fileDataFiltered = []
            const filterred = fileNames.filter(file => {
              return files[0].name === file.NOMBRE
            })
            if(filterred.length>0) fileDataFiltered = filterred;

          const docData = new FormData();
          docData.append("accion", "subirDocumentoBricomart")
          docData.append("tipoName", "Bricomart Parte A")
          docData.append('documento', files[0])
                              
          const requestOptions = {
            method: 'POST',
            body: docData
          };

          const postDocument = await fetch(`${API_INPRONET}/core/controller/BricomartController.php`, requestOptions)
          const resPostDocument = await postDocument.text()
          const path = await documentPath(resPostDocument)    
          return path
      }
    }

    const quitarDocumento = (name) => {
    setNewFiles(newFiles.filter((item) => item.name !== name.NOMBRE));
    setFileNames(fileNames.filter((item) => item !== name));
    };

    const onChangeNif = (e) => {
        setDatosForm({...datosForm, nif: e.target.value})
    }

    const onChangeFullName = (e) => {
        setDatosForm({...datosForm, nombre: e.target.value})
    }

    const onChangeRazonSocial = (e) => {
        setDatosForm({...datosForm, razon_social: e.target.value})
    }

    const onChangeTipoVia = (e) => {
        setDatosForm({...datosForm, tipo_via: e.target.value})
    }

    const onChangeNombreVia = (e) => {
        setDatosForm({...datosForm, nombre_via: e.target.value})
    }

    const onChangeNumero = (e) => {
        setDatosForm({...datosForm, numero: e.target.value})
    }

    const onChangePiso = (e) => {
        setDatosForm({...datosForm, piso: e.target.value})
    }

    const onChangePuerta = (e) => {
        setDatosForm({...datosForm, puerta: e.target.value})
    }

    const onChangeCodigoPostal = (e) => {
        setDatosForm({...datosForm, codigo_postal: e.target.value})
    }

    const onChangeNumeroSerie = (e) => {
        setDatosForm({...datosForm, numero_serie: e.target.value})
    }

    const onChangeCantidad = (e) => {
        setDatosForm({...datosForm, cantidad: e.target.value})
    }

    const onChangeFechaVenta = (e) => {
        setDatosForm({...datosForm, fecha_venta: e.target.value})
    }

     const fetchProvincias = useCallback(() => {
        client
            .query({
                query: getProvincias,
            })
            .then(res => {
                setProvincias(res.data.getProvincia)
            })
    }, [client, getProvincias])

    const onChangeProvincia = (e) => {
        setDatosForm({...datosForm, provincia: e.target.options[e.target.selectedIndex].text})
        if(e.target.value) {
            fetchLocalidades(e.target.value)
        }

    };
    
    const fetchLocalidades = useCallback((e) => {
        client
            .query({
                query: getMunicipiosByProvincia ,
                variables: {
                    provinciaId: e,
                }
            })
            .then(res => {
                setLocalidades(res.data.getMunicipio)
            })
    }, [client,getMunicipiosByProvincia])

    const onChangeMunicipio = (e) => {
        setDatosForm({...datosForm, localidad: e.target.options[e.target.selectedIndex].text})
    };

    const fetchCentros = () => {
        client
            .query({
                query: getCentros
            })
            .then(res => {
                setCentros(res.data.getCentroProductor)
            })
    }

    const fetchZona = (centro) => {
        client
            .query({
                query: getZonaByCentro,
                variables: {
                    centroId: centro
                }
            })
            .then(res => {
                console.log(res.data.getCentroProductor[0])
                fetchZonaName(res.data.getCentroProductor[0].ZONA_ID)
            })
    }

    const fetchZonaName = (id) => {
        client
            .query({
                query: getZonaName,
                variables: {
                    zonaId: id.toString()
                }
            })
            .then(res => {
                console.log(res.data.getZona[0].nombre)
                setDatosForm({...datosForm, zona: res.data.getZona[0].nombre})
            })
    }

    const onChangeCentro = (e) => {
        fetchZona(e.target.value)
        setDatosForm({...datosForm, centro_id: e.target.value, centro: e.target.options[e.target.selectedIndex].text})
    }

    const setMutationString = () => {
        return JSON.stringify(datosForm);
    }

    const onSubmitForm = async (e) => {
        e.preventDefault();
        let ventaId;
        console.log(setMutationString())
        await client
                .mutate({
                    mutation: insertVentaBricomart,
                    variables: {
                        fields: JSON.parse(setMutationString())
                    }
                })
                .then(res => {
                    console.log(res)
                    ventaId = res.data.insert_ventas_bricomart.returning[0].id
                })
        const path = await saveDocuments(newFiles, fileNames)
        console.log(path)
        updateRutaVentaDocumento(ventaId, path)

    }

    const documentPath = (id) => {
        return client
                .query({
                    query: getDocumentPath,
                    variables: {
                        documentId: id
                    }
                })
                .then(res => {
                    console.log(res)
                    return res.data.getDocumento[0].RUTA
                })
    }

    const updateRutaVentaDocumento = (ventaId, documentPath) => {
        console.log(ventaId, documentPath)
        client
            .mutate({
                mutation: updateDocumentPath,
                variables: {
                    ventaId: ventaId,
                    documentPath: documentPath
                }
            })
            .then(res => {
                console.log(res)
            })
    }

     useEffect(() => {
        fetchProvincias()
        fetchCentros()
    }, [])

    return (
        <div>
            <div className="content">
                <section className="box">
                    <div className= "content-body">
                        <h2>Registro Nueva Venta</h2>
                        <Form onSubmit={onSubmitForm}>
                            <Row form>
                                <Col md={5}>
                                    <FormGroup>
                                        <Label>NIF/NIE</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeNif}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={7}>
                                    <FormGroup>
                                        <Label>Nombre y apellidos</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeFullName}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={12}>
                                    <FormGroup>
                                        <Label>Razón Social</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeRazonSocial}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Tipo de Vía</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeTipoVia}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>Nombre Vía</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeNombreVia}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={1}>
                                    <FormGroup>
                                        <Label>Número</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeNumero}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={1}>
                                    <FormGroup>
                                        <Label>Piso</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangePiso}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={1}>
                                    <FormGroup>
                                        <Label>Puerta</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangePuerta}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={2}>
                                    <FormGroup>
                                        <Label>Código Postal</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeCodigoPostal}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Provincia</Label>
                                        <Input
                                        type="select"
                                        onChange= {onChangeProvincia}
                                        >
                                        {provincias && provincias.map(provincia=>{ 
                                            return (
                                            <option key={provincia.ID} value={provincia.ID} >{provincia.NOMBRE}</option>
                                            )
                                        })}
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Localidad</Label>
                                        <Input
                                        type="select"
                                        onChange={onChangeMunicipio}
                                        >
                                        {localidades && localidades.map(localidad=>{ 
                                            return (
                                            <option key={localidad.ID} value={localidad.ID} >{localidad.NOMBRE}</option>
                                            )
                                        })}
                                        </Input>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Marca</Label>
                                        <Input
                                        type="select"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Marca Seleccionada</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Modelo</Label>
                                        <Input
                                        type="select"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Modelo Seleccionado</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Referencia</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Número de Serie</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeNumeroSerie}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Cantidad</Label>
                                        <Input
                                        type="number"
                                        onChange={onChangeCantidad}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Tipo Gas</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Fecha Venta</Label>
                                        <Input
                                        type="date"
                                        placeholder="date placeholder"
                                        onChange={onChangeFechaVenta}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>Tienda</Label>
                                        <Input
                                        type="select"
                                        onChange={onChangeCentro}
                                        >
                                            {centros && centros.map(centro=>{ 
                                                return (
                                                <option key={centro.ID} value={centro.ID} >{centro.DENOMINACION}</option>
                                                )
                                            })}
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                <Label>Añadir documento:</Label>
                                <Dropzone onDrop={onDrop}>
                                    {({
                                        getRootProps,
                                        getInputProps,
                                        isDragActive,
                                        isDragAccept,
                                        isDragReject,
                                    }) => {
                                        const additionalClass = isDragAccept
                                        ? "accept"
                                        : isDragReject
                                        ? "reject"
                                        : "";

                                        return (
                                        <div
                                            {...getRootProps({
                                            className: `dropzone ${additionalClass}`,
                                            })}
                                        >
                                            <input {...getInputProps()} />
                                            <span>{isDragActive ? "📂" : "📁"}</span>
                                        </div>
                                        );
                                    }}
                                </Dropzone>
                                    <div>
                                    {fileNames.length > 0 ? <strong>Documentos:</strong> : <></>}
                                    <ul>
                                        {fileNames.map((fileName) => (
                                        <li key={fileName.NOMBRE}>
                                            <span className="filename-list">{fileName.NOMBRE}</span>
                                            {/* {fileName.IS_NEW ? (
                                            <select
                                                name={fileName.NOMBRE}
                                                value={fileName.TIPO_DOCUMENTO_ID}
                                                style={{ width: "280px" }}
                                                onChange={changeType}
                                            >
                                                {tipoDocumentos.map(({ ID, nombre }) => (
                                                <option key={ID} value={ID}>
                                                    {nombre}
                                                </option>
                                                ))}
                                            </select>
                                            ) : (
                                            <button>{fileName.TIPO_DOCUMENTO[0].NOMBRE}</button>
                                            )} */}
                                            {fileName.IS_NEW && (
                                            <span
                                                className="delete-document"
                                                onClick={() => quitarDocumento(fileName)}
                                            >
                                                <Button color="danger">Eliminar</Button>
                                            </span>
                                            )}
                                        </li>
                                        ))}
                                    </ul>
                                    </div>
                                </Col>
                            </Row>
                            <Row form> 
                                <Col md={2}>
                                    <Button color="primary" type="submit">
                                            Guardar 
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default FormularioNuevaVenta
