import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Chart from 'react-apexcharts';

// Import selectors & action from setting store
import * as SettingSelector from "../../store/setting/selectors";

// Redux Selector / Action
import { useSelector } from "react-redux";

const Index = () => {
  const appName = useSelector(SettingSelector.app_name);
  
  // State for dashboard data
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // Get token from localStorage
  const token = localStorage.getItem('token');
  const authHeader = token ? `Bearer ${token}` : '';

  // Fetch data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch customers, sales, and services in parallel
        const [customersRes, salesRes, servicesRes] = await Promise.all([
          axios.get('http://localhost:5000/customers', {
            headers: { Authorization: authHeader }
          }),
          axios.get('http://localhost:5000/sales', {
            headers: { Authorization: authHeader }
          }),
          axios.get('http://localhost:5000/services', {
            headers: { Authorization: authHeader }
          })
        ]);

        setCustomers(customersRes.data || []);
        setSales(salesRes.data || []);
        setServices(servicesRes.data || []);

        // Generate recent activity based on timestamps from data
        generateRecentActivity(
          customersRes.data.customers || [], 
          salesRes.data.sales || [], 
          servicesRes.data.services || []
        );

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Error al cargar los datos del panel. Por favor, compruebe su conexión.");
        setLoading(false);
      }
    };

    if (authHeader) {
      fetchDashboardData();
    } else {
      setLoading(false);
      setError("Por favor, inicie sesión para ver los datos del panel");
    }
  }, [authHeader]);

  // Generate recent activity from data
  const generateRecentActivity = (customers, sales, services) => {
    const activities = [
      // From customers
      ...customers.slice(0, 5).map(customer => ({
        id: `customer-${customer.customer_id}`,
        type: 'customer',
        action: 'added',
        name: customer.name,
        timestamp: new Date(customer.created_at || Date.now()),
        details: `Nuevo cliente añadido: ${customer.name}`
      })),
      
      // From sales
      ...sales.slice(0, 5).map(sale => ({
        id: `sale-${sale.sale_id}`,
        type: 'sale',
        action: 'created',
        name: `Venta #${sale.sale_id}`,
        timestamp: new Date(sale.created_at || Date.now()),
        details: `Nueva venta creada por $${sale.price}`
      })),
      
      // From services
      ...services.slice(0, 5).map(service => ({
        id: `service-${service.service_id}`,
        type: 'service',
        action: 'updated',
        name: service.name,
        timestamp: new Date(service.updated_at || Date.now()),
        details: `Servicio actualizado: ${service.name}`
      }))
    ];
    
    // Sort by timestamp (newest first)
    activities.sort((a, b) => b.timestamp - a.timestamp);
    
    setRecentActivity(activities.slice(0, 10));
  };

  // Sales by month chart options
  const salesChartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 5
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    },
    yaxis: {
      title: {
        text: '$ (miles)'
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$ " + val + " miles"
        }
      }
    }
  };

  // Generate monthly sales data from sales array
  const generateMonthlySalesData = () => {
    const monthlyData = Array(12).fill(0);
    
    sales.forEach(sale => {
      const date = new Date(sale.creationDate || sale.created_at);
      const month = date.getMonth();
      monthlyData[month] += parseFloat(sale.price);
    });
    
    return [{
      name: 'Ventas',
      data: monthlyData.map(val => (val / 1000).toFixed(2)) // Convertir a miles
    }];
  };

  // Service status distribution chart
  const serviceStatusChartOptions = {
    chart: {
      type: 'donut',
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    labels: ['Pendiente', 'En Progreso', 'Completado', 'Cancelado'],
    colors: ['#FFC107', '#3F51B5', '#4CAF50', '#F44336']
  };

  // Generate service status data
  const generateServiceStatusData = () => {
    const statusCounts = {
      'pending': 0,
      'in progress': 0,
      'completed': 0,
      'cancelled': 0
    };
    
    services.forEach(service => {
      const status = service.state?.toLowerCase() || 'pending';
      if (status in statusCounts) {
        statusCounts[status]++;
      } else {
        statusCounts['pending']++;
      }
    });
    
    return Object.values(statusCounts);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'primary';
      case 'cancelled':
        return 'danger';
      case 'pending':
      default:
        return 'warning';
    }
  };

  // Calculate total revenue
  const calculateTotalRevenue = () => {
    return sales.reduce((total, sale) => total + parseFloat(sale.price || 0), 0).toFixed(2);
  };

  // Get recent customers
  const getRecentCustomers = () => {
    return customers
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  };

  // Get pending services count
  const getPendingServicesCount = () => {
    return services.filter(service => 
      service.state?.toLowerCase() === 'pending' || !service.state
    ).length;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ height: '80vh' }}>
        <h4 className="text-danger mb-3">{error}</h4>
        <Link to="/auth/sign-in" className="btn btn-primary">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col md="12">
          <Card className="mb-4">
            <Card.Body>
              <h4 className="card-title">Bienvenido al Panel de {appName}</h4>
              <p className="card-text">
                Aquí tienes una visión general del rendimiento de tu negocio y actividades recientes.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tarjetas de estadísticas */}
      <Row className="mb-4">
        <Col md="3">
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total de Clientes</h6>
                  <h3 className="mb-0">{customers.length}</h3>
                </div>
                <div className="bg-soft-primary rounded p-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.8877 10.8967C19.2827 10.7007 20.3567 9.50473 20.3597 8.05573C20.3597 6.62773 19.3187 5.44373 17.9537 5.21973" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M19.7285 14.2505C21.0795 14.4525 22.0225 14.9255 22.0225 15.9005C22.0225 16.5715 21.5785 17.0075 20.8605 17.2815" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M11.8867 14.6638C8.67273 14.6638 5.92773 15.1508 5.92773 17.0958C5.92773 19.0398 8.65573 19.5408 11.8867 19.5408C15.1007 19.5408 17.8447 19.0588 17.8447 17.1128C17.8447 15.1668 15.1177 14.6638 11.8867 14.6638Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M11.8869 11.888C13.9959 11.888 15.7059 10.179 15.7059 8.069C15.7059 5.96 13.9959 4.25 11.8869 4.25C9.7779 4.25 8.0679 5.96 8.0679 8.069C8.0599 10.171 9.7569 11.881 11.8589 11.888H11.8869Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M5.88509 10.8967C4.48909 10.7007 3.41609 9.50473 3.41309 8.05573C3.41309 6.62773 4.45409 5.44373 5.81909 5.21973" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M4.044 14.2505C2.693 14.4525 1.75 14.9255 1.75 15.9005C1.75 16.5715 2.194 17.0075 2.912 17.2815" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar now={100} variant="primary" className="mt-2" style={{ height: '4px' }} />
                <small className="text-success mt-2 d-block">
                  <i className="fa fa-arrow-up me-2"></i>
                  {getRecentCustomers().length} nuevos este mes
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md="3">
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total de Ventas</h6>
                  <h3 className="mb-0">{sales.length}</h3>
                </div>
                <div className="bg-soft-success rounded p-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.4184 6.47H16.6232C19.3152 6.47 21.5 8.72 21.5 11.48V17C21.5 19.76 19.3152 22 16.6232 22H7.3768C4.6848 22 2.5 19.76 2.5 17V11.48C2.5 8.72 4.6848 6.47 7.3768 6.47H7.58162C7.60113 5.27 8.05955 4.15 8.8886 3.31C9.72741 2.46 10.8003 2.03 12.0098 2C14.4286 2 16.4184 4.04 16.4184 6.47ZM9.91273 4.38C9.36653 4.94 9.06417 5.68 9.04466 6.47H14.9553C14.9261 4.83 13.6191 3.5 12.0098 3.5C11.2587 3.5 10.4784 3.81 9.91273 4.38ZM15.7064 10.32C16.116 10.32 16.4379 9.98 16.4379 9.57V8.91C16.4379 8.5 16.116 8.16 15.7064 8.16C15.3065 8.16 14.9748 8.5 14.9748 8.91V9.57C14.9748 9.98 15.3065 10.32 15.7064 10.32ZM8.93737 9.57C8.93737 9.98 8.6057 10.32 8.20585 10.32C7.80599 10.32 7.47432 9.98 7.47432 9.57V8.91C7.47432 8.5 7.80599 8.16 8.20585 8.16C8.6057 8.16 8.93737 8.5 8.93737 8.91V9.57Z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar now={75} variant="success" className="mt-2" style={{ height: '4px' }} />
                <small className="text-success mt-2 d-block">
                  <i className="fa fa-arrow-up me-2"></i>
                  ${calculateTotalRevenue()} total revenue
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md="3">
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total de Servicios</h6>
                  <h3 className="mb-0">{services.length}</h3>
                </div>
                <div className="bg-soft-warning rounded p-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M15.4316 14.9427L11.6616 12.6937V7.8457" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar now={60} variant="warning" className="mt-2" style={{ height: '4px' }} />
                <small className="text-warning mt-2 d-block">
                  <i className="fa fa-clock me-2"></i>
                  {getPendingServicesCount()} pending services
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md="3">
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Valor Promedio de Venta</h6>
                  <h3 className="mb-0">
                    ${sales.length > 0 
                      ? (calculateTotalRevenue() / sales.length).toFixed(2) 
                      : '0.00'}
                  </h3>
                </div>
                <div className="bg-soft-info rounded p-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.9951 16.6766V14.1396" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M18.19 5.33008C19.88 5.33008 21.24 6.70008 21.24 8.39008V11.8301C18.78 13.2701 15.53 14.1401 11.99 14.1401C8.45 14.1401 5.21 13.2701 2.75 11.8301V8.38008C2.75 6.69008 4.12 5.33008 5.81 5.33008H18.19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M15.4951 5.32576V4.95976C15.4951 3.73976 14.5051 2.74976 13.2851 2.74976H10.7051C9.48512 2.74976 8.49512 3.73976 8.49512 4.95976V5.32576" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M2.77441 15.4829L2.96341 17.9919C3.09141 19.6829 4.50041 20.9899 6.19541 20.9899H17.7944C19.4894 20.9899 20.8984 19.6829 21.0264 17.9919L21.2154 15.4829" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar now={85} variant="info" className="mt-2" style={{ height: '4px' }} />
                <small className="text-info mt-2 d-block">
                  <i className="fa fa-chart-line me-2"></i>
                  Basado en {sales.length} ventas
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col md="8">
          <Card className="mb-4">
            <Card.Body>
              <h5 className="card-title">Sales Performance</h5>
              <Chart 
                options={salesChartOptions} 
                series={generateMonthlySalesData()} 
                type="bar" 
                height={350} 
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md="4">
          <Card className="mb-4">
            <Card.Body>
              <h5 className="card-title">Service Status</h5>
              <Chart 
                options={serviceStatusChartOptions} 
                series={generateServiceStatusData()} 
                type="donut" 
                height={350} 
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity and Latest Customers */}
      <Row>
        <Col md="6">
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between">
              <h5 className="mb-0">Recent Activity</h5>
              <Button variant="outline-primary" size="sm">View All</Button>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="mb-0">
                  <tbody>
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <tr key={activity.id || index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className={`bg-soft-${activity.type === 'customer' ? 'primary' : activity.type === 'sale' ? 'success' : 'warning'} rounded p-2 me-3`}>
                                {activity.type === 'customer' && (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M11.8867 14.6638C8.67273 14.6638 5.92773 15.1508 5.92773 17.0958C5.92773 19.0398 8.65573 19.5408 11.8867 19.5408C15.1007 19.5408 17.8447 19.0588 17.8447 17.1128C17.8447 15.1668 15.1177 14.6638 11.8867 14.6638Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M11.8869 11.888C13.9959 11.888 15.7059 10.179 15.7059 8.069C15.7059 5.96 13.9959 4.25 11.8869 4.25C9.7779 4.25 8.0679 5.96 8.0679 8.069C8.0599 10.171 9.7569 11.881 11.8589 11.888H11.8869Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                  </svg>
                                )}
                                {activity.type === 'sale' && (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M16.4184 6.47H16.6232C19.3152 6.47 21.5 8.72 21.5 11.48V17C21.5 19.76 19.3152 22 16.6232 22H7.3768C4.6848 22 2.5 19.76 2.5 17V11.48C2.5 8.72 4.6848 6.47 7.3768 6.47H7.58162C7.60113 5.27 8.05955 4.15 8.8886 3.31C9.72741 2.46 10.8003 2.03 12.0098 2C14.4286 2 16.4184 4.04 16.4184 6.47Z" stroke="currentColor" strokeWidth="1.5"></path>
                                  </svg>
                                )}
                                {activity.type === 'service' && (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.75 2.44982C11.44 1.85982 12.57 1.85982 13.27 2.44982L14.85 3.81982C15.15 4.07982 15.71 4.28982 16.11 4.28982H17.81C18.87 4.28982 19.74 5.14982 19.74 6.20982V7.90982C19.74 8.29982 19.95 8.86982 20.21 9.16982L21.58 10.7498C22.17 11.4398 22.17 12.5698 21.58 13.2698L20.21 14.8498C19.95 15.1498 19.74 15.7098 19.74 16.1098V17.8098C19.74 18.8698 18.88 19.7398 17.82 19.7398H16.12C15.73 19.7398 15.16 19.9498 14.86 20.2098L13.28 21.5798C12.59 22.1698 11.46 22.1698 10.76 21.5798L9.18 20.2098C8.88 19.9498 8.32 19.7398 7.92 19.7398H6.17C5.11 19.7398 4.24 18.8798 4.24 17.8198V16.1098C4.24 15.7198 4.04 15.1498 3.79 14.8498L2.4 13.2598C1.82 12.5698 1.82 11.4498 2.4 10.7598L3.77 9.17982C4.03 8.87982 4.24 8.31982 4.24 7.91982V6.20982C4.24 5.14982 5.1 4.28982 6.16 4.28982H7.88C8.27 4.28982 8.84 4.07982 9.14 3.81982L10.75 2.44982Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M12 15.0001C14.0711 15.0001 15.75 13.3212 15.75 11.2501C15.75 9.17895 14.0711 7.5 12 7.5C9.92893 7.5 8.25 9.17895 8.25 11.2501C8.25 13.3212 9.92893 15.0001 12 15.0001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                  </svg>
                                )}
                              </div>
                              <div>
                                <h6 className="mb-0">{activity.name}</h6>
                                <p className="mb-0 text-muted small">{activity.details}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-end">
                            <small className="text-muted">{formatDate(activity.timestamp)}</small>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center py-4">
                          No recent activity found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md="6">
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between">
              <h5 className="mb-0">Latest Services</h5>
              <Link to="/services" className="btn btn-outline-primary btn-sm">View All</Link>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="mb-0">
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.length > 0 ? (
                      services
                        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                        .slice(0, 5)
                        .map((service) => {
                          // Find customer name
                          const customer = customers.find(c => c.customer_id === service.customer_id);
                          return (
                            <tr key={service.service_id}>
                              <td>{service.name}</td>
                              <td>{customer ? customer.name : 'Unknown'}</td>
                              <td>
                                <Badge bg={getStatusBadge(service.state)}>
                                  {service.state || 'Pending'}
                                </Badge>
                              </td>
                              <td>{formatDate(service.updated_at)}</td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          No services found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Sales */}
      <Row>
        <Col md="12">
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between">
              <h5 className="mb-0">Recent Sales</h5>
              <Link to="/sales" className="btn btn-outline-primary btn-sm">View All</Link>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Details</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.length > 0 ? (
                      sales
                        .sort((a, b) => new Date(b.creationDate || b.created_at) - new Date(a.creationDate || a.created_at))
                        .slice(0, 5)
                        .map((sale) => {
                          // Find customer name
                          const customer = customers.find(c => c.customer_id === sale.customer_id);
                          return (
                            <tr key={sale.sale_id}>
                              <td>#{sale.sale_id}</td>
                              <td>{customer ? customer.name : 'Unknown'}</td>
                              <td>{formatDate(sale.creationDate || sale.created_at)}</td>
                              <td>
                                <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                                  {sale.details}
                                </span>
                              </td>
                              <td>${parseFloat(sale.price).toFixed(2)}</td>
                              <td>
                                <Badge bg={getStatusBadge(sale.state)}>
                                  {sale.state || 'Pending'}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          No sales found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col md="12">
          <Card>
            <Card.Body>
              <h5 className="card-title mb-4">Quick Actions</h5>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/customers/new" className="btn btn-primary">
                  <i className="fa fa-plus me-2"></i> New Customer
                </Link>
                <Link to="/sales/new" className="btn btn-success">
                  <i className="fa fa-plus me-2"></i> New Sale
                </Link>
                <Link to="/services/new" className="btn btn-warning">
                  <i className="fa fa-plus me-2"></i> New Service
                </Link>
                <Link to="/users" className="btn btn-info">
                  <i className="fa fa-users me-2"></i> Manage Users
                </Link>
                <Button variant="secondary" onClick={() => window.print()}>
                  <i className="fa fa-print me-2"></i> Print Report
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Index;