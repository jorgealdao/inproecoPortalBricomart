import React, { useState, useEffect } from "react";
import DeleteVentaModal from "../Modals/DeleteVentaModal";

const ShowDeleteVenta = ({ row, setIsDeleted }) => {
  const [deleteVentaModal, setDeleteVentaModal] = useState(false);

 const toggleDeleteVentaModal = () => {
     /* console.log(row.id); */
    setDeleteVentaModal(!deleteVentaModal);
  };

  return (
    <>
      <i
        className="oi oi-trash"
        style={{
          cursor: "pointer",
          verticalAlign: "middle",
          textAlign: "center",
          marginLeft: "5px"
        }}
         onClick={toggleDeleteVentaModal}
      />
     {deleteVentaModal ? (
        <DeleteVentaModal
          deleteVentaModal={deleteVentaModal}
          toggle={toggleDeleteVentaModal}
          row={row.id}
          setIsDeleted = {setIsDeleted}
        />
      ) : (
        <></>
      )} 
    </>
  );
};

export default ShowDeleteVenta;
