import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react' 
import {Row, Col, Card} from 'react-bootstrap'
import HeaderBread from '../../../components/partials/components/header-breadcrumb'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from "@fullcalendar/list"
import bootstrapPlugin from '@fullcalendar/bootstrap'
import '@fortawesome/fontawesome-free/css/all.css'
import axios from 'axios'
import { useLocation } from 'react-router-dom'

const Calender = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    
    // Obtenir el token d'autenticació - CORREGIT per coincidir amb ServicesManagement
    const getAuthToken = () => {
        // Primer prova el format utilitzat per ServicesManagement
        const directToken = localStorage.getItem('token');
        if (directToken) {
            return `Bearer ${directToken}`;
        }
        
        // Si no funciona, prova el format anterior
        const user = JSON.parse(localStorage.getItem("user"));
        return user && user.token ? `Bearer ${user.token}` : null;
    };
    
    // Carregar serveis i convertir-los a esdeveniments del calendari
    useEffect(() => {
        const loadServices = async () => {
            setLoading(true);
            console.log("Carregant serveis per al calendari..."); // DEBUG
            try {
                const token = getAuthToken();
                console.log("Token obtingut:", token ? "✓ Token present" : "✗ Token absent"); // DEBUG
                
                if (!token) {
                    console.error("No s'ha trobat el token d'autenticació");
                    setLoading(false);
                    return;
                }
                
                // Comprovar si hi ha un serviceId a la URL
                const params = new URLSearchParams(location.search);
                const serviceId = params.get('serviceId');
                
                let response;
                if (serviceId) {
                    console.log("Carregant servei específic:", serviceId); // DEBUG
                    // Carregar un servei específic
                    response = await axios.get(`http://localhost:5000/services/${serviceId}`, {
                        headers: { Authorization: token }
                    });
                    
                    // Convertir a array si és un sol objecte
                    const servicesData = Array.isArray(response.data) ? response.data : [response.data];
                    console.log("Servei carregat:", servicesData); // DEBUG
                    convertServicesToEvents(servicesData);
                } else {
                    console.log("Carregant tots els serveis..."); // DEBUG
                    // Carregar tots els serveis
                    response = await axios.get("http://localhost:5000/services", {
                        headers: { Authorization: token }
                    });
                    
                    console.log("Serveis carregats:", response.data.length, "serveis"); // DEBUG
                    convertServicesToEvents(response.data);
                }
            } catch (err) {
                console.error("Error en carregar els serveis:", err);
                console.error("Detalls de l'error:", err.response?.data); // DEBUG
            } finally {
                setLoading(false);
            }
        };
        
        loadServices();
    }, [location]);
    
    // Convertir serveis a format d'esdeveniments per al calendari
    const convertServicesToEvents = (services) => {
        console.log("Convertint serveis a esdeveniments:", services); // DEBUG
        
        const statusColors = {
            pending: {
                textColor: 'rgba(235,153,27,1)',
                backgroundColor: 'rgba(235,153,27,0.2)',
                borderColor: 'rgba(235,153,27,1)'
            },
            in_progress: {
                textColor: 'rgba(58,87,232,1)',
                backgroundColor: 'rgba(58,87,232,0.2)',
                borderColor: 'rgba(58,87,232,1)'
            },
            completed: {
                textColor: 'rgba(8,130,12,1)',
                backgroundColor: 'rgba(8,130,12,0.2)',
                borderColor: 'rgba(8,130,12,1)'
            },
            cancelled: {
                textColor: 'rgba(206,32,20,1)',
                backgroundColor: 'rgba(206,32,20,0.2)',
                borderColor: 'rgba(206,32,20,1)'
            }
        };
        
        const calendarEvents = services.map(service => {
            const colors = statusColors[service.status] || statusColors.pending;
            
            const event = {
                id: service.id,
                title: service.name,
                start: service.created_at,
                end: service.updated_at || service.created_at,
                allDay: true,
                extendedProps: {
                    description: service.description,
                    status: service.status,
                },
                ...colors
            };
            
            console.log("Esdeveniment creat:", event); // DEBUG
            return event;
        });
        
        console.log("Total esdeveniments creats:", calendarEvents.length); // DEBUG
        setEvents(calendarEvents);
    };
    
    // Gestionar clic en un esdeveniment
    const handleEventClick = (info) => {
        const { id, title, extendedProps } = info.event;
        
        // Obtenir text d'estat en català
        const getStatusText = (status) => {
            switch (status) {
                case 'pending': return 'Pendent';
                case 'in_progress': return 'En progrés';
                case 'completed': return 'Completat';
                case 'cancelled': return 'Cancel·lat';
                default: return status;
            }
        };
        
        alert(`Servei: ${title}\nEstat: ${getStatusText(extendedProps.status)}\nDescripció: ${extendedProps.description}`);
    };

    return (
        <>
            <HeaderBread/>
            <Row>
                <Col lg="12">
                    <Row>
                        <Col lg="12" className="col-lg-12">
                            <Card>
                                <Card.Header>
                                    <h4 className="card-title">Calendari de Serveis</h4>
                                    {/* Informació de debug - eliminar en producció */}
                                    <small className="text-muted">
                                        {events.length} esdeveniments carregats
                                    </small>
                                </Card.Header>
                                <Card.Body>
                                    {loading ? (
                                        <div className="text-center">Carregant serveis...</div>
                                    ) : events.length === 0 ? (
                                        <div className="text-center text-muted">
                                            <p>No s'han trobat serveis per mostrar al calendari.</p>
                                            <p>Comprova que tens serveis creats i que el token d'autenticació és vàlid.</p>
                                        </div>
                                    ) : (
                                        <FullCalendar                
                                            plugins={[dayGridPlugin, listPlugin, bootstrapPlugin]}
                                            initialView="dayGridMonth"
                                            headerToolbar={{
                                                left: 'prev,next today',
                                                center: 'title',
                                                right: 'dayGridMonth,dayGridWeek,dayGridDay,listWeek'
                                            }}
                                            events={events}
                                            eventClick={handleEventClick}
                                            locale="ca"
                                            height="auto"
                                        />
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
}

export default Calender