import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { withRouter } from "react-router-dom";

const CheckedFacturaOkModal = ({
  facturaOk,
  toggle,
  redirectToFacturacion,
}) => {
  return (
    <Modal isOpen={facturaOk} toggle={toggle}>
      <ModalHeader toggle={toggle}>Factura enviada</ModalHeader>
      <ModalBody>La factura se ha enviado y verificado con éxito.</ModalBody>
      <ModalFooter>
        <Button onClick={redirectToFacturacion}>Volver a facturación.</Button>
      </ModalFooter>
    </Modal>
  );
};

export default withRouter(CheckedFacturaOkModal);
