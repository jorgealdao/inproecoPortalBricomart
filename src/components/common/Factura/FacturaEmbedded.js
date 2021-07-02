import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import plantillaTestPDF from "../../../views/crm/Facturacion/plantillaTest.pdf";

// graphql
import { client, getDocumentoRuta } from "./../../../components/graphql";

// context
import { API_INPRONET } from "../../../components/constants";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const FacturaEmbedded = ({ documentoId }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); //setting 1 to show fisrt page
  const [file, setFile] = useState(plantillaTestPDF);
  const [rutaFactura, setRutaFactura] = useState();

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => {
    changePage(-1);
  };

  const nextPage = () => {
    changePage(1);
  };

  const getFacturaRuta = async () => {
    if (documentoId !== "undefined") {
      await client
        .query({
          query: getDocumentoRuta,
          fetchPolicy: "no-cache",
          variables: {
            id: documentoId,
          },
        })
        .then((res) => {
          console.log(res.data.getDocumento[0].RUTA);
          setRutaFactura(`${API_INPRONET}/${res.data.getDocumento[0].RUTA}`);
        });
    }
  };

  useEffect(() => {
    getFacturaRuta();
  }, [documentoId]);

  return (
    <div>
      <Document
        file={rutaFactura}
        options={{ workerSrc: "/pdf.worker.js" }}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      <p>
        Página {pageNumber || (numPages ? 1 : "--")} de {numPages || "--"}
      </p>
      <button type="button" disabled={pageNumber <= 1} onClick={previousPage}>
        Anterior
      </button>
      <button
        type="button"
        disabled={pageNumber >= numPages}
        onClick={nextPage}
      >
        Siguiente
      </button>
    </div>
  );
};

export default FacturaEmbedded;
