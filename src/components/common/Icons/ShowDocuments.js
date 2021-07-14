import React, { useState, useEffect } from "react";
import ShowDocumentsModal from "../Modals/ShowDocumentsModal";

const ShowDocuments = ({ row }) => {
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  const toggleShowDocumentsModal = () => {
    setShowDocumentsModal(!showDocumentsModal);
  };

  return (
    <>
      <i
        className="oi oi-document"
        style={{
          cursor: "pointer",
          verticalAlign: "middle",
          textAlign: "center",
        }}
        onClick={toggleShowDocumentsModal}
      />
      {showDocumentsModal ? (
        <ShowDocumentsModal
          showDocumentsModal={showDocumentsModal}
          toggle={toggleShowDocumentsModal}
          retirada={row}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default ShowDocuments;
