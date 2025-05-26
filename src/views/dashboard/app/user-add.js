import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Image, Form, Button } from 'react-bootstrap'
import Card from '../../../components/Card'

// img
import avatars1 from '../../../assets/images/avatars/01.png'

const UserAdd = () => {
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== repeatPassword) {
      alert('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          email: email,
          password: password,
          country: country
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('Registro exitoso:', data)
        alert('Usuario creado exitosamente.')
      } else {
        console.error('Error en Sign Up:', data.message)
        alert(data.message || 'Error en el registro')
      }
    } catch (error) {
      console.error('Error al conectar con el backend:', error)
      alert('Error al conectar con el servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Row>
        <Col xl="3" lg="4">
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
                    <Image className="theme-color-default-img  profile-pic rounded avatar-100" src={avatars1} alt="profile-pic" />
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
                <Form onSubmit={handleSubmit}>
                  <div className="row">
                    <Form.Group className="col-md-4 form-group">
                      <Form.Label htmlFor="uname">Nombre:</Form.Label>
                      <Form.Control
                        type="text"
                        id="uname"
                        placeholder="Nombre"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="col-md-5  form-group">
                      <Form.Label htmlFor="email">Email:</Form.Label>
                      <Form.Control
                        type="email"
                        id="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="col-md-3 form-group">
                      <Form.Label htmlFor="country">País:</Form.Label>
                      <Form.Control
                        type="text"
                        id="country"
                        placeholder="País"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="col-md-6 form-group">
                      <Form.Label htmlFor="pass">Contraseña:</Form.Label>
                      <Form.Control
                        type="password"
                        id="pass"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="col-md-6 form-group">
                      <Form.Label htmlFor="rpass">Repetir contraseña:</Form.Label>
                      <Form.Control
                        type="password"
                        id="rpass"
                        placeholder="Repetir contraseña"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </div>
                  <Button type="submit" variant="primary" disabled={isLoading}>
                    {isLoading ? 'Registrando...' : 'Añadir usuario'}
                  </Button>
                </Form>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default UserAdd
