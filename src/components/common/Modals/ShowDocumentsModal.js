import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormText,
} from "reactstrap";

// graphql
import {
  client,
  getDocumentosByRetiradaId,
  getDocumentosById,
} from "../../graphql";

//constants
import { API_INPRONET } from "../../constants";

//components
import DocumentosInput from "../Inputs/DocumentosInput";

const ShowDocumentsModal = ({
  showDocumentsModal,
  toggle,
  retirada,
  getServicios,
}) => {
  const [documents, setDocuments] = useState([]);
  const [documentNotSaved, setDocumentNotSaved] = useState(false);

  // ESTADOS PARA DOCUMENTOS
  const [fileNames, setFileNames] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [tipoDocumentos, setTipoDocumentos] = useState();

  const fetchData = useCallback(() => {
    try {
      client
        .query({
          query: getDocumentosByRetiradaId,
          fetchPolicy: "no-cache",
          variables: {
            retiradaId: retirada.ID,
          },
        })
        .then((res) => {
          let results = [];
          console.log(res.data.getRetiradaDocumento);
          const documentos = res.data.getRetiradaDocumento;
          if (documentos.length === 0) {
            return;
          } else {
            for (const document of documentos) {
              client
                .query({
                  query: getDocumentosById,
                  variables: {
                    id: document.DOCUMENTO_ID.toString(),
                  },
                })
                .then((res) => {
                  console.log(res.data.getDocumento);
                  results.push(res.data.getDocumento);
                });
            }
            console.log(results);
            setDocuments(results);
          }
        });
    } catch (error) {
      throw error;
    }
  }, [client, getDocumentosByRetiradaId, retirada, getDocumentosById]);

  const ShowDocuments = () => {
    if (documents.length !== 0) {
      return (
        <div>
          <ul>
            {documents.map((document) => (
              <li key={document[0].ID}>
                <span>
                  <a
                    href={`${API_INPRONET}/${document[0].RUTA}`}
                    style={{ padding: "20px" }}
                  >
                    {document[0].NOMBRE}
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    } else {
      return <p>No hay documentos para mostrar.</p>;
    }
  };

  const saveDocumentoRetirada = async (
    retiradaId,
    files = [],
    fileNames = []
  ) => {
    //console.log(retiradaId, files, fileNames)
    if (files.length > 0 && fileNames.length > 0) {
      //console.log(files, fileNames)
      files.forEach(async (doc) => {
        let fileDataFiltered = [];
        const filterred = fileNames.filter((file) => {
          return doc.name === file.NOMBRE;
        });
        if (filterred.length > 0) fileDataFiltered = filterred;
        const docData = new FormData();
        docData.append("accion", "adjuntarDocumentoRetiradaGestor");
        docData.append("retiradaId", retiradaId);
        docData.append("tipoId", fileDataFiltered[0].TIPO_DOCUMENTO_ID);
        docData.append("documento", doc);

        const requestOptions = {
          method: "POST",
          body: docData,
        };

        try {
          const saveDocumentosRetirada = await fetch(
            `${API_INPRONET}/core/controller/RetiradaController.php`,
            requestOptions
          );
          const resSaveDocumentosRetiradaText =
            await saveDocumentosRetirada.text();

          console.log(resSaveDocumentosRetiradaText);
          console.log(resSaveDocumentosRetiradaText.trim());

          if (isDocumentSaved(resSaveDocumentosRetiradaText.trim())) {
            getServicios();
            toggle();
          } else {
            setDocumentNotSaved(true);
          }
        } catch (error) {
          throw error;
        }
      });
    }
  };

  const isServicioCompletado = () => {
    return retirada.ESTADO === "SERVICIO COMPLETADO";
  };

  // INSERTA EN UNA TABLA SIN COLUMNA ID, POR ESO RECIBE 0
  const isDocumentSaved = (response) => {
    return response === "0";
  };
  console.log(documents);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Modal isOpen={showDocumentsModal} toggle={toggle}>
      <ModalHeader>Documentos</ModalHeader>
      <ModalBody>
        <ShowDocuments />
        {!isServicioCompletado() ? (
          <>
            <DocumentosInput
              fileNames={fileNames}
              setFileNames={setFileNames}
              newFiles={newFiles}
              setNewFiles={setNewFiles}
            />
            <Button
              color="primary"
              onClick={() =>
                saveDocumentoRetirada(retirada.ID, newFiles, fileNames)
              }
            >
              Guardar documento
            </Button>
            {documentNotSaved ? (
              <FormText color="danger">
                Ha ocurrido un error al guardar los documentos. Inténtelo de
                nuevo.
              </FormText>
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}
      </ModalBody>
      <ModalFooter>
        <Button onClick={toggle}>Cerrar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ShowDocumentsModal;
