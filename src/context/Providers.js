import React from "react";

import GlobalContextProvider from "./GlobalContext";

const Providers = ({ children }) => {
  return <GlobalContextProvider>{children}</GlobalContextProvider>;
};

export default Providers;
