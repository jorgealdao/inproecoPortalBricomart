import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Input,
  Label,
  Form,
  FormGroup,
  Button,
} from "reactstrap";

// context
import {
  GlobalStateContext,
  GlobalDispatchContext,
} from "../../../context/GlobalContext";

// graphql
import { client, insertOtrosGastosOcasionales } from "../../graphql";

// constants
import { API_INPRONET } from "../../constants";

const AddOtrosGastosModal = ({ otrosGastosModal, toggle }) => {
  const [isTipoSelected, setIsTipoSelected] = useState(false);
  const [isAlquiler, setIsAlquiler] = useState();
  const [residuo, setResiduo] = useState();
  const [concepto, setConcepto] = useState();
  const [importe, setImporte] = useState();
  const [residuosDesplegable, setResiduosDesplegable] = useState();
  const {
    centroSelectedFactura,
    facturaCargada,
    gestorSelectedFactura,
    newOtrosGastos,
  } = useContext(GlobalStateContext);
  const dispatch = useContext(GlobalDispatchContext);

  const getResiduosByGestorAndCentro = async () => {
    const data = new FormData();
    data.append("accion", "getResiduosByCentroAndGestor");
    data.append("centroId", centroSelectedFactura);
    data.append("gestorId", gestorSelectedFactura);
    /* data.append("centroId", "43");
    data.append("gestorId", "16"); */

    const requestOptions = {
      method: "POST",
      body: data,
    };

    const getResiduos = await fetch(
      `${API_INPRONET}/core/controller/ResiduoController.php`,
      requestOptions
    );
    const resGetResiduos = await getResiduos.json();
    setResiduosDesplegable(resGetResiduos);
  };

  const ShowOptionsTipoGasto = () => {
    return (
      <>
        <option disabled selected value>
          Seleccionar
        </option>
        <option value="alquiler">Alquiler</option>
        <option value="otro">Otro gasto</option>
      </>
    );
  };

  const onChangeTipo = (e) => {
    setIsTipoSelected(true);
    if (e.target.value === "alquiler") setIsAlquiler(true);
    else setIsAlquiler(false);
  };

  const setQueryString = () => {
    const factura = facturaCargada.toString();
    let queryString;
    if (!isAlquiler) {
      queryString = JSON.stringify({
        /* centro_productor_id: "43",
        factura_id: "12231", */
        centro_productor_id: centroSelectedFactura,
        factura_id: factura,
        concepto,
        importe,
      });
    } else {
      queryString = JSON.stringify({
        /* centro_productor_id: "43",
        factura_id: "12231", */
        centro_productor_id: centroSelectedFactura,
        factura_id: factura,
        concepto: "Alquiler",
        residuo,
        importe,
      });
    }
    return queryString;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    client
      .mutate({
        mutation: insertOtrosGastosOcasionales,
        variables: {
          fields: JSON.parse(setQueryString()),
        },
      })
      .then((res) => {
        //console.log(res.data.insert_otrosGastosOcasionales.returning[0]);
        const gastosOcasionales =
          res.data.insert_otrosGastosOcasionales.returning[0];
        dispatch({
          type: "SET_NEW_OTROS_GASTOS",
          payload: {
            newOtrosGastos: [...newOtrosGastos, gastosOcasionales],
          },
        });
      });
    toggle();
  };

  useEffect(() => {
    getResiduosByGestorAndCentro();
  }, []);

  return (
    <Modal isOpen={otrosGastosModal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Añadir Gasto</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <Row>
            <Col sm={6} className="px-2">
              <FormGroup>
                <Label for="tipoGasto">Tipo de gasto</Label>
                <Input type="select" name="tipoGasto" onChange={onChangeTipo}>
                  <ShowOptionsTipoGasto />
                </Input>
              </FormGroup>
            </Col>
          </Row>
          {isTipoSelected ? (
            <Row>
              {isAlquiler ? (
                <Col sm={6} className="px-2">
                  <FormGroup>
                    <Label for="residuo">Residuo</Label>
                    <Input
                      type="select"
                      id="residuo"
                      name="residuo"
                      onChange={(e) => setResiduo(e.target.value)}
                    >
                      <option disabled selected value>
                        Seleccionar
                      </option>
                      {residuosDesplegable.map((residuo) => {
                        return (
                          <option key={residuo.RESIDUO} value={residuo.RESIDUO}>
                            {residuo.RESIDUO}
                          </option>
                        );
                      })}
                    </Input>
                  </FormGroup>
                </Col>
              ) : (
                <Col sm={6} className="px-2">
                  <FormGroup>
                    <Label for="concepto">Concepto</Label>
                    <Input
                      type="text"
                      id="concepto"
                      name="concepto"
                      onChange={(e) => setConcepto(e.target.value)}
                    />
                  </FormGroup>
                </Col>
              )}
              <Col sm={6} className="px-2">
                <FormGroup>
                  <Label for="importe">Importe</Label>
                  <Input
                    type="number"
                    id="importe"
                    name="importe"
                    onChange={(e) => {
                      setImporte(e.target.value);
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
          ) : (
            <></>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={toggle}>Cancelar</Button>
          <Button color="primary" type="submit">
            Añadir Gasto
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default AddOtrosGastosModal;
