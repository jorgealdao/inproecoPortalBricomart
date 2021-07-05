import React, { useState, useEffect, useCallback, useContext } from 'react'
import { Col, Row, Form, FormGroup, Label, Input,  Button } from "reactstrap";

//graphql
import { client, getProvincias, getMunicipiosByProvincia } from '../../../components/graphql';

// context
import { GlobalStateContext } from "../../../context/GlobalContext";


const FormularioNuevaVenta = () => {

    const [provincias, setProvincias] = useState()
    const [localidades, setLocalidades] = useState()

     const fetchProvincias = useCallback(() => {
        client
            .query({
                query: getProvincias,
            })
            .then(res => {
                /* console.log(res.data.getProvincia) */
                setProvincias(res.data.getProvincia)
            })
    }, [client, getProvincias])

    const onChangeProvincia = (e) => {
        if(e.target.value) {
            fetchLocalidades(e.target.value)
        }

    };
    
    const fetchLocalidades = useCallback((e) => {
        client
            .query({
                query: getMunicipiosByProvincia ,
                variables: {
                    provinciaId: e,
                }
            })
            .then(res => {
                /* console.log(res) */
                setLocalidades(res.data.getMunicipio)
            })
    }, [client,getMunicipiosByProvincia])

     useEffect(() => {
        fetchProvincias()
    }, [])
    

    return (
        <div>
            <div className="content">
                <section className="box">
                    <div className= "content-body">
                        <h2>Registro Nueva Venta</h2>
                        <Form>
                            <Row form>
                                <Col md={5}>
                                    <FormGroup>
                                        <Label>NIF/NIE</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={7}>
                                    <FormGroup>
                                        <Label>Nombre y apellidos</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={12}>
                                    <FormGroup>
                                        <Label>Razón Social</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Tipo de Vía</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>Nombre Vía</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={1}>
                                    <FormGroup>
                                        <Label>Número</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={1}>
                                    <FormGroup>
                                        <Label>Piso</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={1}>
                                    <FormGroup>
                                        <Label>Puerta</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={2}>
                                    <FormGroup>
                                        <Label>Código Postal</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Provincia</Label>
                                        <Input
                                        type="select"
                                        onChange= {onChangeProvincia}
                                        >
                                        {provincias && provincias.map(provincia=>{ 
                                            return (
                                            <option key={provincia.ID} value={provincia.ID} >{provincia.NOMBRE}</option>
                                            )
                                        })}
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Localidad</Label>
                                        <Input
                                        type="select">
                                        {localidades && localidades.map(localidad=>{ 
                                            return (
                                            <option key={localidad.ID} value={localidad.ID} >{localidad.NOMBRE}</option>
                                            )
                                        })}
                                        </Input>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Marca</Label>
                                        <Input
                                        type="select"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Marca Seleccionada</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Modelo</Label>
                                        <Input
                                        type="select"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Modelo Seleccionado</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Referencia</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Número de Serie</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Cantidad</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Tipo Gas</Label>
                                        <Input
                                        type="text"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Fecha Venta</Label>
                                        <Input
                                        type="date"
                                        placeholder="date placeholder"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>Tienda</Label>
                                        <Input
                                        type="select"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form> 
                                <Col md={2}>
                                    <Button color="primary" >
                                            Guardar 
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default FormularioNuevaVenta
