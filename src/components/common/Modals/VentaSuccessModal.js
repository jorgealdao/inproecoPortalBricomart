import React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";

const VentaSuccessModal = ({ ventaSuccess, toggle }) => {
  return (
    <Modal isOpen={ventaSuccess} toggle={toggle}>
      <ModalHeader toggle={toggle}>Venta</ModalHeader>
      <ModalBody>Se ha generado la venta con éxito.</ModalBody>
    </Modal>
  );
};

export default VentaSuccessModal;
