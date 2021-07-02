import React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";

const FacturaExistsModal = ({ invalidFactura, toggle }) => {
  return (
    <Modal isOpen={invalidFactura} toggle={toggle}>
      <ModalHeader toggle={toggle}>Factura existente</ModalHeader>
      <ModalBody>Ya existe una factura con ese número.</ModalBody>
    </Modal>
  );
};

export default FacturaExistsModal;
