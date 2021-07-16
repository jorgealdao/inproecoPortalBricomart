import React from "react";
import ShowDocuments from "./ShowDocuments";
import ShowDeleteVenta from "./ShowDeleteVenta";
import ShowEditVenta from "./ShowEditVenta";

const RowVentaActions = (props) => {
  const { row, setIsDeleted } = props;

  return (
    <>
    <td
      style={{
        cursor: "pointer",
        verticalAlign: "middle",
        textAlign: "center",
        ...props.style,
      }}
      {...props.restProps}
    >
      <ShowDocuments {...props} />
      <ShowDeleteVenta {...props} />
      <ShowEditVenta {...props} />
    </td>
    </>
  );
};

export default RowVentaActions;
