import React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { withRouter } from "react-router-dom";

const CheckedFacturaPendienteVerificarModal = ({
  facturaPendienteRevisar,
  toggle,
  redirectToFacturacion,
}) => {
  return (
    <Modal isOpen={facturaPendienteRevisar} toggle={toggle}>
      <ModalHeader toggle={toggle}>Factura enviada</ModalHeader>
      <ModalBody>
        La factura se ha enviado y está pendiente de revisar.
      </ModalBody>
    </Modal>
  );
};

export default withRouter(CheckedFacturaPendienteVerificarModal);
