import React, { useState, useEffect, useCallback, useContext } from 'react';

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
                variables: {
                    centroId: centroId
                }
            })
            .then(res => {
                console.log(res)
                setVentas(res.data.ventas_bricomart)
            })
    }, [client, getVentasByCentro])

    const fetchVentasRoleCorporativo = useCallback(() => {
        client
            .query({
                query: getVentasAllCentros,
            })
            .then(res => {
                console.log(res)
                setVentas(res.data.ventas_bricomart)
            })
    }, [client, getVentasAllCentros])

    useEffect(() => {
        fetchVentas()
    }, [])

    return (
        <Layout
            title="Registro de ventas"
            rows={ventas}
            setRows={setVentas}
            columns={columns}
        >
        </Layout>
    )
}

export default RegistroVentas
