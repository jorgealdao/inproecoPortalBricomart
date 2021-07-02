import React, { useState } from "react";
import { DataTypeProvider } from "@devexpress/dx-react-grid";

//components
import ShowDocumentsModal from "../Modals/ShowDocumentsModal";

const DocumentColumnIcon = () => {
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  const toggleShowDocumentsModal = () => {
    setShowDocumentsModal(!showDocumentsModal);
  };

  const DocumentIcon = ({ row }) => {
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
        {/* {showDocumentsModal ? (
          <ShowDocumentsModal
            showDocumentsModal={showDocumentsModal}
            toggle={toggleShowDocumentsModal}
            retiradaId={row.ID}
          />
        ) : (
          <></>
        )} */}
        <ShowDocumentsModal
          showDocumentsModal={showDocumentsModal}
          toggle={toggleShowDocumentsModal}
          retiradaId={row.ID}
        />
      </>
    );
  };

  const DocumentIconProvider = (props) => (
    <DataTypeProvider formatterComponent={DocumentIcon} {...props} />
  );

  return <DocumentIconProvider for={["DOCUMENTACION"]} />;
};

export default DocumentColumnIcon;
