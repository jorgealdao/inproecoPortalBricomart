import React, { useState, useEffect, useCallback, useContext } from 'react';
import { FilteringState, IntegratedFiltering } from "@devexpress/dx-react-grid";

//constants
import { REGISTRO_VENTAS_COLUMNS } from '../../../components/constants';

//graphql
import { client, getVentasByCentro, getVentasAllCentros } from '../../../components/graphql';

// context
import { GlobalStateContext } from "../../../context/GlobalContext";

//components
import Layout from '../../../components/common/Layout/Layout'

const RegistroVentas = () => {
    const { user } = useContext(GlobalStateContext);  
    const { centroId } = user; 
    const columns = REGISTRO_VENTAS_COLUMNS;
    const [ventas, setVentas] = useState(null)

    const fetchVentas = () => {
        if(user.rolDesc === "BRICOMART_CENTRO") fetchVentasRoleCentro()
        else fetchVentasRoleCorporativo()
    }

    const fetchVentasRoleCentro = useCallback(() => {
        client
            .query({
                query: getVentasByCentro,
                fetchPolicy: "no-cache",
                variables: {
                    centroId: centroId
                }
            })
            .then(res => {
                console.log(res)
                setVentas(setEstadoName(res.data.ventas_bricomart))
            })
    }, [client, getVentasByCentro])

    const fetchVentasRoleCorporativo = useCallback(() => {
        client
            .query({
                query: getVentasAllCentros,
                fetchPolicy: "no-cache",
                variables: {
                    limit: 500,
                  },
            })
            .then(res => {
                setVentas(setEstadoName(res.data.ventas_bricomart))
            })
    }, [client, getVentasAllCentros])

    const setEstadoName = (ventas) => {
        let results = []
        for(let i = 0; i < ventas.length; i++){
            if(ventas[i].estado_venta) ventas[i].estado = ventas[i].estado_venta.nombre
            results.push(ventas[i])
        }
        console.log(results)
        return results;
    }


    useEffect(() => {
        fetchVentas()
    }, [])

    return (
        <Layout
            title="Registro de ventas"
            rows={ventas}
            setRows={setVentas}
            columns={columns}
            fetchVentas={fetchVentas}
            setEstadoName={setEstadoName}
        >
            <FilteringState defaultFilters={[]} />
            <IntegratedFiltering />
        </Layout>
    )
}

export default RegistroVentas
