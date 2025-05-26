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
                           <h4 className="card-title">Add New User</h4>
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
                              <Form.Label>User Role:</Form.Label>
                              <select name="type" className="selectpicker form-control" data-style="py-0">
                                 <option>Select</option>
                                 <option>Web Designer</option>
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
                           <h4 className="card-title">New User Information</h4>
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
                                    <Form.Label htmlFor="uname">User Name:</Form.Label>
                                    <Form.Control type="text"  id="uname" placeholder="User Name"/>
                                 </Form.Group>
                                 <Form.Group className="col-md-6 form-group">
                                    <Form.Label htmlFor="pass">Password:</Form.Label>
                                    <Form.Control type="password"  id="pass" placeholder="Password"/>
                                 </Form.Group>
                                 <Form.Group className="col-md-6 form-group">
                                    <Form.Label htmlFor="rpass">Repeat Password:</Form.Label>
                                    <Form.Control type="password"  id="rpass" placeholder="Repeat Password "/>
                                 </Form.Group>
                                
                              </div>
                              <div className="checkbox">
                                 <label className="form-label"><input type="checkbox" className="me-2 form-check-input"  value="" id="flexCheckChecked"/>Enable Two-Factor-Authentication</label>
                              </div>
                              <Button type="button" variant="btn btn-primary">Add New User</Button>
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