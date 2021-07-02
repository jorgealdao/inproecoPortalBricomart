import React, {useState, useEffect, useCallback, useMemo, useContext, useRef} from 'react';
import { FilteringState, IntegratedFiltering } from "@devexpress/dx-react-grid";

// GRAPHQL
import {
    client,
    getFacturasGestor,
    getGestoresLogged
} from "../../../components/graphql";

// CONSTANTS
import { COLUMNS_FACTURACION, HIDDEN_COLUMNS_FACTURACION } from './../../../components/constants';

// context
import { GlobalStateContext } from "../../../context/GlobalContext";

// components
import Layout from "../../../components/common/Layout/Layout";
import ServiciosFactura from "./ServiciosFactura";

const Facturacion = () => {
    const { user } = useContext(GlobalStateContext);   
    const { gestoresId } = user;

    const [columns] = useState(COLUMNS_FACTURACION);
    const [rows, setRows] = useState(null);

    // GUARDA LOS RESULTADOS DE LA PRIMERA QUERY
    const [rowsStore, setRowsStore] = useState(null);

    const [showServiciosAsociarFactura, setShowServiciosAsociarFactura] = useState(false)
    const [facturaId, setFacturaId] = useState();
    const [documentoId, setDocumentoId] = useState();
    const [fechaEmisionFactura, setFechaEmisionFactura] = useState();
    const [totalBaseImponible, setTotalBaseImponible] = useState();

    const getData = async () => {
      let results = [];
      for(const gestorId of gestoresId) {
        await client
          .query({
            query: getFacturasGestor,
            fetchPolicy: "no-cache",
            variables: {
              offset: 0,
              limit: 100,
              gestorId: gestorId,
            },
          })
          .then((res) => {
            for(let j = 0; j < res.data.getFacturasGestoresView.length; j++){
              results.push(res.data.getFacturasGestoresView[j])
            }  
          });
        setRows(results);
        setRowsStore(results);
      };
    }

    useEffect(() => {
      getData();
    },[]);

    return (
      <>
        {!showServiciosAsociarFactura ? (
          <Layout
              title="Facturación"
              rowsStore={rowsStore}
              rows={rows}
              setRows={setRows}
              columns={columns}
              setShowServiciosAsociarFactura={setShowServiciosAsociarFactura}
              setFacturaId={setFacturaId}
              setDocumentoId={setDocumentoId}
              setFechaEmisionFactura={setFechaEmisionFactura}
              setTotalBaseImponible={setTotalBaseImponible}
              /* hiddenColumnsNames={hiddenColumnsNames} */
          >
              <FilteringState defaultFilters={[]} />
              <IntegratedFiltering />
          </Layout>
        ) : (
          <ServiciosFactura facturaId={facturaId} documentoId={documentoId} fechaEmisionFactura={fechaEmisionFactura} />
      )}
      </>
    )
}

export default Facturacion
