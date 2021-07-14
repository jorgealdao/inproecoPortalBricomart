import React from "react";
import ShowDocuments from "./ShowDocuments";

const RowVentaActions = (props) => {
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
      <ShowDocuments {...props} />
    </td>
  );
};

export default RowVentaActions;
