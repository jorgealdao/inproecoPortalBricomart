import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const VentaSuccessModal = ({ ventaSuccess, toggle, redirectToVentas }) => {
  return (
    <Modal isOpen={ventaSuccess} toggle={toggle}>
      <ModalHeader toggle={toggle}>Venta</ModalHeader>
      <ModalBody>La venta se ha generado con éxito.</ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={redirectToVentas}>
          Volver a ventas
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default VentaSuccessModal;
