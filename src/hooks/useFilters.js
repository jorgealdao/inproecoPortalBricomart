import React, { useContext } from "react";

// context
import {
  GlobalStateContext,
  GlobalDispatchContext,
} from "../context/GlobalContext";

const useFilters = () => {
  const { value, rows, lastQuery, oldEstado, newEstado, changedId } =
    useContext(GlobalStateContext);
  const dispatch = useContext(GlobalDispatchContext);

  const setValue = (a) =>
    dispatch({ type: "SET_VALUE", payload: { value: a } });

  const setRows = (a) => dispatch({ type: "SET_ROWS", payload: { rows: a } });

  const setOldEstado = (a) =>
    dispatch({ type: "SET_OLDESTADO", payload: { oldEstado: a } });

  const setNewEstado = (a) =>
    dispatch({ type: "SET_NEWESTADO", payload: { newEstado: a } });

  const setChangedId = (a) =>
    dispatch({ type: "SET_CHANGEID", payload: { changedId: a } });

  return {
    value,
    setValue,
    rows,
    setRows,
    lastQuery,
    oldEstado,
    setOldEstado,
    newEstado,
    setNewEstado,
    changedId,
    setChangedId,
  };
};

export default useFilters;
