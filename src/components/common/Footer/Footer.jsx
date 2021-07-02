import React from 'react';
import { Container } from 'reactstrap';
// used for making the prop types of this component
import PropTypes from 'prop-types';

class Footer extends React.Component{
    render(){
        return (
            <footer className={"footer"
                + (this.props.default ? " footer-default":"")
            }>
                <Container fluid={this.props.fluid ? true:false}>
                    
                    <div className="copyright">
                        &copy; {1900 + (new Date()).getYear()}, <a href="https://themeforest.net/user/themepassion/portfolio" target="_blank" rel="noopener noreferrer">Ingeniería y Proyectos Ecológicos, S.L. (INPROECO)
c/Teide, 3, Oficina 2-2. CP: 28703, San Sebastián de los Reyes (Madrid)</a>
                    </div>
                </Container>
            </footer>
        );
    }
}

Footer.propTypes = {
    default: PropTypes.bool,
    fluid: PropTypes.bool
}

export default Footer;
