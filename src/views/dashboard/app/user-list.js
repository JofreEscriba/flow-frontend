import React, { useEffect, useState } from 'react';
import { Row, Col, Image, Badge } from 'react-bootstrap'; // Afegit Badge
import { Link } from 'react-router-dom';
import Card from '../../../components/Card';
import Chart from 'react-apexcharts'; // Afegit per a les gràfiques

const UserList = () => {
  const mockUsers = [
    { id: 1, name: 'Anna Client', email: 'anna@client.com', role: 'client', status: 'Active', created_at: '2024-03-01' },
    { id: 2, name: 'Joan Client', email: 'joan@client.com', role: 'client', status: 'Pending', created_at: '2024-03-05' },
    { id: 3, name: 'Maria Client', email: 'maria@client.com', role: 'client', status: 'Inactive', created_at: '2024-03-10' },
    { id: 4, name: 'Pere Usuari', email: 'pere@usuari.com', role: 'user', status: 'Active', created_at: '2024-03-12' },
    { id: 5, name: 'Laura Client', email: 'laura@client.com', role: 'client', status: 'Active', created_at: '2024-03-15' }
  ];
  const [users, setUsers] = useState([]);
  const [clientUsers, setClientUsers] = useState([]); // Estat per als usuaris clients
  const [clientStatusChartData, setClientStatusChartData] = useState({ // Estat per a la gràfica d'estat de clients
    options: {},
    series: []
  });

  // Funció per obtenir colors variables (similar a billing.js)
  const getVariableColor = () => {
    let prefix =
      getComputedStyle(document.body).getPropertyValue("--prefix") || "bs-";
    if (prefix) {
      prefix = prefix.trim();
    }
    const color1 = getComputedStyle(document.body).getPropertyValue(
      `--${prefix}primary`
    );
    const color2 = getComputedStyle(document.body).getPropertyValue(
      `--${prefix}success`
    );
    const color3 = getComputedStyle(document.body).getPropertyValue(
      `--${prefix}warning`
    );
    return {
      primary: color1.trim(),
      success: color2.trim(),
      warning: color3.trim(),
    };
  };

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


  // Cargar usuarios desde la API
  useEffect(() => {
    const fetchUsers = async () => {
      let data = [];
      try {
        const response = await fetch('http://localhost:5000/users', {
                method: 'GET',
                headers: getHeaders(),
            });
        if (response.ok) {
          data = await response.json();
          data = data.users;
        }
      } catch (error) {
        // Si hi ha error, es continuarà amb data = []
      }
      if (!Array.isArray(data) || data.length === 0) {
        data = mockUsers; // Sempre mostra usuaris de prova si no hi ha dades vàlides
      }
      setUsers(data);
      // Filtrar usuaris amb rol 'client' i preparar dades per a la gràfica
      const clients = data.filter(user => user.role === 'client');
      setClientUsers(clients);
      const statusCounts = clients.reduce((acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
      }, {});
      const variableColors = getVariableColor();
      setClientStatusChartData({
        options: {
          chart: { type: 'donut' },
          labels: Object.keys(statusCounts),
          colors: [variableColors.success, variableColors.warning, variableColors.primary],
          legend: { position: 'bottom' },
          dataLabels: { enabled: true, formatter: function (val, opts) { return opts.w.config.series[opts.seriesIndex] } },
          tooltip: {
            y: {
              formatter: function (val) { return val + " clients"; }
            }
          }
        },
        series: Object.values(statusCounts)
      });
    };
    fetchUsers();
  },[]); // Assegura't que només s'executa un cop

    function handleDeleteUser(userId) {
  if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
    // 1. Eliminar en la interfaz
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

    // 2. Eliminar en el backend
    const token = getToken();

    fetch(`http://localhost:5000/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        console.error('Error al eliminar usuario:', data.message);
        alert(data.message || 'No se pudo eliminar el usuario.');
        // Opcional: revertir UI si falla
        // setUsers(prevUsers => [...prevUsers, usuarioRestaurado]);
      } else {
        console.log('Usuario eliminado:', data.message);
      }
    })
    .catch(error => {
      console.error('Error al eliminar usuario:', error);
      alert('Error de conexión al intentar eliminar usuario.');
    });
  }
  }

    function handleEditUser(userId) {
    return () => {
      // Aquí podrías redirigir a una página de edición de usuario
      console.log(`Editar usuario con ID: ${userId}`);
      // Por ejemplo, podrías usar navigate(`/edit-user/${userId}`) si estás usando react-router
    };  
  }

  return (
    <Row>
      <Col sm="12">
        <Card>
          <Card.Header className="d-flex justify-content-between">
            <div className="header-title">
              <h4 className="card-title">User List</h4>
            </div>
          </Card.Header>
          <Card.Body className="px-0">
            <div className="table-responsive">
              <table className="table table-striped" role="grid">
                <thead>
                  <tr className="ligth">
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th min-width="100px">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={user.id || idx}>
                      <td className="text-center">
                        <Image
                          className="bg-soft-primary rounded img-fluid avatar-40 me-3"
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                          alt="avatar"
                        />
                      </td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      {/* Asumint que l'usuari té una propietat 'status' i 'role' */}
                      <td>
                        {user.status === 'Active' && <Badge bg="primary">{user.status}</Badge>}
                        {user.status === 'Pending' && <Badge bg="warning">{user.status}</Badge>}
                        {user.status === 'Inactive' && <Badge bg="danger">{user.status}</Badge>}
                        {!['Active', 'Pending', 'Inactive'].includes(user.status) && <Badge bg="secondary">{user.status || 'N/A'}</Badge>}
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="flex align-items-center list-user-action">
                          <Link className="btn btn-sm btn-icon text-primary flex-end" data-bs-toggle="tooltip" title="Edit User" to="#" onClick={() => {handleEditUser(user.id)}}>
                            <span className="btn-inner">
                                <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                                    <path d="M11.4925 2.78906H7.75349C4.67849 2.78906 2.75049 4.96606 2.75049 8.04806V16.3621C2.75049 19.4441 4.66949 21.6211 7.75349 21.6211H16.5775C19.6625 21.6211 21.5815 19.4441 21.5815 16.3621V12.3341" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8.82812 10.921L16.3011 3.44799C17.2321 2.51799 18.7411 2.51799 19.6721 3.44799L20.8891 4.66499C21.8201 5.59599 21.8201 7.10599 20.8891 8.03599L13.3801 15.545C12.9731 15.952 12.4211 16.181 11.8451 16.181H8.09912L8.19312 12.401C8.20712 11.845 8.43412 11.315 8.82812 10.921Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M15.1655 4.60254L19.7315 9.16854" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </span>
                          </Link>
                          {' '}
                          <Link className="btn btn-sm btn-icon text-danger" data-bs-toggle="tooltip" title="Delete User" to="#" onClick={() => {handleDeleteUser(user.id)}}>
                            <span className="btn-inner">
                                <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
                                    <path d="M19.3248 9.46826C19.3248 9.46826 18.7818 16.2033 18.4668 19.0403C18.3168 20.3953 17.4798 21.1893 16.1088 21.2143C13.4998 21.2613 10.8878 21.2643 8.27979 21.2093C6.96079 21.1823 6.13779 20.3783 5.99079 19.0473C5.67379 16.1853 5.13379 9.46826 5.13379 9.46826" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M20.708 6.23975H3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M17.4406 6.23973C16.6556 6.23973 15.9796 5.68473 15.8256 4.91573L15.5826 3.69973C15.4326 3.13873 14.9246 2.75073 14.3456 2.75073H10.1126C9.53358 2.75073 9.02558 3.13873 8.87558 3.69973L8.63258 4.91573C8.47858 5.68473 7.80258 6.23973 7.01758 6.23973" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </Col>
      {/* Secció d'anàlisi de clients */}
      {clientUsers.length > 0 && (
        <Col sm="12" className="mt-4">
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <div className="header-title">
                <h4 className="card-title">Anàlisi de Clients</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md="6">
                  <h5>Distribució d'Estat de Clients</h5>
                  {clientStatusChartData.series.length > 0 ? (
                    <Chart
                      options={clientStatusChartData.options}
                      series={clientStatusChartData.series}
                      type="donut"
                      height={350}
                    />
                  ) : (
                    <p>No hi ha dades suficients per mostrar la gràfica d'estat.</p>
                  )}
                </Col>
                {/* Aquí pots afegir més gràfiques */}
                {/* <Col md="6">
                  <h5>Altra Gràfica de Clients</h5>
                  Pots afegir una altra configuració de gràfica aquí 
                </Col> */}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      )}
    </Row>
  );
};

export default UserList;
