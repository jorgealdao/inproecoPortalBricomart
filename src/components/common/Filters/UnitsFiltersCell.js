import React, { useState, useContext, useEffect, useCallback } from "react";
import * as PropTypes from "prop-types";
import MultiSelect from "@khanacademy/react-multi-select";

// context
import { GlobalStateContext } from "../../../context/GlobalContext";

// hooks
import useFilters from "../../../hooks/useFilters";

// GRAPHQL
import {
  client,
  getGestoresByUser,
  GET_RESIDUOS_CENTRO,
} from "../../../components/graphql";

const UnitsFilterCell = ({ onFilter, column, options }) => {
  const { value, setValue } = useFilters();
  const { user } = useContext(GlobalStateContext);
  const { gestoresId } = user;
  const context = useContext(GlobalStateContext);
  const [gestores, setGestores] = useState([]);
  const [selected, setSelected] = useState([]);

  const getGestores = useCallback(async () => {
    let results = [];
    for (let i = 0; i < gestoresId.length; i++) {
      await client
        .query({
          query: getGestoresByUser,
          fetchPolicy: "no-cache",
          variables: {
            offset: 0,
            limit: 100,
            gestorId: gestoresId[i],
          },
        })
        .then((res) => {
          for (let j = 0; j < res.data.getGestor.length; j++) {
            results.push(res.data.getGestor[j]);
          }
        });
    }
    setGestores(results);
  }, [client, getGestoresByUser]);

  //Variable global para las opciones de los checkbox seleccionadas
  let clickedOption = [];
  let clickedOptionCentro = [];
  let clickedOptionZona = [];
  let clickedOptionResiduo = [];
  let centrosCliente = [];
  let clickedPendiente = {};

  // Inicializamos colecciones
  //let gestores = [];
  let clientes = [];
  let centros = [];
  let residuos = [];
  let transportistas = [];
  let estados = [];

  let elems = [];
  let col = [];
  let data = [];

  //Dropdowns normales
  if (column.name === "CLIENTE")
    elems = options.clientes ? options.clientes : [];
  if (column.name === "TRANSPORTISTA") elems = transportistas;
  if (column.name === "GESTOR") elems = gestores;
  if (column.name === "ESTADO") elems = estados;

  //Dropdowns dinámicos
  if (column.name === "CENTRO") {
    if (value && value.centros) {
      data = value.centros;
    } else {
      elems = centros;
      data = elems.map((elem) => {
        return { label: elem.nombre, value: elem.nombre };
      });
    }
    return (
      <th style={{ fontWeight: "normal" }}>
        <MultiSelect
          selectAllLabel="Todos"
          selectSomeItems="Seleccionar..."
          options={data}
          selected={clickedOptionCentro}
          overrideStrings={{
            selectSomeItems: "Seleccionar...",
            search: "Buscar",
            allItemsAreSelected: "Todos",
          }}
          onSelectedChanged={(selected) => {
            console.log("selected", selected);

            //Se marcan todos los RESIDUOS como opciones
            let residuos_select = residuos.map((residuo) => {
              return { label: residuo.nombre, value: residuo.nombre };
            });
            setValue({ ...value, residuos: residuos_select });

            //Si se ha seleccionado un CENTRO, saca sus RESIDUOS
            if (selected && selected.length > 0) {
              let activeCentro = centros.filter((centro) => {
                return selected.includes(centro.nombre);
              });
              console.log("active", activeCentro);
              if (activeCentro.length > 0) {
                client
                  .query({
                    query: GET_RESIDUOS_CENTRO,
                    variables: {
                      id: activeCentro[0].id.toString(),
                    },
                  })
                  .then((res) => {
                    let filteredResiduos = res.data.getCentroProductorResiduo;
                    filteredResiduos.sort((a, b) =>
                      a.residuo[0].nombre.localeCompare(b.residuo[0].nombre)
                    );
                    let residuos_select = filteredResiduos.map((residuo) => {
                      return {
                        label: residuo.residuo[0].nombre,
                        value: residuo.residuo[0].nombre,
                      };
                    });
                    setValue({ ...value, residuos: residuos_select });
                  });
              }
            }

            // Actualizamos el valor seleccionado
            clickedOptionCentro = selected;
            // Callback a filtrado
            onFilter(selected ? { value: selected } : null);
          }}
        />
      </th>
    );
  } else if (column.name === "RESIDUO") {
    if (value && value.residuos) {
      data = value.residuos;
    } else {
      elems = residuos;
      data = elems.map((elem) => {
        return { label: elem.nombre, value: elem.nombre };
      });
    }
    return (
      <th style={{ fontWeight: "normal" }}>
        <MultiSelect
          selectAllLabel="Todos"
          selectSomeItems="Seleccionar..."
          options={data}
          selected={clickedOptionResiduo}
          overrideStrings={{
            selectSomeItems: "Seleccionar...",
            search: "Buscar",
            allItemsAreSelected: "Todos",
          }}
          onSelectedChanged={(selected) => {
            // Actualizamos el valor seleccionado
            clickedOptionResiduo = selected;
            // Callback a filtrado
            onFilter(selected ? { value: selected } : null);
          }}
        />
      </th>
    );
  } else {
    // mapeamos con label y value
    data = elems.map((elem) => {
      return { label: elem.nombre, value: elem.nombre };
    });
  }

  useEffect(() => {
    getGestores();
  }, []);

  return (
    <th style={{ fontWeight: "normal" }}>
      <MultiSelect
        selectAllLabel="Todos"
        selectSomeItems="Seleccionar..."
        options={data}
        selected={clickedOption}
        overrideStrings={{
          selectSomeItems: "Seleccionar...",
          search: "Buscar",
          allItemsAreSelected: "Todos",
        }}
        onSelectedChanged={(selected) => {
          console.log("selected", selected);
          setSelected(selected);
          // Activamos los cambios a partir de la columna CLIENTE
          /* if (column.name === "CLIENTE") {
            //console.log(centrosCliente)
            let activeZonas = zonas.filter((zona) =>
              selected.includes(zona.cliente[0].nombre)
            );
            let zonas_select = activeZonas.map((zona) => {
              return { label: zona.nombre, value: zona.nombre };
            });
            setValue({
              zonas: zonas_select,
              centros: value ? value.centros : [],
            });

            //Actualizamos los centros
            let activeCentros = centros.filter((centro) =>
              selected.includes(centro.cliente)
            );
            let centros_select = activeCentros.map((centro) => {
              return { label: centro.nombre, value: centro.nombre };
            });
            centrosCliente = activeCentros;
            setValue({
              zonas: zonas_select ? zonas_select : [],
              centros: centros_select,
            });
          } */

          /* if (column.name === "ZONA") {
            if (centrosCliente.length !== 0) {
              let activeCentros = centrosCliente.filter((centro) =>
                selected.includes(centro.zona)
              );
              if (activeCentros.length !== 0) {
                let filteredCentros = activeCentros.map((centro) => {
                  return { label: centro.nombre, value: centro.nombre };
                });
                setValue({ ...value, centros: filteredCentros });
              }
            } else {
              let activeCentros = centros.filter((centro) =>
                selected.includes(centro.zona)
              );
              if (activeCentros.length !== 0) {
                let filteredCentros = activeCentros.map((centro) => {
                  return { label: centro.nombre, value: centro.nombre };
                });
                setValue({ ...value, centros: filteredCentros });
              }
            }
          } */

          /* if (column.name === "CENTRO") {
            //Se marcan todos los RESIDUOS como opciones
            let residuos_select = residuos.map((residuo) => {
              return { label: residuo.nombre, value: residuo.nombre };
            });
            setValue({ ...value, residuos: residuos_select });

            //Si se ha seleccionado un CENTRO, saca sus RESIDUOS
            if (selected && selected.length > 0) {
              let activeCentro = centros.filter((centro) => {
                return selected.includes(centro.nombre);
              });
              console.log("active", activeCentro);
              if (activeCentro.length > 0) {
                client
                  .query({
                    query: GET_RESIDUOS_CENTRO,
                    variables: {
                      id: activeCentro[0].id.toString(),
                    },
                  })
                  .then((res) => {
                    let filteredResiduos = res.data.getCentroProductorResiduo;
                    filteredResiduos.sort((a, b) =>
                      a.residuo[0].nombre.localeCompare(b.residuo[0].nombre)
                    );
                    let residuos_select = filteredResiduos.map((residuo) => {
                      return {
                        label: residuo.residuo[0].nombre,
                        value: residuo.residuo[0].nombre,
                      };
                    });
                    setValue({ ...value, residuos: residuos_select });
                  });
              }
            }
          } */
          // Actualizamos el valor seleccionado
          clickedOption = selected;
          onFilter(selected ? { value: selected } : null);
        }}
      />
    </th>
  );
};

UnitsFilterCell.propTypes = {
  filter: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }),
  onFilter: PropTypes.func.isRequired,
  column: PropTypes.shape({ name: PropTypes.string }).isRequired,
};

UnitsFilterCell.defaultProps = {
  filter: null,
};

export default UnitsFilterCell;
