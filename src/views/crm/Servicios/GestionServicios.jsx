import React, {useState, useEffect, useCallback, useMemo, useContext} from 'react';
import { FilteringState, IntegratedFiltering } from "@devexpress/dx-react-grid";

// GRAPHQL
import {
client,
getRetiradasGestor
} from "../../../components/graphql";

// CONSTANTS
import { COLUMNS_SERVICIOS } from './../../../components/constants';

// context
import { GlobalStateContext } from "../../../context/GlobalContext";

// components
import Layout from "../../../components/common/Layout/Layout";

const GestionServicios = () => {
  
    const { user } = useContext(GlobalStateContext);  
    const { gestoresId } = user; 

    //const gestoresId = user.gestoresId ? user.gestoresId : null;
    const [columns] = useState(COLUMNS_SERVICIOS);
    const [rows, setRows] = useState(null);

    // GUARDA LOS RESULTADOS DE LA PRIMERA QUERY
    const [rowsStore, setRowsStore] = useState(null);

    const getData = useCallback(async () => {
      let results = [];
      for(const gestorId of gestoresId) {
        await client
          .query({
            query: getRetiradasGestor,
            fetchPolicy: "no-cache",
            variables: {
              offset: 0,
              limit: 100,
              gestorId: gestorId,
            },
          })
          .then((res) => {
            for(let j = 0; j < res.data.getRetiradasView.length; j++){
              results.push(res.data.getRetiradasView[j])
            }  
          });
      }
      setRows(results);
      setRowsStore(results);
    }, [client, getRetiradasGestor]);

    const estadosInstructions = () => {
        return(
            <>
                <div>PENDIENTE (petición de nuevo servicio recibida por INPROECO, pero pendiente de notificación al gestor)</div>
                <div>CONFIRMADO (petición de servicio enviada a gestor)</div>
                <div>PLANIFICADO (fecha de realización confirmada por el gestor)</div>
                <div>REALIZADO ( servicio realizado en la fecha indicada, pendiente de documentación justificativa)</div>
                <div>DOCUMENTADO (documentación incompleta o pendiente de verificación)</div>
            </>
        )
    }

    useEffect(() => {
        getData();
      }, []);
    return (
        <Layout
            title="Gestión de servicios"
            estadosInstructions={estadosInstructions()}
            rowsStore={rowsStore}
            rows={rows}
            setRows={setRows}
            columns={columns}
            /* hiddenColumnsNames={hiddenColumnsNames} */
        >
            <FilteringState defaultFilters={[]} />
            <IntegratedFiltering />
        </Layout>
    )
}

export default GestionServicios
