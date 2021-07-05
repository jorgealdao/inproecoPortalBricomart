import React from 'react'
import { Col, Row, Form, FormGroup, Label, Input,  Button } from "reactstrap";

const FormularioNuevaVenta = () => {
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
                                />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label>Localidad</Label>
                                <Input
                                type="select"
                                />
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
