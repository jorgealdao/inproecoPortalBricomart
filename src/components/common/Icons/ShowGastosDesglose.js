import React, { useState } from "react";
import ShowGastosModal from "../Modals/ShowGastosModal";

const ShowGastosDesglose = ({ row }) => {
  const [showGastosModal, setShowGastosModal] = useState(false);

  const toggleShowGastosModal = () => {
    setShowGastosModal(!showGastosModal);
  };

  return (
    <>
      <i
        className="oi oi-calculator"
        style={{
          cursor: "pointer",
          verticalAlign: "middle",
          textAlign: "center",
        }}
        onClick={toggleShowGastosModal}
      />
      {showGastosModal ? (
        <ShowGastosModal
          showGastosModal={showGastosModal}
          toggle={toggleShowGastosModal}
          retirada={row}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default ShowGastosDesglose;
