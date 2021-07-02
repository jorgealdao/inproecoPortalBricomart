import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Row, Col } from "reactstrap";
import { FilteringState, IntegratedFiltering } from "@devexpress/dx-react-grid";

// graphql
import { client, getServiciosAnterioresEmisionFactura, getBaseImponibleFactura, getOtrosGastosFijosByCentroProductor } from "./../../../components/graphql";

// context
import { GlobalStateContext } from "../../../context/GlobalContext";
import { API_INPRONET } from '../../../components/constants';

// constants
import { COLUMNS_FACTURA_SERVICIOS, HIDDEN_COLUMNS_FACTURACION } from './../../../components/constants';

// components
import LayoutFacturaServicios from './../../../components/common/Layout/LayoutFacturaServicios';
import FacturaEmbedded from './../../../components/common/Factura/FacturaEmbedded';
import AsociarFacturaButton from '../../../components/common/Buttons/AsociarFacturaButton';
import AddOtrosGastosButton from '../../../components/common/Buttons/AddOtrosGastosButton';

const ServiciosFactura = ({ facturaId, documentoId, fechaEmisionFactura }) => {
  const { user, centroSelectedFactura, newGastosResiduo, newOtrosGastos } = useContext(GlobalStateContext);   
  const { gestoresId } = user;
  const [servicios, setServicios] = useState();
  const [baseImponible, setBaseImponible] = useState(70);
  const [checkedRows, setCheckedRows] = useState([]);
  const [totalServicios, setTotalServicios] = useState(0);
  const [allowedSendFactura, setAllowedSendFactura] = useState(false)

  const [columnsFacturaServicios, setColumns] = useState(COLUMNS_FACTURA_SERVICIOS)

  // TODO PASAR A QUERY GRAPHQL
  const getServicios = async () => {
    var data = new FormData();
    data.append("accion", "getRetiradasSinFactura");
    data.append("gestorId", gestoresId);
    /* data.append("centroProductorId", centroSelectedFactura);
    data.append("fechaEmision", fechaEmisionFactura); */
    data.append("centroProductorId", '43');
    data.append("fechaEmision", '20150902');

    const requestOptions = {
      method: "POST",
      body: data,
    };
    const fetchServicios = await fetch(
      `${API_INPRONET}/core/controller/RetiradaController.php`,
      requestOptions
    )
    const resFetchServicios = await fetchServicios.text();
    const serviciosSinGastos = JSON.parse(resFetchServicios)
    changeGastosResiduoServicio(serviciosSinGastos) 
    setGastoTotalRounded(serviciosSinGastos)
    let gastos = await getOtrosGastosFijos().then(res => res)
    let alquileres = await getAlquilerResiduos()
    addOtrosGastos(gastos, alquileres, newOtrosGastos);
    const allRows = serviciosSinGastos.concat(gastos, alquileres)
    setServicios(allRows);
  }

  const changeGastosResiduoServicio = (oldServicios) => {
    if(newGastosResiduo.length > 0){
      for(const newGasto of newGastosResiduo) {
        let foundServicio = oldServicios.findIndex(servicio => servicio.ID == newGasto.retirada_id);
        oldServicios[foundServicio].COSTE_PORTES = newGasto.coste_portes;
        oldServicios[foundServicio].COSTE_TRATAMIENTO = newGasto.coste_tratamiento;
        oldServicios[foundServicio].ABONO = newGasto.coste_abono;
        oldServicios[foundServicio].TOTAL = newGasto.total;
      }
    }
  }

  const addOtrosGastos = (gastos, alquileres, gastosNuevo) => {
    for(const gasto of gastosNuevo){
      if(gasto.residuo == null) gastos.push(gasto)
      else alquileres.push(gasto)
    }
  }

  const setGastoTotalRounded = (allServicios) => {
    for(const servicio of allServicios){
      servicio.TOTAL = parseFloat(servicio.TOTAL).toFixed(2)
    } 
  }

  const getOtrosGastosFijos = () => {
    return client
        .query({
          query: getOtrosGastosFijosByCentroProductor,
          fetchPolicy: "no-cache",
          variables: {
            /* centroProductorId: centroSelectedFactura, */
            centroProductorId: '43',
          },
        })
        .then((res) => {
          return res.data.getCentroProductorOtrosGastosFijos
        });
  }

  const getAlquilerResiduos = async () => {
    const data = new FormData();
    data.append("accion", "getAlquilerResiduos");
    /* data.append("centroProductorId", centroSelectedFactura); */
    data.append("centroProductorId", '43');

    const requestOptions = {
      method: "POST",
      body: data,
    };
    const fetchAlquileres = await fetch(
      `${API_INPRONET}/core/controller/CentroProductorController.php`,
      requestOptions
    )
    const resFetchAlquileres = await fetchAlquileres.json();
    return resFetchAlquileres
  }

  const getBaseImponible = async () => {
    await client
        .query({
          query: getBaseImponibleFactura,
          fetchPolicy: "no-cache",
          variables: {
            id: facturaId.toString(),
          },
        })
        .then((res) => {
          setBaseImponible(res.data.getFacturasView[0].baseImponible)
        });
  }


  // FUNCIONES PARA GET EN GRAPHQL. FALTA POR SABER CÓMO HACER UN OR ENTRE CAMPOS
  /* const setQueryFields = () => {
    const factura = { FACTURA_ID: null}
    const fechaRealizacion = { FECHA_REALIZACION_ORDEN: `<${fechaEmisionFactura}`}
    const fechaSolicitud = { FECHA_SOLICITUD_ORDEN: `<${fechaEmisionFactura}`}
    let gestores = {}
    for(const gestorId of gestoresId) {
      gestores = { GESTOR_ID: `(${gestorId})` }
    }
  } */

  /* const getServicios = async () => {
    await client
        .query({
          query: getServiciosAnterioresEmisionFactura,
          fetchPolicy: "no-cache",
          variables: {
            offset: 0,
            limit: 100,
            gestorId: gestorId,
          },
        })
        .then((res) => {
          console.log(res.data)
          console.log(res.data.getRetiradasView.length)
        });
  } */

  useEffect(() => {
    getServicios()
    //getBaseImponible()
    getOtrosGastosFijos()
    getAlquilerResiduos()
  }, [newGastosResiduo, newOtrosGastos]) 

  return (
    <div>
      <div className="content">
        <div className="content-box">
          <Row>
            <Col xs={7}>
              <div className="page-title">
                <div className="float-left">
                  <h2 className="title">Asociar servicios</h2>
                </div>
              </div>
              <div className="col-12">
                <div className="half-screen">
                  <FacturaEmbedded documentoId={documentoId}/>
                  <div>
                    <LayoutFacturaServicios 
                      rows={servicios}
                      setRows={setServicios}
                      columns={columnsFacturaServicios}
                      hiddenColumnsNames={HIDDEN_COLUMNS_FACTURACION}
                      getServicios={getServicios}
                      checkedRows={checkedRows}
                      setCheckedRows={setCheckedRows}
                      totalServicios={totalServicios}
                      setTotalServicios={setTotalServicios}
                      baseImponible={baseImponible}
                      setAllowedSendFactura={setAllowedSendFactura}
                    >
                      <FilteringState defaultFilters={[]} />
                      <IntegratedFiltering />
                    </LayoutFacturaServicios>
                    <p>El total de líneas marcadas es {totalServicios} €</p>
                    <p>La base imponible total es {baseImponible} €</p>
                    <AddOtrosGastosButton />
                    <AsociarFacturaButton checkedRows={checkedRows} allowedSendFactura={allowedSendFactura} facturaId={facturaId} />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
    
  );
}

export default ServiciosFactura