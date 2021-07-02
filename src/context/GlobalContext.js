import React, { useReducer, createContext, useEffect } from "react";

export const GlobalStateContext = createContext();
export const GlobalDispatchContext = createContext();

const initialState = {
  value: null,
  rows: {},
  lastQuery: {},
  oldEstado: {},
  newEstado: {},
  changedId: {},
  token: null,
  user: null,
  isAllowed: false,
  centroSelectedFactura: null,
  facturaCargada: null,
  gestorSelectedFactura: null,
  newGastosResiduo: [],
  newOtrosGastos: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_VALUE":
      return {
        ...state,
        value: action.payload.value,
      };
    case "SET_ROWS":
      return {
        ...state,
        rows: action.payload.rows,
      };
    case "SET_OLDESTADO":
      return { ...state, oldEstado: action.payload.oldEstado };
    case "SET_NEWESTADO":
      return { ...state, newEstado: action.payload.newEstado };
    case "SET_CHANGEID":
      return { ...state, changeId: action.payload.changeId };
    case "SET_LOGIN":
      sessionStorage.setItem("token", action.payload.token);
      sessionStorage.setItem("user", JSON.stringify(action.payload.user));
      return {
        ...state,
        token: action.payload.token,
        user: JSON.stringify(action.payload.user),
      };
    case "SET_ALLOWED":
      sessionStorage.setItem(
        "isAllowed",
        JSON.stringify(action.payload.isAllowed)
      );
      return { ...state, isAllowed: action.payload.isAllowed };
    case "SET_LOGOUT":
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("isAllowed");

      return { ...state, token: null, user: null, isAllowed: null };
    case "SET_CENTRO_SELECTED_FACTURA":
      return {
        ...state,
        centroSelectedFactura: action.payload.centroSelectedFactura,
      };
    case "SET_FACTURA_CARGADA_ID":
      return { ...state, facturaCargada: action.payload.facturaCargada };
    case "SET_GESTOR_SELECTED_FACTURA":
      return {
        ...state,
        gestorSelectedFactura: action.payload.gestorSelectedFactura,
      };
    case "SET_NEW_GASTOS_RESIDUO":
      return { ...state, newGastosResiduo: action.payload.newGastosResiduo };
    case "SET_NEW_OTROS_GASTOS":
      return { ...state, newOtrosGastos: action.payload.newOtrosGastos };
    case "RESET": {
      return initialState;
    }
    default:
      console.error(`Invalid action type: ${action.type}`);
      throw new Error(`Invalid action type: ${action.type}`);
  }
};

const init = () => {
  if (typeof window !== `undefined`) {
    return {
      value: null,
      rows: {},
      lastQuery: {},
      oldEstado: {},
      newEstado: {},
      changedId: {},
      token: sessionStorage.getItem("token")
        ? sessionStorage.getItem("token")
        : null,
      user: sessionStorage.getItem("user")
        ? JSON.parse(sessionStorage.getItem("user"))
        : null,
      isAllowed: sessionStorage.getItem("isAllowed")
        ? JSON.parse(sessionStorage.getItem("isAllowed"))
        : false,
      centroSelectedFactura: null,
      newGastosResiduo: [],
      newOtrosGastos: [],
    };
  } else {
    return initialState;
  }
};

const GlobalContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, init);

  return (
    <>
      <GlobalStateContext.Provider value={state}>
        <GlobalDispatchContext.Provider value={dispatch}>
          {children}
        </GlobalDispatchContext.Provider>
      </GlobalStateContext.Provider>
    </>
  );
};

export default GlobalContextProvider;
