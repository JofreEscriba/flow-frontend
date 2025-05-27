import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Dropdown } from 'react-bootstrap'
import Chart from 'react-apexcharts'
import CountUp from 'react-countup'
import axios from "axios";

const Billing = () => {
    const [period, setPeriod] = useState('month')
    const [sales, setSales] = useState([]);
    const [proposalStates, setProposalStates] = useState({
        accepted: 0,
        pending: 0,
        rejected: 0,
    });
    const [totalAcceptedSales, setTotalAcceptedSales] = useState(0);
    const [totalProposals, setTotalProposals] = useState(0);
    const [conversionRate, setConversionRate] = useState(0);
    const [averageValue, setAverageValue] = useState(0);

    // Puedes adaptar si tienes datos para distribución servicios, ventas mensuales, etc.
    const [servicesDistribution, setServicesDistribution] = useState([35, 25, 20, 20]);
    const [monthlySalesData, setMonthlySalesData] = useState(new Array(12).fill(0)); // 12 meses

    const getVariableColor = () => {
        let prefix = getComputedStyle(document.body).getPropertyValue('--prefix') || 'bs-'
        if (prefix) {
            prefix = prefix.trim()
        }
        const color1 = getComputedStyle(document.body).getPropertyValue(`--${prefix}primary`)
        const color2 = getComputedStyle(document.body).getPropertyValue(`--${prefix}info`)
        const color3 = getComputedStyle(document.body).getPropertyValue(`--${prefix}success`)
        const color4 = getComputedStyle(document.body).getPropertyValue(`--${prefix}warning`)
        return {
            primary: color1.trim(),
            info: color2.trim(),
            success: color3.trim(),
            warning: color4.trim()
        }
    }
    
    const variableColors = getVariableColor()

    const getToken = () => localStorage.getItem('token')
    const getAuthToken = () => {
        const token = getToken()
        return token ? `Bearer ${token}` : '';
    };

    const loadSales = async () => {
        try {
            const token = getAuthToken();
            if (!token) return [];

            const response = await axios.get("http://localhost:5000/sales", {
                headers: { Authorization: token }
            });

            return response.data || [];
        } catch (err) {
            console.error("Error en cargar las ventas:", err);
            return [];
        }
    };

    useEffect(() => {
        const fetchSales = async () => {
            const data = await loadSales();

            if (Array.isArray(data) && data.length > 0) {
                // --- Total propuestas ---
                setTotalProposals(data.length);

                // --- Contar estados y sumar ventas aceptadas ---
                const counts = { accepted: 0, pending: 0, rejected: 0 };
                let acceptedSum = 0;

                // Para cálculo mensual de ventas (suponiendo que tienes un campo date)
                const salesPerMonth = new Array(12).fill(0);

                data.forEach(sale => {
                    // Contar estados
                    switch ((sale.state || '').toLowerCase()) {
                        case 'accepted':
                        case 'acceptada':
                            counts.accepted++;
                            acceptedSum += sale.price || 0;
                            break;
                        case 'pending':
                        case 'pendent':
                            counts.pending++;
                            break;
                        case 'rejected':
                        case 'rebutjada':
                            counts.rejected++;
                            break;
                        default:
                            break;
                    }

                    // Ventas mensuales: supongamos sale.date es un ISO string
                    if (sale.creationDate) {
                        const date = new Date(sale.creationDate);
                        const month = date.getMonth(); // 0 - Enero, 11 - Diciembre
                        salesPerMonth[month] += sale.price || 0;
                    }
                });

                setProposalStates(counts);
                setTotalAcceptedSales(acceptedSum);

                // --- Tasa de conversión: aceptadas / total propuestas * 100 ---
                const conversion = (counts.accepted / data.length) * 100;
                setConversionRate(conversion);

                // --- Valor promedio de ventas aceptadas ---
                const average = counts.accepted > 0 ? acceptedSum / counts.accepted : 0;
                setAverageValue(average);

                // --- Ventas mensuales para gráfico ---
                setMonthlySalesData(salesPerMonth);

                // --- Aquí podrías cargar distribución de servicios si tienes esos datos ---
                // setServicesDistribution(...)

            } else {
                // No hay datos
                setTotalProposals(0);
                setProposalStates({ accepted: 0, pending: 0, rejected: 0 });
                setTotalAcceptedSales(0);
                setConversionRate(0);
                setAverageValue(0);
                setMonthlySalesData(new Array(12).fill(0));
            }
        };

        fetchSales();
    }, []);

    const salesChart = {
        options: {
            chart: {
                fontFamily: '"Inter", sans-serif',
                toolbar: { show: false },
                sparkline: { enabled: false }
            },
            colors: [variableColors.primary, variableColors.info],
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 3 },
            xaxis: {
                categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                labels: { style: { colors: '#8A92A6' } }
            },
            yaxis: {
                labels: { style: { colors: '#8A92A6' } }
            },
            legend: { show: true },
            grid: { show: true },
            tooltip: { enabled: true }
        },
        series: [
            {
                name: 'Ventas (€)',
                data: monthlySalesData
            },
        ]
    }

    const servicesChart = {
        options: {
            chart: { type: 'donut' },
            colors: [variableColors.primary, variableColors.info, variableColors.success, variableColors.warning],
            labels: ['API pagos', 'Autenticación', 'Notificaciones', 'Otros'],
            legend: { position: 'bottom' },
            dataLabels: { enabled: true }
        },
        series: servicesDistribution
    }

    const conversionChart = {
        options: {
            chart: { type: 'bar', toolbar: { show: false } },
            colors: [variableColors.success, variableColors.warning, variableColors.primary],
            plotOptions: {
                bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' }
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: ['Aceptadas', 'Pendientes', 'Rechazadas'],
                labels: { style: { colors: '#8A92A6' } }
            },
            yaxis: { labels: { style: { colors: '#8A92A6' } } }
        },
        series: [{
            name: 'Propuestas',
            data: [proposalStates.accepted, proposalStates.pending, proposalStates.rejected]
        }]
    }

    return (
        <>
            <Row className="mb-4">
                <Col md="12">
                    <div className="d-flex justify-content-between align-items-center">
                        <Dropdown>
                            <Dropdown.Toggle variant="primary">
                                {period === 'month' ? 'Este mes' : period === 'year' ? 'Este año' : 'Esta semana'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setPeriod('week')}>Esta semana</Dropdown.Item>
                                <Dropdown.Item onClick={() => setPeriod('month')}>Este mes</Dropdown.Item>
                                <Dropdown.Item onClick={() => setPeriod('year')}>Este año</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Col>
            </Row>

            {/* KPIs */}
            <Row className="mb-4">
                <Col md="3">
                    <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-primary">
                                €<CountUp end={totalAcceptedSales} duration={2} separator="," decimals={2} />
                            </h3>
                            <p className="mb-0">Ventas totales (aceptadas)</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md="3">
                    <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-info">
                                <CountUp end={totalProposals} duration={2} />
                            </h3>
                            <p className="mb-0">Número de ventas</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md="3">
                    <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-success">
                                <CountUp end={conversionRate} duration={2} decimals={1} />%
                            </h3>
                            <p className="mb-0">Tasa de conversión</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md="3">
                    <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-warning">
                                €<CountUp end={averageValue} duration={2} separator="," decimals={2} />
                            </h3>
                            <p className="mb-0">Valor promedio</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Gráficas */}
            <Row>
                <Col md="8">
                    <Card>
                        <Card.Header>
                            <h5>Evolución de ventas y propuestas</h5>
                        </Card.Header>
                        <Card.Body>
                            <Chart
                                options={salesChart.options}
                                series={salesChart.series}
                                type="area"
                                height={350}
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md="4">
                    <Card className="mb-4">
                        <Card.Header>
                            <h5>Distribución de servicios</h5>
                        </Card.Header>
                        <Card.Body>
                            <Chart
                                options={servicesChart.options}
                                series={servicesChart.series}
                                type="donut"
                                height={250}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col md="6">
                    <Card>
                        <Card.Header>
                            <h5>Estado de ventas</h5>
                        </Card.Header>
                        <Card.Body>
                            <Chart
                                options={conversionChart.options}
                                series={conversionChart.series}
                                type="bar"
                                height={300}
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md="6">
                    <Card>
                        <Card.Header>
                            <h5>Resumen del período</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Propuestas aceptadas:</span>
                                <strong className="text-success">{proposalStates.accepted}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Propuestas pendientes:</span>
                                <strong className="text-warning">{proposalStates.pending}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Propuestas denegadas:</span>
                                <strong className="text-danger">{proposalStates.rejected}</strong>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between">
                                <span><strong>Tasa de éxito:</strong></span>
                                <strong className="text-primary">{conversionRate.toFixed(1)}%</strong>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default Billing
