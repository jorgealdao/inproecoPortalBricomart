import React, {useState} from "react";
import { Link, Redirect } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import {
    Button, Modal, ModalHeader, ModalBody, ModalFooter,
    Container, Row, Col, Label, FormGroup, Input, Form, FormText
} from 'reactstrap';

const Login = (props) => {
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()

    const onChangeUsername = (e) => {
        console.log(e.target.value)
        setUsername(e.target.value)
    }

    const onChangePassword = (e) => {
        console.log(e.target.value)
        setPassword(e.target.value)
    }

    const onSubmit = (e) => {
        e.preventDefault()
        console.log(props)
        Auth.signIn(username, password)
          .then(user => {
              console.log(user.signInUserSession.accessToken.jwtToken)
              console.log('LOGADO!')
              if(user.signInUserSession.accessToken.jwtToken) {
                props.history.push('/crm/servicios'); 
              }
              //return <Redirect to='crm/servicios'/>
            /* const { history, location } = props;
            const { from } = location.state || {
              from: {
                pathname: '/servicios'
              }
            }; */

            /* localStorage.setItem(AUTH_USER_TOKEN_KEY, user.signInUserSession.accessToken.jwtToken);

            notification.success({
              message: 'Succesfully logged in!',
              description: 'Logged in successfully, Redirecting you in a few!',
              placement: 'topRight',
              duration: 1.5
            });*/

          })
          .catch(err => {
              console.log(err)
            /* notification.error({
              message: 'Error',
              description: err.message,
              placement: 'topRight'
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
                    <FormGroup>
                        <Label>Contraseña</Label>
                        <Input type="password" id="password" name="password" onChange={onChangePassword}></Input>
                    </FormGroup>
                </Col>
            </Row>
            <Button color="primary" onClick={onSubmit}>Iniciar sesión</Button>
            <Link style={{ float: 'right' }} to="crm/forgotten-password">
                ¿Has olvidado tu contraseña?
            </Link>
        </Container>
        
    )
}

export default Login
