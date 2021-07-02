import React, { useState } from "react";
import { Button } from "reactstrap";
import AddOtrosGastosModal from "../Modals/AddOtrosGastosModal";

const AddOtrosGastosButton = () => {
  const [otrosGastosModal, setOtrosGastosModal] = useState(false);

  const toggleOtrosGastosModal = () => {
    setOtrosGastosModal(!otrosGastosModal);
  };

  return (
    <>
      <Button color="primary" onClick={toggleOtrosGastosModal}>
        Añadir gasto
      </Button>
      {otrosGastosModal ? (
        <AddOtrosGastosModal
          otrosGastosModal={otrosGastosModal}
          toggle={toggleOtrosGastosModal}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default AddOtrosGastosButton;
