import React, { useState } from 'react'
import { Col, Row, Table, Card, Button, Form, Modal, Badge, InputGroup } from 'react-bootstrap'

const Pricing = () => {
    const [proposals, setProposals] = useState([
        {
            id: 'PROP-001',
            client: 'Empresa ABC',
            service: 'API de Pagaments',
            amount: 2500,
            status: 'pending',
            date: '2024-01-15',
            description: 'Integració completa d\'API de pagaments amb Stripe'
        },
        {
            id: 'PROP-002',
            client: 'TechCorp SL',
            service: 'Microservei d\'Autenticació',
            amount: 1800,
            status: 'accepted',
            date: '2024-01-10',
            description: 'Sistema d\'autenticació OAuth2 personalitzat'
        },
        {
            id: 'PROP-003',
            client: 'StartupXYZ',
            service: 'API de Notificacions',
            amount: 1200,
            status: 'rejected',
            date: '2024-01-08',
            description: 'Servei de notificacions push i email'
        }
    ])
    
    const [sales, setSales] = useState([
        {
            id: 'SALE-001',
            proposalId: 'PROP-002',
            client: 'TechCorp SL',
            service: 'Microservei d\'Autenticació',
            amount: 1800,
            date: '2024-01-12',
            status: 'completed'
        }
    ])
    
    const [showModal, setShowModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('proposals')
    const [newProposal, setNewProposal] = useState({
        client: '',
        service: '',
        amount: '',
        description: ''
    })

    const handleCreateProposal = () => {
        const proposal = {
            id: `PROP-${String(proposals.length + 1).padStart(3, '0')}`,
            ...newProposal,
            amount: parseFloat(newProposal.amount),
            status: 'pending',
            date: new Date().toISOString().split('T')[0]
        }
        setProposals([...proposals, proposal])
        setNewProposal({ client: '', service: '', amount: '', description: '' })
        setShowModal(false)
    }

    const handleProposalAction = (proposalId, action) => {
        setProposals(proposals.map(proposal => {
            if (proposal.id === proposalId) {
                const updatedProposal = { ...proposal, status: action }
                
                // Conversió automàtica a venda si s'accepta
                if (action === 'accepted') {
                    const newSale = {
                        id: `SALE-${String(sales.length + 1).padStart(3, '0')}`,
                        proposalId: proposal.id,
                        client: proposal.client,
                        service: proposal.service,
                        amount: proposal.amount,
                        date: new Date().toISOString().split('T')[0],
                        status: 'active'
                    }
                    setSales([...sales, newSale])
                }
                
                return updatedProposal
            }
            return proposal
        }))
    }

    const filteredProposals = proposals.filter(proposal => 
        proposal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.service.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredSales = sales.filter(sale => 
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.service.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            accepted: 'success',
            rejected: 'danger',
            active: 'primary',
            completed: 'success'
        }
        const labels = {
            pending: 'Pendiente',
            accepted: 'Aceptada',
            rejected: 'Denegada',
            active: 'Activa',
            completed: 'Completada'
        }
        return <Badge bg={variants[status]}>{labels[status]}</Badge>
    }

    return (
        <div>
            <Row className="mb-4">
                <Col md="12">
                    <div className="d-flex align-items-right">
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            <i className="fas fa-plus me-2"></i>
                            Nueva propuesta
                        </Button>
                    </div>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md="12">
                    <Card>
                        <Card.Header>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <Button 
                                        variant={activeTab === 'proposals' ? 'primary' : 'outline-primary'}
                                        className="me-2"
                                        onClick={() => setActiveTab('proposals')}
                                    >
                                        Propuestas
                                    </Button>
                                    <Button 
                                        variant={activeTab === 'sales' ? 'primary' : 'outline-primary'}
                                        onClick={() => setActiveTab('sales')}
                                    >
                                        Ventas
                                    </Button>
                                </div>
                                <InputGroup style={{ width: '300px' }}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Id, cliente, servicio..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <InputGroup.Text>
                                        <i className="fas fa-search"></i>
                                    </InputGroup.Text>
                                </InputGroup>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {activeTab === 'proposals' ? (
                                <Table responsive hover>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Cliente</th>
                                            <th>Servicio</th>
                                            <th>Importe</th>
                                            <th>Fecha</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProposals.map(proposal => (
                                            <tr key={proposal.id}>
                                                <td><strong>{proposal.id}</strong></td>
                                                <td>{proposal.client}</td>
                                                <td>{proposal.service}</td>
                                                <td>€{proposal.amount.toLocaleString()}</td>
                                                <td>{proposal.date}</td>
                                                <td>{getStatusBadge(proposal.status)}</td>
                                                <td>
                                                    {proposal.status === 'pending' && (
                                                        <>
                                                            <Button 
                                                                size="sm" 
                                                                variant="success" 
                                                                className="me-2"
                                                                onClick={() => handleProposalAction(proposal.id, 'accepted')}
                                                            >
                                                                Aceptar
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="danger"
                                                                onClick={() => handleProposalAction(proposal.id, 'rejected')}
                                                            >
                                                                Denegar
                                                            </Button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <Table responsive hover>
                                    <thead>
                                        <tr>
                                            <th>ID Venda</th>
                                            <th>ID Proposta</th>
                                            <th>Client</th>
                                            <th>Servei</th>
                                            <th>Import</th>
                                            <th>Data</th>
                                            <th>Estat</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSales.map(sale => (
                                            <tr key={sale.id}>
                                                <td><strong>{sale.id}</strong></td>
                                                <td>{sale.proposalId}</td>
                                                <td>{sale.client}</td>
                                                <td>{sale.service}</td>
                                                <td>€{sale.amount.toLocaleString()}</td>
                                                <td>{sale.date}</td>
                                                <td>{getStatusBadge(sale.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal per crear nova proposta */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Nova Proposta de Microservei</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md="6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Cliente</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newProposal.client}
                                        onChange={(e) => setNewProposal({...newProposal, client: e.target.value})}
                                        placeholder="Nombre del cliente"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md="6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Tipo de servicio</Form.Label>
                                    <Form.Select
                                        value={newProposal.service}
                                        onChange={(e) => setNewProposal({...newProposal, service: e.target.value})}
                                    >
                                        <option value="">Selecciona un servicio</option>
                                        <option value="API de Pagaments">API de pagos</option>
                                        <option value="Microservei d'Autenticació">Microservicio de autenticación"</option>
                                        <option value="API de Notificacions">API de notificaciones</option>
                                        <option value="Servei de Geolocalització">Servicio de geolocalización</option>
                                        <option value="API de Gestió d'Usuaris">API de gestión de usuarios</option>
                                        <option value="Microservei de Reporting">Microservicio de reporting</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Importe (€)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={newProposal.amount}
                                        onChange={(e) => setNewProposal({...newProposal, amount: e.target.value})}
                                        placeholder="0.00"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={newProposal.description}
                                onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                                placeholder="Una descripción detallada del servicio que pides"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleCreateProposal}
                        disabled={!newProposal.client || !newProposal.service || !newProposal.amount}
                    >
                        Crear propuesta
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Pricing
