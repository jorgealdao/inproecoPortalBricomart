import React, { useContext } from "react";
import { GlobalDispatchContext } from "../context/GlobalContext";

const useAuth = () => {
  const dispatch = useContext(GlobalDispatchContext);

  const handleLogout = () => {
    dispatch({ type: "SET_LOGOUT" });
  };
  return { handleLogout };
};

export default useAuth;
