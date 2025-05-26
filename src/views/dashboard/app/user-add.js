import React from 'react'
import {Row,Col,Image,Form,Button} from 'react-bootstrap'
import Card from '../../../components/Card'

// img
import avatars1 from '../../../assets/images/avatars/01.png'

const UserAdd =() =>{
  return(
      <>
        <div>
            <Row>
               <Col xl="3" lg="4" className="">
                  <Card>
                     <Card.Header className="d-flex justify-content-between">
                        <div className="header-title">
                           <h4 className="card-title">Añadir usuarios</h4>
                        </div>
                     </Card.Header>
                     <Card.Body>
                        <Form>
                           <Form.Group className="form-group">
                              <div className="profile-img-edit position-relative">
                                 <Image className="theme-color-default-img  profile-pic rounded avatar-100" src={avatars1} alt="profile-pic"/>
                              </div>
                           </Form.Group>
                           <Form.Group className="form-group">
                              <Form.Label>Rol del usuario:</Form.Label>
                              <select name="type" className="selectpicker form-control" data-style="py-0">
                                 <option>Seleccionar</option>
                                 <option>1</option>
                              </select>
                           </Form.Group>
                        </Form>
                     </Card.Body>
                  </Card>
               </Col>
               <Col xl="9" lg="8">
                  <Card>
                     <Card.Header className="d-flex justify-content-between">
                        <div className="header-title">
                           <h4 className="card-title">Información del nuevo usuario</h4>
                        </div>
                     </Card.Header>
                     <Card.Body>
                        <div className="new-user-info">
                           <form>
                              <div className="row">
                                 <Form.Group className="col-md-6  form-group">
                                    <Form.Label htmlFor="email">Email:</Form.Label>
                                    <Form.Control type="email"  id="email" placeholder="Email"/>
                                 </Form.Group>
                                 <Form.Group className="col-md-6 form-group">
                                    <Form.Label htmlFor="uname">Nombre:</Form.Label>
                                    <Form.Control type="text"  id="uname" placeholder="Nombre"/>
                                 </Form.Group>
                                 <Form.Group className="col-md-6 form-group">
                                    <Form.Label htmlFor="pass">Contraseña:</Form.Label>
                                    <Form.Control type="password"  id="pass" placeholder="Contraseña"/>
                                 </Form.Group>
                                 <Form.Group className="col-md-6 form-group">
                                    <Form.Label htmlFor="rpass">Repetir contraseña:</Form.Label>
                                    <Form.Control type="password"  id="rpass" placeholder="Repetir contraseña"/>
                                 </Form.Group>
                              </div>
                              <Button type="button" variant="btn btn-primary">Añadir usuario</Button>
                           </form>
                        </div>
                     </Card.Body>
                  </Card>
               </Col>
            </Row>
         </div>
      </>
  )

}

export default UserAdd;