import React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";

const VentaErrorDocumentoModal = ({ ventaErrorDocument, toggle }) => {
  return (
    <Modal isOpen={ventaErrorDocument} toggle={toggle}>
      <ModalHeader toggle={toggle}>Error</ModalHeader>
      <ModalBody>
        Se ha producido un error con el documento al generar la venta
      </ModalBody>
    </Modal>
  );
};

export default VentaErrorDocumentoModal;
