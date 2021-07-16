import React, { useContext } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormText,
} from "reactstrap";

//context
import { GlobalStateContext } from "../../../context/GlobalContext";

//graphql
import { client, deleteVentaById } from "../../../components/graphql";

const DeleteVentaModal = ({ deleteVentaModal, toggle, row, history }) => {
  const { loadVentas } = useContext(GlobalStateContext);
  const deleteVenta = () => {
    let ventaID = row;
    console.log(ventaID);
    client
      .mutate({
        mutation: deleteVentaById,
        variables: {
          ventaId: ventaID,
        },
      })
      .then((res) => {
        console.log(res);
        if (res.data.delete_ventas_bricomart.affected_rows === 1) {
          toggle();
          loadVentas();
        }
      });
  };

  return (
    <Modal isOpen={deleteVentaModal} toggle={toggle}>
      <ModalHeader>Eliminar Venta</ModalHeader>
      <ModalBody>
        <p>
          ¿Está usted seguro que desea{" "}
          <span style={{ color: "red", fontWeight: "bold" }}>Eliminar</span>{" "}
          esta venta?
        </p>
      </ModalBody>
      <ModalFooter>
        <Button style={{ backgroundColor: "red" }} onClick={deleteVenta}>
          Eliminar
        </Button>
        <Button onClick={toggle}>Cerrar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteVentaModal;
