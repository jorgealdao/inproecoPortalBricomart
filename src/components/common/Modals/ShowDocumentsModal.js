import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormText,
} from "reactstrap";

//constants
import { API_INPRONET } from "../../constants";

const ShowDocumentsModal = ({ showDocumentsModal, toggle, retirada }) => {
  const ShowDocuments = () => {
    console.log(retirada.parteA_ruta);
    return (
      <>
        {showDocument(retirada.parteA_ruta)}
        {retirada.parteB_ruta && showDocument(retirada.parteB_ruta)}
      </>
    );
  };

  const showDocument = (path) => {
    console.log(path);
    return (
      <li key={retirada.path}>
        <span>
          <a  target="_blank" href={`${API_INPRONET}/${path}`} style={{ padding: "20px" }}>
            {path.includes("parteA") ? "Parte A" : "Parte B"}
          </a>
        </span>
      </li>
    );
  };

  return (
    <Modal isOpen={showDocumentsModal} toggle={toggle}>
      <ModalHeader>Documentos</ModalHeader>
      <ModalBody>
        <ShowDocuments />
      </ModalBody>
      <ModalFooter>
        <Button onClick={toggle}>Cerrar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ShowDocumentsModal;
