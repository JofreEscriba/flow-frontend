import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Modal, Form, Table, Alert, Spinner, InputGroup } from 'react-bootstrap';
// import HeaderBread from '../../../components/partials/components/header-breadcrumb'; // Descomentar si es necessari

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentService, setCurrentService] = useState(null); // Per editar
    const [isEditMode, setIsEditMode] = useState(false);

    const [filterStartDate, setFilterStartDate] = useState('');

    // Funció per obtenir el token (exemple, ajustar segons l'aplicació)
    const getToken = () => localStorage.getItem('token');

    const apiBaseUrl = 'http://localhost:5000'; // URL del servidor proxy Node.js

    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = getToken();
            const response = await fetch(`${apiBaseUrl}/services`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status} en obtenir serveis`);
            }
            const data = await response.json();
            setServices(data); // L'API backend retorna directament l'array de serveis
        } catch (err) {
            setError(err);
            console.error("Error a fetchServices:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleShowCreateModal = () => {
        setIsEditMode(false);
        setCurrentService(null); // Resetejar per si de cas
        setShowModal(true);
    };

    const handleShowEditModal = (service) => {
        setIsEditMode(true);
        setCurrentService(service);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentService(null);
        // Podria ser útil resetejar els errors del formulari aquí
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const serviceData = Object.fromEntries(formData.entries());
        
        // Assegurar que price és un número
        serviceData.price = parseFloat(serviceData.price);
        if (isNaN(serviceData.price)) {
            alert('El preu ha de ser un número.');
            return;
        }

        // Assegurar que customer_id i sale_id són números si existeixen
        // Aquests camps no estan al formulari base, s'haurien d'afegir si són necessaris
        // Per ara, el backend els requereix per 'store', així que el formulari hauria de tenir-los
        // O la validació del backend hauria de ser més flexible per a l'actualització parcial
        if (serviceData.customer_id) serviceData.customer_id = parseInt(serviceData.customer_id, 10);
        if (serviceData.sale_id) serviceData.sale_id = parseInt(serviceData.sale_id, 10);


        setIsLoading(true); // Podria ser un altre estat per al formulari
        setError(null);

        const method = isEditMode ? 'PUT' : 'POST';
        const url = isEditMode ? `${apiBaseUrl}/services/${currentService.id}` : `${apiBaseUrl}/services`;

        try {
            const token = getToken();
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(serviceData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Tractar errors de validació
                if (response.status === 422 && errorData.errors) {
                    const errorMessages = Object.values(errorData.errors).flat().join('\n');
                    throw new Error(`Errors de validació: \n${errorMessages}`);
                }
                throw new Error(errorData.message || `Error ${response.status} al ${isEditMode ? 'actualitzar' : 'crear'} el servei`);
            }
            
            await response.json(); // Processar la resposta si cal
            fetchServices(); // Recarregar la llista
            handleCloseModal();
        } catch (err) {
            setError(err);
            console.error("Error a handleFormSubmit:", err);
            // No tanquem el modal si hi ha error per a que l'usuari pugui corregir
        } finally {
            setIsLoading(false); // Finalitzar l'estat de càrrega del formulari
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!window.confirm("Estàs segur que vols eliminar aquest servei?")) {
            return;
        }
        setIsLoading(true); // Podria ser un altre estat per a l'acció específica
        setError(null);
        try {
            const token = getToken();
            const response = await fetch(`${apiBaseUrl}/services/${serviceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (!response.ok && response.status !== 204) { // 204 No Content és una resposta OK per DELETE
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status} a l'eliminar el servei`);
            }
            fetchServices(); // Recarregar la llista
        } catch (err) {
            setError(err);
            console.error("Error a handleDeleteService:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredServices = services.filter(service => {
        if (!filterStartDate) return true;
        // Assegurem que comparem només la part de la data (YYYY-MM-DD)
        const serviceDate = service.start_date.substring(0, 10);
        return serviceDate >= filterStartDate;
    });

    return (
        <>
            {/* <HeaderBread title="Gestió de Serveis" /> */}
            <Row>
                <Col lg="12">
                    <Card>
                        <Card.Header>
                            <div className="d-flex justify-content-between align-items-center">
                                <h3>Gestió de Serveis</h3>
                                <Button variant="primary" onClick={handleShowCreateModal}>Crear Servei</Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm="3" md="2">Filtrar per data d'inici (des de):</Form.Label>
                                <Col sm="9" md="4">
                                    <Form.Control 
                                        type="date" 
                                        value={filterStartDate} 
                                        onChange={(e) => setFilterStartDate(e.target.value)} 
                                    />
                                </Col>
                            </Form.Group>

                            {isLoading && !showModal && (
                                <div className="text-center">
                                    <Spinner animation="border" variant="primary" />
                                    <p>Carregant serveis...</p>
                                </div>
                            )}
                            {error && <Alert variant="danger">Error: {error.message}</Alert>}
                            
                            {!isLoading && !error && filteredServices.length === 0 && !filterStartDate && (
                                <p>No hi ha serveis per mostrar. Crea'n un!</p>
                            )}
                            {!isLoading && !error && filteredServices.length === 0 && filterStartDate && (
                                <p>No s'han trobat serveis amb els filtres aplicats.</p>
                            )}

                            {!isLoading && !error && filteredServices.length > 0 && (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Nom del Servei</th>
                                            <th>Client</th>
                                            <th>Venda ID</th>
                                            <th>Preu</th>
                                            <th>Estat</th>
                                            <th>Data Inici</th>
                                            <th>Data Fi</th>
                                            <th>Accions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredServices.map(service => (
                                            <tr key={service.id}>
                                                <td>{service.id}</td>
                                                <td>{service.service_name}</td>
                                                <td>{service.customer ? `${service.customer.name} (ID: ${service.customer.customer_id})` : 'N/A'}</td>
                                                <td>{service.sale_id}</td>
                                                <td>{service.price} €</td>
                                                <td>{service.status}</td>
                                                <td>{new Date(service.start_date).toLocaleDateString()}</td>
                                                <td>{service.end_date ? new Date(service.end_date).toLocaleDateString() : '-'}</td>
                                                <td>
                                                    <Button variant="info" size="sm" className="me-2" onClick={() => handleShowEditModal(service)}>Editar</Button>
                                                    <Button variant="danger" size="sm" onClick={() => handleDeleteService(service.id)}>Eliminar</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Editar Servei' : 'Crear Nou Servei'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">Error: {error.message}</Alert>} 
                    <Form onSubmit={handleFormSubmit}>
                        {/* Camps del formulari basats en el backend (ServicesController@store) */}
                        {/* customer_id i sale_id són requerits pel backend per crear. S'haurien d'obtenir d'un selector o similar */}
                        {/* Per simplicitat, els poso com a text, però en una app real serien dropdowns */}
                        <Form.Group className="mb-3" controlId="formCustomer_id">
                            <Form.Label>ID Client (*)</Form.Label>
                            <Form.Control type="number" name="customer_id" defaultValue={currentService?.customer_id} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formSale_id">
                            <Form.Label>ID Venda (*)</Form.Label>
                            <Form.Control type="number" name="sale_id" defaultValue={currentService?.sale_id} required />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formServiceName">
                            <Form.Label>Nom del Servei (*)</Form.Label>
                            <Form.Control type="text" name="service_name" defaultValue={currentService?.service_name} required maxLength="255" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formDescription">
                            <Form.Label>Descripció (*)</Form.Label>
                            <Form.Control as="textarea" rows={3} name="description" defaultValue={currentService?.description} required />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPrice">
                            <Form.Label>Preu (*)</Form.Label>
                            <Form.Control type="number" name="price" defaultValue={currentService?.price} required min="0" step="0.01" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formStatus">
                            <Form.Label>Estat (*)</Form.Label>
                            <Form.Select name="status" defaultValue={currentService?.status || 'pending'} required>
                                <option value="pending">Pendent</option>
                                <option value="in_progress">En Progrés</option>
                                <option value="completed">Completat</option>
                                <option value="cancelled">Cancel·lat</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formStartDate">
                            <Form.Label>Data d'Inici (*)</Form.Label>
                            <Form.Control type="date" name="start_date" defaultValue={currentService?.start_date ? currentService.start_date.substring(0,10) : ''} required />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formEndDate">
                            <Form.Label>Data de Fi</Form.Label>
                            <Form.Control type="date" name="end_date" defaultValue={currentService?.end_date ? currentService.end_date.substring(0,10) : ''} />
                        </Form.Group>
                        
                        <p>(*) Camps obligatoris</p>

                        <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                            Cancel·lar
                        </Button>
                        <Button variant="primary" type="submit" disabled={isLoading}> {/* Deshabilitar botó mentre carrega */}
                            {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : (isEditMode ? 'Guardar Canvis' : 'Crear Servei')}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ServicesPage;