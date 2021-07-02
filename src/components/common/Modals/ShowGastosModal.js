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

// graphql
import { client, insertGastosResiduoOcasional } from "../../graphql";

// context
import {
  GlobalDispatchContext,
  GlobalStateContext,
} from "../../../context/GlobalContext";

const ShowGastosModal = ({ showGastosModal, toggle, retirada }) => {
  const dispatch = useContext(GlobalDispatchContext);
  const { newGastosResiduo } = useContext(GlobalStateContext);
  const [costePortes, setCostePortes] = useState(retirada.COSTE_PORTES);
  const [costeTratamiento, setCosteTratamiento] = useState(
    retirada.COSTE_TRATAMIENTO
  );
  const [costeAbono, setCosteAbono] = useState(retirada.ABONO);
  const [totalTratamiento, setTotalTratamiento] = useState();
  const [totalAbono, setTotalAbono] = useState();

  const calculoCoste = (cantidad) => {
    const calculo =
      retirada.CANTIDAD !== ""
        ? cantidad * parseFloat(retirada.CANTIDAD)
        : cantidad * 0;
    return calculo.toFixed(2);
  };

  const onChangeCostePortes = (e) => {
    setCostePortes(e.target.value);
    retirada.COSTE_PORTES = e.target.value;
  };

  const onChangeCosteTratamiento = (e) => {
    setCosteTratamiento(e.target.value);
    retirada.COSTE_TRATAMIENTO = e.target.value;
  };

  const onChangeCosteAbono = (e) => {
    setCosteAbono(e.target.value);
    retirada.ABONO = e.target.value;
  };

  const calculoTotal = () => {
    return (
      parseFloat(costePortes) +
      parseFloat(totalTratamiento) -
      parseFloat(totalAbono)
    );
  };

  const setQueryString = () => {
    const total = calculoTotal();
    return JSON.stringify({
      retirada_id: retirada.ID,
      coste_portes: costePortes,
      coste_tratamiento: costeTratamiento,
      total_tratamiento: totalTratamiento,
      coste_abono: costeAbono,
      total_abono: totalAbono,
      total: total.toFixed(2),
    });
  };

  const onClickModificar = () => {
    client
      .mutate({
        mutation: insertGastosResiduoOcasional,
        variables: {
          fields: JSON.parse(setQueryString()),
        },
      })
      .then((res) => {
        const gastosOcasionales =
          res.data.insert_gastosResiduoOcasionales.returning[0];
        dispatch({
          type: "SET_NEW_GASTOS_RESIDUO",
          payload: {
            newGastosResiduo: [...newGastosResiduo, gastosOcasionales],
          },
        });
      });
    toggle();
  };

  useEffect(() => {
    setTotalTratamiento(calculoCoste(retirada.COSTE_TRATAMIENTO));
    setTotalAbono(calculoCoste(retirada.ABONO));
  }, [retirada.COSTE_TRATAMIENTO, retirada.ABONO]);

  return (
    <Modal isOpen={showGastosModal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Desglose Gastos</ModalHeader>
      <ModalBody>
        {retirada ? (
          <Form>
            <FormGroup row>
              <Label for="coste_portes" sm={6}>
                COSTE PORTES{" "}
              </Label>
              <Col sm={6}>
                <Input
                  sm={4}
                  type="number"
                  name="coste_portes"
                  id="coste_portes"
                  value={retirada.COSTE_PORTES}
                  onChange={onChangeCostePortes}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="coste_tratamiento" sm={6}>
                COSTE TRATAMIENTO{" "}
              </Label>
              <Col sm={6}>
                <Input
                  sm={4}
                  type="number"
                  name="coste_tratamiento"
                  id="coste_tratamiento"
                  value={retirada.COSTE_TRATAMIENTO}
                  onChange={onChangeCosteTratamiento}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="total_tratamiento" sm={6}>
                TOTAL TRATAMIENTO{" "}
              </Label>
              <Col sm={6}>
                <Input
                  sm={4}
                  type="number"
                  name="total_tratamiento"
                  id="total_tratamiento"
                  value={totalTratamiento}
                  disabled
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="coste_abono" sm={6}>
                COSTE ABONO{" "}
              </Label>
              <Col sm={6}>
                <Input
                  sm={4}
                  type="number"
                  name="coste_abono"
                  id="coste_abono"
                  value={retirada.ABONO}
                  onChange={onChangeCosteAbono}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="total_abono" sm={6}>
                TOTAL ABONO{" "}
              </Label>
              <Col sm={6}>
                <Input
                  sm={4}
                  type="number"
                  name="total_abono"
                  id="total_abono"
                  value={totalAbono}
                  disabled
                />
              </Col>
            </FormGroup>
          </Form>
        ) : (
          <></>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onClickModificar}>
          Modificar importes
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ShowGastosModal;
