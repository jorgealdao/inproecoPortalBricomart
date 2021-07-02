import React, {useState} from 'react'
import { Link, Redirect } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import {
    Button, Modal, ModalHeader, ModalBody, ModalFooter,
    Container, Row, Col, Label, FormGroup, Input, Form, FormText
} from 'reactstrap';

const ForgottenPassword = () => {
    const [username, setUsername] = useState()

    const onChangeUsername = (e) => {
        console.log(e.target.value)
        setUsername(e.target.value)
    }

    const onSubmit = (e) => {
        e.preventDefault()
        Auth.forgotPassword(username)
          .then(data => {
              console.log(data)
            /* notification.success({
              message: 'Redirecting you in a few!',
              description: 'Account confirmed successfully!',
              placement: 'topRight',
              duration: 1.5,
              onClose: () => {
                this.setState({ redirect: true });
              }
            }); */
          })
          .catch(err => {
              console.log(err)
            /* notification.error({
              message: 'User confirmation failed',
              description: err.message,
              placement: 'topRight',
              duration: 1.5
            }); */
        })
    }

    return (
        <Container>
            <Row>
                <Col sm={6} className="px-2">
                    <FormGroup>
                        <Label>Usuario</Label>
                        <Input type="text" id="username" name="username" onChange={onChangeUsername}></Input>
                    </FormGroup>
                </Col>
            </Row>
            <Button color="primary" onClick={onSubmit}>Confirmar usuario</Button>
            <Link style={{ float: 'right' }}>
                ¡Ya me acuerdo!
            </Link>
        </Container>
    )
}

export default ForgottenPassword
