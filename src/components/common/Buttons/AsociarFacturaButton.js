import React, { useState } from "react";
import { Button } from "reactstrap";
import { withRouter } from "react-router-dom";

// graphql
import { client, updateEstadoFactura } from "../../graphql";

// components
import CheckedFacturaOkModal from "../Modals/CheckedFacturaOkModal";
import CheckedFacturaPendienteVerificarModal from "../Modals/CheckedFacturaPendienteVerificarModal";

const AsociarFacturaButton = ({ allowedSendFactura, facturaId, history }) => {
  const [facturaOk, setFacturaOk] = useState();
  const [facturaPendienteRevisar, setFacturaPendienteRevisar] = useState();

  const sendFactura = () => {
    console.log(facturaId);
    client
      .mutate({
        mutation: updateEstadoFactura,
        variables: {
          newEstado: 2,
          id: "12238",
          /* id: facturaId.toString(), */
        },
      })
      .then((res) => {
        if (res.data.updateFactura.ID) setFacturaOk(true);
      });
  };

  const redirectToFacturacion = () => {
    history.push("/crm/facturacion");
  };

  return (
    <>
      <Button
        color="primary"
        className="asociar-servicio-button"
        disabled={!allowedSendFactura}
        onClick={sendFactura}
      >
        Enviar factura
      </Button>
      {facturaOk ? (
        <CheckedFacturaOkModal
          facturaOk={facturaOk}
          redirectToFacturacion={redirectToFacturacion}
        />
      ) : (
        <></>
      )}
      {facturaPendienteRevisar ? (
        <CheckedFacturaPendienteVerificarModal
          facturaPendienteRevisar={facturaPendienteRevisar}
          redirectToFacturacion={redirectToFacturacion}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default withRouter(AsociarFacturaButton);
