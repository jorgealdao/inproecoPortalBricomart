import React, { useState, useEffect, useCallback, useContext } from 'react'
import { Col, Row, Form, FormGroup, Label, Input,  Button } from "reactstrap";
import Dropzone from "react-dropzone";
import moment from "moment";

//graphql
import { client, getProvincias, getMunicipiosByProvincia, getCentros, insertVentaBricomart, getZonaByCentro, getZonaName, getDocumentPath, updateDocumentPath } from '../../../components/graphql';

// constants
import { API_INPRONET } from '../../../components/constants';

// components
import VentaSuccessModal from '../../../components/common/Modals/VentaSuccessModal';
import VentaErrorDocumentoModal from '../../../components/common/Modals/VentaErrorDocumentoModal';

const FormularioNuevaVenta = ({history}) => {

    const [provincias, setProvincias] = useState();
    const [localidades, setLocalidades] = useState();
    const [centros, setCentros] = useState();
    const [datosForm, setDatosForm] = useState({estado_id: 2});
    const [nifInvalido, setNifInvalido] = useState();

      // ESTADOS PARA DOCUMENTOS
    const [fileNames, setFileNames] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [uploadFiles, setUploadFiles] = useState([]);

    // MODALES
    const [ventaSuccess, setVentaSuccess] = useState(false);
    const [ventaErrorDocument, setVentaErrorDocument] = useState(false)

    const toggleVentaSuccess = () => {
        setVentaSuccess(!ventaSuccess)
    }

    const toggleVentaErrorDocument = () => {
        setVentaErrorDocument(!ventaErrorDocument)
    }

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

    const saveDocuments = async (files=[], fileNames=[]) => {
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
          return resPostDocument
      }
    }

    const quitarDocumento = (name) => {
    setNewFiles(newFiles.filter((item) => item.name !== name.NOMBRE));
    setFileNames(fileNames.filter((item) => item !== name));
    };

    const onChangeNif = (e) => {
        console.log(e.target.value);
        let cif = e.target.value   
        let DNI_REGEX = /^(\d{8})([A-Z])$/;
        let CIF_REGEX = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/;
        
        cif = cif.toUpperCase();
        if ( cif.match( DNI_REGEX ) ) {
            console.log('hola');
            setNifInvalido(false);
            setDatosForm({...datosForm, nif: e.target.value})
        let numero, lett, letra;
        let expresion_regular_dni = /^[XYZ]?\d{5,8}[A-Z]$/;
        
            if(expresion_regular_dni.test(cif) === true){
                numero = cif.substr(0,cif.length-1);
                numero = numero.replace('X', 0);
                numero = numero.replace('Y', 1);
                numero = numero.replace('Z', 2);
                lett = cif.substr(cif.length-1, 1);
                numero = numero % 23;
                letra = 'TRWAGMYFPDXBNJZSQVHLCKET';
                letra = letra.substring(numero, numero+1);
                if (letra != lett) {
                    //Dni erroneo, la letra del NIF no se corresponde
                    return false;
                    
                }else{
                    //Dni correcto
                    console.log(e.target.value);
                    setDatosForm({...datosForm, nif: e.target.value})
                    return true;
                }

            }else{
                //Dni erroneo, formato no válido
                return false;
            }
        }
        else if ( cif.match( CIF_REGEX )) {     
            let temp = cif
            if (!/^[A-Za-z0-9]{9}$/.test(temp)){
                
                return false
            }  else if (!/^[ABCDEFGHKLMNPQS]/.test(temp)){   
                return false
            } 
            else{
                setNifInvalido(false)
                setDatosForm({...datosForm, nif: e.target.value})
                return true;
            } 
        } 
        else if (cif == ''){

            setNifInvalido(false)

        } else{
            console.log('adios');
            setNifInvalido(true)
            return false
        }
    }

    const onChangeFullName = (e) => {
        setDatosForm({...datosForm, nombre: e.target.value})
    }

    const onChangeApellido1 = (e) => {
        setDatosForm({...datosForm, apellido1: e.target.value})
    }

    const onChangeApellido2 = (e) => {
        setDatosForm({...datosForm, apellido2: e.target.value})
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
        const dateFormatted = moment(e.target.value).format("DD/MM/YYYY");
        setDatosForm({...datosForm, fecha_venta: dateFormatted});
    }

    const onChangeMarca = (e) => {
        setDatosForm({...datosForm, marca: e.target.value})
    }

    const onChangeModelo = (e) => {
        setDatosForm({...datosForm, modelo: e.target.value})
    }

    const onChangeReferencia = (e) => {
        setDatosForm({...datosForm, referencia: e.target.value})
    }

    const onChangeTipoGas = (e) => {
        setDatosForm({...datosForm, tipo_gas: e.target.value})
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

    /* const fetchZona = (centro) => {
        client
            .query({
                query: getZonaByCentro,
                variables: {
                    centroId: centro
                }
            })
            .then(res => {
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
                setDatosForm({...datosForm, zona_id: id.toString(), zona: res.data.getZona[0].nombre})
            })
    } */

    const onChangeCentro = (e) => {
        console.log(e.target.value, e.target.options[e.target.selectedIndex].text)
        setDatosForm({...datosForm, centro_id: e.target.value, centro: e.target.options[e.target.selectedIndex].text})
        //fetchZona(e.target.value)
    }

    const setMutationString = () => {
        return JSON.stringify(datosForm);
    }

    const onSubmitForm = async (e) => {
        e.preventDefault();
        console.log(datosForm)
        let ventaId;
        const documentId = await saveDocuments(newFiles, fileNames)
        if(!documentId) {
            toggleVentaErrorDocument()
            return
        }
        await client
                .mutate({
                    mutation: insertVentaBricomart,
                    variables: {
                        fields: JSON.parse(setMutationString())
                    }
                })
                .then(res => {
                    ventaId = res.data.insert_ventas_bricomart.returning[0].id
                })        
        const path = await documentPath(documentId)
        const isUpdated = await updateRutaVentaDocumento(ventaId, path)
        if(isUpdated === 1) toggleVentaSuccess()
    }

    const documentPath = async (id) => {
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

    const updateRutaVentaDocumento = async (ventaId, documentPath) => {
        return client
                .mutate({
                    mutation: updateDocumentPath,
                    variables: {
                        ventaId: ventaId,
                        documentPath: documentPath
                    }
                })
                .then(res => {
                    return res.data.update_ventas_bricomart.affected_rows
                })
    }

    const redirectToVentas = () => {
        history.push("/crm/registro-ventas");
      };

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
                                <Col md={2}>
                                    <FormGroup>
                                        <Label>NIF/NIE</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeNif}
                                        />
                                        {nifInvalido ? (
                                                    <div>Introduzca un número de identificación válido</div>
                                                ) : (<></>)
                                            }
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>Nombre</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeFullName}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Apellido 1</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeApellido1}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Apellido 2</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeApellido2}
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
                                            <option disabled selected defaultValue> -- Seleccionar -- </option>
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
                                            <option disabled selected defaultValue> -- Seleccionar -- </option>
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
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Marca</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeMarca}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Modelo</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeModelo}
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
                                        onChange={onChangeReferencia}
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
                                        onChange={onChangeTipoGas}
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
                                            <option disabled selected defaultValue> -- Seleccionar -- </option>
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
                                    {nifInvalido ? (
                                        <Button type="submit" disabled>
                                                Guardar 
                                        </Button>
                                        ) : (
                                        <Button color="primary" type="submit">
                                            Guardar 
                                        </Button>)
                                    }
                                 </Col>
                            </Row>
                        </Form>
                    </div>
                </section>
            </div>
            {/* MODALES */}
            {ventaSuccess ? (
                    <VentaSuccessModal ventaSuccess={ventaSuccess} toggle={toggleVentaSuccess} redirectToVentas={redirectToVentas} />
                ) : (<></>)
            }
            {ventaErrorDocument ? (
                    <VentaErrorDocumentoModal ventaErrorDocument={ventaErrorDocument} toggle={toggleVentaErrorDocument} />
                ) : (<></>)
            }
        </div>
    )
}

export default FormularioNuevaVenta
