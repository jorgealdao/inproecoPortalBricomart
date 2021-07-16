import React, { useContext } from "react";
import ShowDocuments from "./ShowDocuments";
import ShowDeleteVenta from "./ShowDeleteVenta";
import ShowEditVenta from "./ShowEditVenta";

//context
import { GlobalStateContext } from "../../../context/GlobalContext";

const RowVentaActions = (props) => {
  const { user } = useContext(GlobalStateContext);

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
        {(user.rolDesc === "BRICOMART_INPROECO" ||
          user.rolDesc === "BRICOMART_INPROECO_CENTRO") && (
          <>
            <ShowEditVenta {...props} />
            <ShowDeleteVenta {...props} />
          </>
        )}
      </td>
    </>
  );
};

export default RowVentaActions;
