import React, { useState, useEffect, useCallback, useContext } from "react";
import { Col, FormGroup, Label, Input, FormFeedback } from "reactstrap";

// GRAPHQL
import { client, getGestoresByUser } from "../../../components/graphql";

// context
import {
  GlobalStateContext,
  GlobalDispatchContext,
} from "../../../context/GlobalContext";

const GestorInput = ({ setGestorSelected }) => {
  const dispatch = useContext(GlobalDispatchContext);
  const { user } = useContext(GlobalStateContext);
  const { gestoresId } = user;
  const [gestores, setGestores] = useState();

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

  const onChangeGestor = (e) => {
    console.log(e.target.value);
    setGestorSelected(e.target.value);
    dispatch({
      type: "SET_GESTOR_SELECTED_FACTURA",
      payload: { gestorSelectedFactura: e.target.value },
    });
  };

  useEffect(() => {
    getGestores();
  }, []);

  return (
    <Col sm={6} className="px-2">
      <FormGroup>
        <Label>Gestor</Label>
        <Input
          type="select"
          name="gestor"
          id="gestor"
          onChange={onChangeGestor}
          defaultValue=""
          required
        >
          <option disabled selected value="">
            {" "}
            -- Seleccionar --{" "}
          </option>
          {gestores &&
            gestores.map((gestor) => {
              return <option value={gestor.id}>{gestor.nombre}</option>;
            })}
        </Input>
        <FormFeedback>can't see this</FormFeedback>
      </FormGroup>
    </Col>
  );
};

export default GestorInput;
