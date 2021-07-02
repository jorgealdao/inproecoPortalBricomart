import React from "react";
import ShowDocuments from "./ShowDocuments";
import ShowGastosDesglose from "./ShowGastosDesglose";

const RowFacturaServicioActions = (props) => {
  const { row } = props;

  return (
    <td
      style={{
        cursor: "pointer",
        verticalAlign: "middle",
        textAlign: "center",
        ...props.style,
      }}
      {...props.restProps}
    >
      {row.FECHA_REALIZACION ? (
        <>
          <ShowGastosDesglose {...props} />
          <ShowDocuments {...props} />
        </>
      ) : (
        <></>
      )}
    </td>
  );
};

export default RowFacturaServicioActions;
