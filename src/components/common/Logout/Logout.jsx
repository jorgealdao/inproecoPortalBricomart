import React from "react";
import { DropdownItem } from "reactstrap";

// hooks
import useAuth from "../../../hooks/useAuth";

const Logout = ({ history }) => {
  const { handleLogout } = useAuth();
  return (
    <>
      <DropdownItem
        tag="a"
        className=""
        onClick={() => {
          handleLogout();
          history.push("/login");
        }}
      >
        <i className="i-lock"></i> Cerrar sesión
      </DropdownItem>
    </>
  );
};

export default Logout;