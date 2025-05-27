import React, { useState, useEffect } from "react";
import { Col, Row, Card, Form, Button, Table, Modal, Badge, Dropdown } from "react-bootstrap";
import axios from "axios";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ServicesManagement = () => {
  // Estats per gestionar els serveis i formularis
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estats per filtres
  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  
  // Estats per formulari
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: "",
    sale_id: "",
    name: "",
    description: "",

    status: "pending",
    created_at: new Date(),
    updated_at: null
  });

  // Obtenir el token d'autenticació

   const getToken = () => {
        return localStorage.getItem('token')
    }

  const getAuthToken = () => {
    const token = getToken()
    // const user = JSON.parse(localStorage.getItem("user"));
    return token ? `Bearer ${token}` : '';
  };

  // Funció per carregar els serveis
  const loadServices = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No s'ha trobat el token d'autenticació");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:5000/services", {
        headers: { Authorization: token }
      });

      setServices(response.data);
      setError(null);
    } catch (err) {
      setError("Error en carregar els serveis: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Funció per carregar els clients
  const loadCustomers = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get("http://localhost:5000/customers", {
        headers: { Authorization: token }
      });

      setCustomers(response.data);
    } catch (err) {
      console.error("Error en carregar els clients:", err);
    }
  };

  // Funció per carregar les vendes
  const loadSales = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get("http://localhost:5000/sales", {
        headers: { Authorization: token }
      });

      setSales(response.data);
    } catch (err) {
      console.error("Error en carregar les vendes:", err);
    }
  };

  // Carregar dades inicials
  useEffect(() => {
    loadServices();
    loadCustomers();
    loadSales();
  }, []);

  // Gestionar canvis al formulari
  const handleInputChange = (e) => {
    console.log("Canvi de formulari:", e.target.name, e.target.value); // DEBUG
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Gestionar canvis de dates
  const handleDateChange = (date, field) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  // Obrir modal per crear nou servei
  const handleNewService = () => {
    setEditingService(null);
    setFormData({
      customer_id: "",
      sale_id: "",
      name: "",
      description: "",

      status: "pending",
      created_at: new Date(),
      updated_at: null
    });
    setShowModal(true);
  };

  // Obrir modal per editar servei existent
  const handleEditService = (service) => {
    setEditingService(service);
    setFormData({
      customer_id: service.customer_id,
      sale_id: service.sale_id,
      name: service.name,
      description: service.description,

      status: service.status,
      created_at: new Date(service.created_at),
      updated_at: service.updated_at ? new Date(service.updated_at) : null
    });
    setShowModal(true);
  };

  // Guardar servei (crear o actualitzar)
  const handleSaveService = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No s'ha trobat el token d'autenticació");
        return;
      }

      // Validar formulari
      if (!formData.customer_id || !formData.sale_id || !formData.name || !formData.description || !formData.status || !formData.created_at) {
        setError("Tots els camps obligatoris han de ser completats");
        console.log("customer_id:", formData.customer_id);
        console.log("sale_id:", formData.sale_id);
        console.log("name:", formData.name);
        console.log("description:", formData.description);
        console.log("status:", formData.status);
        console.log("created_at:", formData.created_at);
        console.log("updated_at:", formData.updated_at);
        return;
      }

      // Preparar dades
      const serviceData = {
        ...formData,
       
      };

      if (editingService) {
        // Actualitzar servei existent
        await axios.put(`http://localhost:5000/services/${editingService.service_id}`, serviceData, {
          headers: { Authorization: token }
        });
      } else {
        // Crear nou servei
        await axios.post("http://localhost:5000/services", serviceData, {
          headers: { Authorization: token }
        });
      }

      // Tancar modal i recarregar serveis
      setShowModal(false);
      loadServices();
      setError(null);
    } catch (err) {
      setError("Error en guardar el servei: " + (err.response?.data?.message || err.message));
    }
  };

  // Eliminar servei
  const handleDeleteService = async (service_id) => {
    if (window.confirm("Estàs segur que vols eliminar aquest servei?")) {
      try {
        const token = getAuthToken();
        if (!token) {
          setError("No s'ha trobat el token d'autenticació");
          return;
        }

        console.log("Eliminant servei amb ID:", service_id); // DEBUG
        await axios.delete(`http://localhost:5000/services/${service_id}`, {
          headers: { Authorization: token }
        });

        loadServices();
      } catch (err) {
        setError("Error en eliminar el servei: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // Filtrar serveis
  const filteredServices = services.filter(service => {
    // Filtre per estat
    if (statusFilter && service.status !== statusFilter) {
      return false;
    }
    
    // Filtre per client
    if (customerFilter && service.customer_id !== customerFilter) {
      return false;
    }
    
    // Filtre per data d'inici
    if (startDateFilter) {
      const serviceStartDate = new Date(service.created_at);
      const filterDate = new Date(startDateFilter);
      filterDate.setHours(0, 0, 0, 0);
      if (serviceStartDate < filterDate) {
        return false;
      }
    }
    
    // Filtre per data final
    if (endDateFilter) {
      const serviceStartDate = new Date(service.created_at);
      const filterDate = new Date(endDateFilter);
      filterDate.setHours(23, 59, 59, 999);
      if (serviceStartDate > filterDate) {
        return false;
      }
    }
    
    return true;
  });

  // Funció per obtenir el nom del client
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.customer_id === customerId);
    return customer ? customer.name : 'Desconegut';
  };

  // Funció per obtenir el color segons l'estat
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Funció per obtenir el text de l'estat en català
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendent';
      case 'in_progress': return 'En progrés';
      case 'completed': return 'Completat';
      case 'cancelled': return 'Cancel·lat';
      default: return status;
    }
  };

  // Funció per formatar la data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES');
  };

  return (
    <>
      <Row>
        <Col md="12">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="card-title">Gestió de Serveis</h4>
              <Button variant="primary" onClick={handleNewService}>
                Nou Servei
              </Button>
            </Card.Header>
            <Card.Body>
              {error && <div className="alert alert-danger">{error}</div>}
              
              {/* Filtres */}
              <Row className="mb-4">
                <Col md="3">
                  <Form.Group>
                    <Form.Label>Data d'inici (des de)</Form.Label>
                    <DatePicker
                      selected={startDateFilter}
                      onChange={(date) => setStartDateFilter(date)}
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                      isClearable
                    />
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group>
                    <Form.Label>Data d'inici (fins a)</Form.Label>
                    <DatePicker
                      selected={endDateFilter}
                      onChange={(date) => setEndDateFilter(date)}
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                      isClearable
                    />
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group>
                    <Form.Label>Estat</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="pending">Pendent</option>
                      <option value="in_progress">En progrés</option>
                      <option value="completed">Completat</option>
                      <option value="cancelled">Cancel·lat</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group>
                    <Form.Label>Client</Form.Label>
                    <Form.Select
                      value={customerFilter}
                      onChange={(e) => setCustomerFilter(e.target.value)}
                    >
                      <option value="">Tots els clients</option>
                      {customers.map(customer => (
                        <option key={customer.customer_id} value={customer.customer_id}>
                          {customer.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Taula de serveis */}
              {loading ? (
                <div className="text-center">Carregant serveis...</div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Nom del Servei</th>
                      <th>Client</th>
                      <th>Preu</th>
                      <th>Estat</th>
                      <th>Data d'inici</th>
                      <th>Data final</th>
                      <th>Accions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">No s'han trobat serveis</td>
                      </tr>
                    ) : (
                      filteredServices.map(service => (
                        <tr key={service.id}>
                          <td>{service.name}</td>
                          <td>{getCustomerName(service.customer_id)}</td>
                          
                          <td>
                            <Badge bg={getStatusBadgeVariant(service.status)}>
                              {getStatusText(service.status)}
                            </Badge>
                          </td>
                          <td>{formatDate(service.created_at)}</td>
                          <td>{formatDate(service.updated_at)}</td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle variant="light" size="sm" id={`dropdown-${service.service_id}`}>
                                Accions
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleEditService(service)}>
                                  Editar
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleDeleteService(service.service_id)}
                                  className="text-danger"
                                >
                                  Eliminar
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item as={Link} to={`/dashboard/calendar?service_id=${service.service_id}`}>
                                  Veure al calendari
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal per crear/editar serveis */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingService ? "Editar Servei" : "Nou Servei"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>Client *</Form.Label>
                  <Form.Select
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona un client</option>
                    {customers.map(customer => (
                      <option key={customer.customer_id} value={customer.customer_id}>
                        {customer.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>Venda *</Form.Label>
                  <Form.Select
                    name="sale_id"
                    value={formData.sale_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona una venda</option>
                    {sales.map(sale => (
                      <option key={sale.sale_id} value={sale.sale_id}>
                        {sale.sale_id} - {formatDate(sale.date)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Nom del Servei *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripció *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md="4">
                <Form.Group className="mb-3">
                  <Form.Label>Estat *</Form.Label>
                   <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="pending">Pendent</option>
                    <option value="in_progress">En progrés</option>
                    <option value="completed">Completat</option>
                    <option value="cancelled">Cancel·lat</option>
                  </Form.Select>

                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>Data d'inici *</Form.Label>
                  <DatePicker
                    selected={formData.created_at}
                    onChange={(date) => handleDateChange(date, 'created_at')}
                    className="form-control"
                    dateFormat="dd/MM/yyyy"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>Data final</Form.Label>
                  <DatePicker
                    selected={formData.updated_at}
                    onChange={(date) => handleDateChange(date, 'updated_at')}
                    className="form-control"
                    dateFormat="dd/MM/yyyy"
                    isClearable
                    minDate={formData.created_at}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel·lar
          </Button>
          <Button variant="primary" onClick={handleSaveService}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ServicesManagement;  