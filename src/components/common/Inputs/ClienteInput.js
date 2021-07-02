import React, { useState, useEffect, useCallback, useContext } from "react";
import { Col, FormGroup, Label, Input } from "reactstrap";

// Constants
import { API_INPRONET } from "../../constants";

// context
import { GlobalStateContext } from "../../../context/GlobalContext";

const ClienteInput = () => {
  const { user } = useContext(GlobalStateContext);
  const { gestoresId } = user;
  const [clientes, setClientes] = useState();

  const getData = async () => {
    var data = new FormData();
    data.append("accion", "getClientesFacturasGestor");
    data.append("gestorId", gestoresId);

    const requestOptions = {
      method: "POST",
      body: data,
    };

    const getClientes = await fetch(
      `${API_INPRONET}/core/controller/RetiradaController.php`,
      requestOptions
    );
    const resGetClientes = await getClientes.text();
    const resParsed = JSON.parse(resGetClientes);

    let results = [];
    //Hay que volver a parsear los objetos
    for (const cliente of resParsed) {
      await results.push(JSON.parse(cliente));
    }
    setClientes(results);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Col sm={6} className="px-2">
      <FormGroup>
        <Label>Cliente</Label>
        <Input type="select" name="cliente" id="cliente">
          <option disabled selected value="default">
            {" "}
            -- Seleccionar --{" "}
          </option>
          {clientes &&
            clientes.map((cliente) => {
              return (
                <option value={cliente.CLIENTE_ID}>{cliente.CLIENTE}</option>
              );
            })}
        </Input>
      </FormGroup>
    </Col>
  );
};

export default ClienteInput;
