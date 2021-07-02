import React from 'react';
import {

    Row, Col,
} from 'reactstrap';

import {
    Courseslist
} from 'components';

import { courses } from 'variables/university/courses.jsx';

class Course extends React.Component{
   
    
    render(){

        return (
            <div>
                <div className="content">
                    <Row>
                        <Col xs={12} md={12}>

                    <div className="page-title">
                        <div className="float-left">
                            <h1 className="title">Course</h1>
                        </div>
                    </div>


                            
           

                    <div className="col-xl-12">
                        <section className="box ">
                            <header className="panel_header">
                                <h2 className="title float-left">All Courses</h2>
                            </header>
                            <div className="content-body">    


                            <div className="row">
                                    <div className="col-12">


                                <Courseslist courses={courses} />

                                    </div>
                                </div>
                            </div>
                        </section></div>



           
                                
                        </Col>

                    </Row>
                </div>
            </div>
        );
    }
}

export default Course;
