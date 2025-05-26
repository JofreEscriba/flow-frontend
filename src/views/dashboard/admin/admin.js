import React, { useState, useEffect } from 'react'
import { Row, Col, Modal, Form, Button, Alert, Spinner } from 'react-bootstrap'
import Card from '../../../components/Card'

const Admin = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showUserRoleModal, setShowUserRoleModal] = useState(false)

    // Estados para datos
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedRole, setSelectedRole] = useState('')

    // Roles predefinidos
    const availableRoles = ['admin', 'user', 'moderator']

    // Permisos por rol
    const rolePermissions = {
        admin: ['Gestionar Usuarios', 'Gestionar Roles', 'Ver Dashboard', 'Gestionar Clientes', 'Gestionar Ventas', 'Gestionar Servicios'],
        moderator: ['Ver Dashboard', 'Gestionar Clientes', 'Gestionar Ventas', 'Gestionar Servicios'],
        user: ['Ver Dashboard']
    }

    // Obtener token del localStorage
    const getToken = () => {
        return localStorage.getItem('token')
    }

    // Headers para las peticiones
    const getHeaders = () => {
        const token = getToken()
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        }
    }

    // Cargar usuarios al montar el componente
    useEffect(() => {
        fetchUsers()
    })

    // Función para obtener usuarios
    const fetchUsers = async () => {
        setLoading(true)
        setError('')
        
        try {
            const response = await fetch('http://localhost:5000/users', {
                method: 'GET',
                headers: getHeaders()
            })

            const data = await response.json()

            if (response.ok) {
                setUsers(data || [])
            } else {
                setError('Error al cargar usuarios')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    // Función para actualizar rol de usuario
    const updateUserRole = async (userId, newRole) => {
        setLoading(true)
        setError('')
        
        try {
            const response = await fetch(`http://flow-backend.test/api/users/${userId}/role`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ role: newRole })
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess('Rol actualizado correctamente')
                fetchUsers() // Recargar usuarios
                setShowUserRoleModal(false)
                setSelectedUser(null)
                setSelectedRole('')
                
                // Limpiar mensaje después de 3 segundos
                setTimeout(() => setSuccess(''), 3000)
            } else {
                setError(data.message || 'Error al actualizar rol')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    // Manejar apertura del modal para asignar rol
    const handleAssignRole = (user) => {
        setSelectedUser(user)
        setSelectedRole(user.role || 'user')
        setShowUserRoleModal(true)
    }

    // Manejar confirmación de cambio de rol
    const handleConfirmRoleChange = () => {
        if (selectedUser && selectedRole) {
            updateUserRole(selectedUser.id, selectedRole)
        }
    }

    return (
        <>
            <Row>
                <Col sm="12">
                    <Card>
                        <Card.Header className="d-flex justify-content-between flex-wrap">
                            <div className="header-title">
                                <h4 className="card-title mb-0">Gestión de Roles y Usuarios</h4>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {/* Mensajes de estado */}
                            {error && (
                                <Alert variant="danger" dismissible onClose={() => setError('')}>
                                    {error}
                                </Alert>
                            )}
                            {success && (
                                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                                    {success}
                                </Alert>
                            )}

                            {loading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </Spinner>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Usuario</th>
                                                <th>Email</th>
                                                <th>Rol Actual</th>
                                                <th>Permisos</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length > 0 ? (
                                                users.map((user) => (
                                                    <tr key={user.id}>
                                                        <td>{user.name}</td>
                                                        <td>{user.email}</td>
                                                        <td>
                                                            <span className={`badge ${
                                                                user.role === 'admin' ? 'bg-danger' :
                                                                user.role === 'moderator' ? 'bg-warning' : 'bg-primary'
                                                            }`}>
                                                                {user.role || 'user'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <small>
                                                                {rolePermissions[user.role || 'user']?.join(', ') || 'Sin permisos'}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-primary"
                                                                onClick={() => handleAssignRole(user)}
                                                            >
                                                                Cambiar Rol
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center">
                                                        No hay usuarios disponibles
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Tabla de permisos por rol */}
                            <div className="mt-4">
                                <h5>Matriz de Permisos por Rol</h5>
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Permiso</th>
                                                {availableRoles.map(role => (
                                                    <th key={role} className="text-center text-capitalize">
                                                        {role}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...new Set(Object.values(rolePermissions).flat())].map(permission => (
                                                <tr key={permission}>
                                                    <td>{permission}</td>
                                                    {availableRoles.map(role => (
                                                        <td key={role} className="text-center">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={rolePermissions[role]?.includes(permission) || false}
                                                                readOnly
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal para asignar rol a usuario */}
            <Modal show={showUserRoleModal} onHide={() => setShowUserRoleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Asignar Rol a Usuario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <>
                            <p><strong>Usuario:</strong> {selectedUser.name}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Rol actual:</strong> {selectedUser.role || 'user'}</p>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Nuevo Rol</Form.Label>
                                <Form.Select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    {availableRoles.map(role => (
                                        <option key={role} value={role} className="text-capitalize">
                                            {role}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {selectedRole && (
                                <div className="mt-3">
                                    <strong>Permisos del rol {selectedRole}:</strong>
                                    <ul className="mt-2">
                                        {rolePermissions[selectedRole]?.map(permission => (
                                            <li key={permission}>{permission}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="primary" 
                        onClick={handleConfirmRoleChange}
                        disabled={loading}
                    >
                        {loading ? 'Actualizando...' : 'Actualizar Rol'}
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowUserRoleModal(false)}
                    >
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default Admin