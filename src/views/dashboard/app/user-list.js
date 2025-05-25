import React, { useEffect, useState } from 'react';
import { Row, Col, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Card from '../../../components/Card';

const UserList = () => {
  const [users, setUsers] = useState([]);

  // Cargar usuarios desde la API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/users', {
          headers: {
            'Accept': 'application/json'
          }
        });
        console.log(localStorage.getItem('token'));
        if (!response.ok) throw new Error('Error al obtener los usuarios');

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUsers();
  }, []);

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
                          src={`https://ui-avatars.com/api/?name=${user.name}`}
                          alt="avatar"
                        />
                      </td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className="badge bg-primary">Active</span></td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="flex align-items-center list-user-action">
                          <Link className="btn btn-sm btn-icon btn-warning" title="Edit" to="#">
                            <span className="btn-inner">✏️</span>
                          </Link>
                          {' '}
                          <Link className="btn btn-sm btn-icon btn-danger" title="Delete" to="#">
                            <span className="btn-inner">🗑️</span>
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
    </Row>
  );
};

export default UserList;
