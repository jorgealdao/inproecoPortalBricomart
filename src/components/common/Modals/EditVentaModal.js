import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Col,
  Row,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import Dropzone from "react-dropzone";
import moment from "moment";

//graphql
import {
  client,
  getProvincias,
  getMunicipiosByProvincia,
  getCentros,
  getZonaByCentro,
  getZonaName,
  getDocumentPath,
  updateDocumentsPath,
  updateVentaById,
} from "../../../components/graphql";

// constants
import { API_INPRONET } from "../../../components/constants";

//context
import { GlobalStateContext } from "../../../context/GlobalContext";

// components
import VentaErrorDocumentoModal from "../../../components/common/Modals/VentaErrorDocumentoModal";

const EditVentaModal = ({ editVentaModal, toggle, row }) => {
  const { loadVentas } = useContext(GlobalStateContext);

  const [provincias, setProvincias] = useState();
  const [localidades, setLocalidades] = useState();
  const [centros, setCentros] = useState();
  const [datosForm, setDatosForm] = useState(row);
  const [nifInvalido, setNifInvalido] = useState();
  const [dateToShow, setdateToShow] = useState(
    row.fecha_venta ? row.fecha_venta.split("/").reverse().join("-") : null
  );

  // MODALES
  const [ventaErrorDocument, setVentaErrorDocument] = useState(false);

  const toggleVentaErrorDocument = () => {
    setVentaErrorDocument(!ventaErrorDocument);
  };

  // ESTADOS PARA DOCUMENTOS - B para el Parte B
  const [fileNames, setFileNames] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [fileNamesB, setFileNamesB] = useState([]);
  const [newFilesB, setNewFilesB] = useState([]);
  const [uploadFilesB, setUploadFilesB] = useState([]);

  const onDropB = useCallback((acceptedFiles) => {
    setNewFilesB(newFilesB.concat(acceptedFiles));
    let newFileNames = [];
    acceptedFiles.forEach((file) => {
      newFileNames.push({
        NOMBRE: file.name,
        RUTA: "",
        TIPO_DOCUMENTO_ID: "",
        IS_NEW: true,
      });
    });
    const files = fileNamesB.concat(newFileNames);
    setFileNamesB(files);
    setUploadFilesB(acceptedFiles);
  });

  const saveDocuments = async (files = [], fileNames = [], tipoName) => {
    if (files.length > 0 && fileNames.length > 0) {
      let fileDataFiltered = [];
      const filterred = fileNames.filter((file) => {
        return files[0].name === file.NOMBRE;
      });
      if (filterred.length > 0) fileDataFiltered = filterred;

      const docData = new FormData();
      docData.append("accion", "subirDocumentoBricomart");
      docData.append("tipoName", tipoName);
      docData.append("documento", files[0]);

      const requestOptions = {
        method: "POST",
        body: docData,
      };

      const postDocument = await fetch(
        `${API_INPRONET}/core/controller/BricomartController.php`,
        requestOptions
      );
      const resPostDocument = await postDocument.text();
      return resPostDocument;
    }
  };

  const quitarDocumentoB = (name) => {
    setNewFilesB(newFilesB.filter((item) => item.name !== name.NOMBRE));
    setFileNamesB(fileNamesB.filter((item) => item !== name));
  };

  // COGER VALORES INPUTS
  const onChangeNif = (e) => {
    setDatosForm({ ...datosForm, nif: e.target.value });
    let cif = e.target.value;
    let validChars = "TRWAGMYFPDXBNJZSQVHLCKET";
    let nifRexp = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKET]{1}$/i;
    let nieRexp = /^[XYZ]{1}[0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKET]{1}$/i;
    let str = cif.toString().toUpperCase();

    if (!nifRexp.test(str) && !nieRexp.test(str)) {
      setNifInvalido(true);
    }

    let nie = str
      .replace(/^[X]/, "0")
      .replace(/^[Y]/, "1")
      .replace(/^[Z]/, "2");

    let letter = str.substr(-1);
    let charIndex = parseInt(nie.substr(0, 8)) % 23;

    if (validChars.charAt(charIndex) === letter || cif === "") {
      setNifInvalido(false);
      setDatosForm({ ...datosForm, nif: e.target.value });
    } else {
      setNifInvalido(true);
    }
  };

  const onChangeFullName = (e) => {
    setDatosForm({ ...datosForm, nombre: e.target.value });
  };

  const onChangeApellido1 = (e) => {
    setDatosForm({ ...datosForm, apellido1: e.target.value });
  };

  const onChangeApellido2 = (e) => {
    setDatosForm({ ...datosForm, apellido2: e.target.value });
  };

  const onChangeRazonSocial = (e) => {
    setDatosForm({ ...datosForm, razon_social: e.target.value });
  };

  const onChangeTipoVia = (e) => {
    setDatosForm({ ...datosForm, tipo_via: e.target.value });
  };

  const onChangeNombreVia = (e) => {
    setDatosForm({ ...datosForm, nombre_via: e.target.value });
  };

  const onChangeNumero = (e) => {
    setDatosForm({ ...datosForm, numero: e.target.value });
  };

  const onChangePiso = (e) => {
    setDatosForm({ ...datosForm, piso: e.target.value });
  };

  const onChangePuerta = (e) => {
    setDatosForm({ ...datosForm, puerta: e.target.value });
  };

  const onChangeCodigoPostal = (e) => {
    setDatosForm({ ...datosForm, codigo_postal: e.target.value });
  };

  const onChangeNumeroSerie = (e) => {
    setDatosForm({ ...datosForm, numero_serie: e.target.value });
  };

  const onChangeCantidad = (e) => {
    setDatosForm({ ...datosForm, cantidad: e.target.value });
  };

  const onChangeFechaVenta = (e) => {
    setdateToShow(e.target.value);
    const dateFormatted = moment(e.target.value).format("DD/MM/YYYY");
    setDatosForm({ ...datosForm, fecha_venta: dateFormatted });
  };

  const onChangeMarca = (e) => {
    setDatosForm({ ...datosForm, marca: e.target.value });
  };

  const onChangeModelo = (e) => {
    setDatosForm({ ...datosForm, modelo: e.target.value });
  };

  const onChangeReferencia = (e) => {
    setDatosForm({ ...datosForm, referencia: e.target.value });
  };

  const onChangeTipoGas = (e) => {
    setDatosForm({ ...datosForm, tipo_gas: e.target.value });
  };

  const fetchProvincias = useCallback(() => {
    client
      .query({
        query: getProvincias,
      })
      .then((res) => {
        setProvincias(res.data.getProvincia);
      });
  }, [client, getProvincias]);

  const onChangeProvincia = (e) => {
    setDatosForm({
      ...datosForm,
      provincia: e.target.options[e.target.selectedIndex].text,
    });
    if (e.target.value) {
      fetchLocalidades(e.target.value);
    }
  };

  const fetchLocalidades = useCallback(
    (e) => {
      client
        .query({
          query: getMunicipiosByProvincia,
          variables: {
            provinciaId: e,
          },
        })
        .then((res) => {
          setLocalidades(res.data.getMunicipio);
        });
    },
    [client, getMunicipiosByProvincia]
  );

  const onChangeMunicipio = (e) => {
    setDatosForm({
      ...datosForm,
      localidad: e.target.options[e.target.selectedIndex].text,
    });
  };

  const fetchCentros = () => {
    client
      .query({
        query: getCentros,
      })
      .then((res) => {
        setCentros(res.data.getCentroProductor);
      });
  };

  const onChangeCentro = (e) => {
    setDatosForm({
      ...datosForm,
      centro_id: e.target.value,
      centro: e.target.options[e.target.selectedIndex].text,
    });
  };

  // FORMATEAR DATOS PARA ENVIAR
  const setMutationString = () => {
    let newObject = datosForm;
    delete newObject.estado_venta;
    delete newObject.estado;
    setDatosForm(newObject);
    return JSON.stringify(newObject);
  };

  const existsParteB = () => {
    return fileNamesB.length > 0;
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    console.log(JSON.parse(setMutationString()));
    let ventaId = row.id;
    await client
      .mutate({
        mutation: updateVentaById,
        variables: {
          ventaId: ventaId,
          _set: JSON.parse(setMutationString()),
        },
      })
      .then((res) => {
        console.log(res.data.update_ventas_bricomart.affected_rows);
        if (res.data.update_ventas_bricomart.affected_rows === 1) {
          toggle();
          loadVentas();
        }
      });
  };

  const documentPath = async (id) => {
    return client
      .query({
        query: getDocumentPath,
        variables: {
          documentId: id,
        },
      })
      .then((res) => {
        console.log(res);
        return res.data.getDocumento[0].RUTA;
      });
  };

  const updateRutaVentaDocumento = async (ventaId, parteA, parteB) => {
    return client
      .mutate({
        mutation: updateDocumentsPath,
        variables: {
          ventaId: ventaId,
          parteAPath: parteA,
          parteBPath: parteB,
        },
      })
      .then((res) => {
        return res.data.update_ventas_bricomart.affected_rows;
      });
  };

  useEffect(() => {
    if (datosForm.fecha_venta)
      setDatosForm({
        ...datosForm,
        fecha_venta: row.fecha_venta
          ? row.fecha_venta.split("/").reverse().join("-")
          : null,
      });
    fetchProvincias();
    fetchCentros();
  }, []);
  console.log(datosForm);
  return (
    <Modal isOpen={editVentaModal} toggle={toggle} size="xl">
      <ModalHeader>Editar Registro de Venta</ModalHeader>
      <ModalBody>
        <Form onSubmit={onSubmitForm}>
          <Row form>
            <Col md={2}>
              <FormGroup>
                <Label>NIF/NIE</Label>
                <Input
                  type="text"
                  onChange={onChangeNif}
                  value={datosForm.nif ? datosForm.nif : ""}
                />
                {nifInvalido ? (
                  <div>Introduzca un número de identificación válido</div>
                ) : (
                  <></>
                )}
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Nombre</Label>
                <Input
                  type="text"
                  onChange={onChangeFullName}
                  value={datosForm.nombre ? datosForm.nombre : ""}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label>Apellido 1</Label>
                <Input
                  type="text"
                  onChange={onChangeApellido1}
                  value={datosForm.apellido1 ? datosForm.apellido1 : ""}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label>Apellido 2</Label>
                <Input
                  type="text"
                  onChange={onChangeApellido2}
                  value={datosForm.apellido2 ? datosForm.apellido2 : ""}
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
                  value={datosForm.razon_social ? datosForm.razon_social : ""}
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
                  value={datosForm.tipo_via ? datosForm.tipo_via : ""}
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Nombre Vía</Label>
                <Input
                  type="text"
                  onChange={onChangeNombreVia}
                  value={datosForm.nombre_via ? datosForm.nombre_via : ""}
                />
              </FormGroup>
            </Col>
            <Col md={1}>
              <FormGroup>
                <Label>Número</Label>
                <Input
                  type="text"
                  onChange={onChangeNumero}
                  value={datosForm.numero ? datosForm.numero : ""}
                />
              </FormGroup>
            </Col>
            <Col md={1}>
              <FormGroup>
                <Label>Piso</Label>
                <Input
                  type="text"
                  onChange={onChangePiso}
                  value={datosForm.piso ? datosForm.piso : ""}
                />
              </FormGroup>
            </Col>
            <Col md={1}>
              <FormGroup>
                <Label>Puerta</Label>
                <Input
                  type="text"
                  onChange={onChangePuerta}
                  value={datosForm.puerta ? datosForm.puerta : ""}
                />
              </FormGroup>
            </Col>
            <Col md={2}>
              <FormGroup>
                <Label>Código Postal</Label>
                <Input
                  type="text"
                  onChange={onChangeCodigoPostal}
                  value={datosForm.codigo_postal ? datosForm.codigo_postal : ""}
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
                  onChange={onChangeProvincia}
                  value={datosForm.provincia ? datosForm.provincia : ""}
                >
                  <option disabled selected defaultValue>
                    {" "}
                    {datosForm.provincia}
                  </option>
                  {provincias &&
                    provincias.map((provincia) => {
                      return (
                        <option key={provincia.ID} value={provincia.ID}>
                          {provincia.NOMBRE}
                        </option>
                      );
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
                  value={datosForm.localidad ? datosForm.localidad : ""}
                >
                  <option disabled selected defaultValue>
                    {" "}
                    {datosForm.localidad}{" "}
                  </option>
                  {localidades &&
                    localidades.map((localidad) => {
                      return (
                        <option key={localidad.ID} value={localidad.ID}>
                          {localidad.NOMBRE}
                        </option>
                      );
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
                  value={datosForm.marca ? datosForm.marca : ""}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Modelo</Label>
                <Input
                  type="text"
                  onChange={onChangeModelo}
                  value={datosForm.modelo ? datosForm.modelo : ""}
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
                  value={datosForm.referencia ? datosForm.referencia : ""}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label>Nº de Serie</Label>
                <Input
                  type="text"
                  onChange={onChangeNumeroSerie}
                  value={datosForm.numero_serie ? datosForm.numero_serie : ""}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  onChange={onChangeCantidad}
                  value={datosForm.cantidad ? datosForm.cantidad : ""}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label>Tipo Gas</Label>
                <Input
                  type="text"
                  onChange={onChangeTipoGas}
                  value={datosForm.tipo_gas ? datosForm.tipo_gas : ""}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row form>
            <Col md={6}>
              <FormGroup>
                <Label>Fecha Venta</Label>
                <Input
                  type="date"
                  placeholder="date placeholder"
                  onChange={onChangeFechaVenta}
                  value={dateToShow ? dateToShow : ""}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Almacén</Label>
                <Input
                  type="select"
                  onChange={onChangeCentro}
                  value={datosForm.centro_id ? datosForm.centro_id : ""}
                >
                  <option disabled selected value={datosForm.centro_id}>
                    {datosForm.centro}
                  </option>
                  {centros &&
                    centros.map((centro) => {
                      return (
                        <option key={centro.ID} value={centro.ID}>
                          {centro.DENOMINACION}
                        </option>
                      );
                    })}
                </Input>
              </FormGroup>
            </Col>
          </Row>
          <Row form>
            <Col md={4}>
              <Label>Añadir parte B:</Label>
              <Dropzone onDrop={onDropB}>
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
                {fileNamesB.length > 0 ? <strong>Documentos:</strong> : <></>}
                <ul>
                  {fileNamesB.map((fileName) => (
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
                          onClick={() => quitarDocumentoB(fileName)}
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
                </Button>
              )}
            </Col>
          </Row>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button onClick={toggle} color="primary">
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditVentaModal;
