import React, { useState, useEffect, useCallback, useContext } from "react";
import { Col, FormGroup, Label, Input } from "reactstrap";

// Constants
import { API_INPRONET } from "../../constants";

// context
import {
  GlobalStateContext,
  GlobalDispatchContext,
} from "../../../context/GlobalContext";

const CentroInput = ({ setCentroSelected }) => {
  const dispatch = useContext(GlobalDispatchContext);
  const { user } = useContext(GlobalStateContext);
  const { gestoresId } = user;
  const [centros, setCentros] = useState();

  const getData = async () => {
    var data = new FormData();
    data.append("accion", "getCentrosFacturasGestor");
    data.append("gestorId", gestoresId);

    const requestOptions = {
      method: "POST",
      body: data,
    };
    const getCentros = await fetch(
      `${API_INPRONET}/core/controller/RetiradaController.php`,
      requestOptions
    );
    const resGetCentros = await getCentros.text();
    const resParsed = JSON.parse(resGetCentros);

    let results = [];
    //Hay que volver a parsear los objetos
    for (const centro of resParsed) {
      await results.push(JSON.parse(centro));
    }
    console.log(results);
    setCentros(results);
  };

  const onChangeCentro = (e) => {
    setCentroSelected(e.target.value);
    dispatch({
      type: "SET_CENTRO_SELECTED_FACTURA",
      payload: { centroSelectedFactura: e.target.value },
    });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Col sm={6} className="px-2">
      <FormGroup>
        <Label>Centro</Label>
        <Input
          type="select"
          name="centro"
          id="centro"
          onChange={onChangeCentro}
          required
        >
          <option disabled selected value="">
            {" "}
            -- Seleccionar --{" "}
          </option>
          {centros &&
            centros.map((centro) => {
              return (
                <option value={centro.CENTRO_PRODUCTOR_ID}>
                  {centro.CLIENTE} - {centro.CENTRO}
                </option>
              );
            })}
        </Input>
      </FormGroup>
    </Col>
  );
};

export default CentroInput;
