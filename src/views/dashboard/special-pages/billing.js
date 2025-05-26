
import React, { useState } from 'react'
import { Row, Col, Card, Dropdown } from 'react-bootstrap'
import Chart from 'react-apexcharts'
import CountUp from 'react-countup'

const Billing = () => {
    const [period, setPeriod] = useState('month')
    
    // Dades simulades per les estadístiques
    const salesData = {
        totalSales: 45600,
        totalProposals: 28,
        acceptedProposals: 18,
        rejectedProposals: 4,
        pendingProposals: 6,
        conversionRate: 64.3,
        averageValue: 2533
    }

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

    // Gràfica de vendes mensuals
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
                categories: ['Gen', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Des'],
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
                name: 'Vendes (€)',
                data: [3200, 4100, 3800, 5200, 4600, 5800, 6200, 5400, 4900, 5600, 6800, 7200]
            },
            {
                name: 'Propostes',
                data: [5, 7, 6, 9, 8, 10, 11, 9, 8, 10, 12, 13]
            }
        ]
    }

    // Gràfica de distribució de serveis
    const servicesChart = {
        options: {
            chart: { type: 'donut' },
            colors: [variableColors.primary, variableColors.info, variableColors.success, variableColors.warning],
            labels: ['API pagos', 'Autenticación', 'Notificaciones', 'Otros'],
            legend: { position: 'bottom' },
            dataLabels: { enabled: true }
        },
        series: [35, 25, 20, 20]
    }

    // Gràfica de conversió de propostes
    const conversionChart = {
        options: {
            chart: { type: 'bar', toolbar: { show: false } },
            colors: [variableColors.success, variableColors.warning, variableColors.primary],
            plotOptions: {
                bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' }
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: ['Acceptades', 'Pendents', 'Rebutjades'],
                labels: { style: { colors: '#8A92A6' } }
            },
            yaxis: { labels: { style: { colors: '#8A92A6' } } }
        },
        series: [{
            name: 'Propostes',
            data: [salesData.acceptedProposals, salesData.pendingProposals, salesData.rejectedProposals]
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
                                €<CountUp end={salesData.totalSales} duration={2} separator="," />
                            </h3>
                            <p className="mb-0">Ventas totales</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md="3">
                    <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-info">
                                <CountUp end={salesData.totalProposals} duration={2} />
                            </h3>
                            <p className="mb-0">Propuestas totales</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md="3">
                    <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-success">
                                <CountUp end={salesData.conversionRate} duration={2} decimals={1} />%
                            </h3>
                            <p className="mb-0">Tasa de conversión</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md="3">
                    <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-warning">
                                €<CountUp end={salesData.averageValue} duration={2} separator="," />
                            </h3>
                            <p className="mb-0">Valor mediano</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Gràfiques */}
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
                            <h5>Estado de propuestas</h5>
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
                                <strong className="text-success">{salesData.acceptedProposals}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Propuestas pendientes:</span>
                                <strong className="text-warning">{salesData.pendingProposals}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Propuestas denegades:</span>
                                <strong className="text-danger">{salesData.rejectedProposals}</strong>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between">
                                <span><strong>Tasa de éxito:</strong></span>
                                <strong className="text-primary">{salesData.conversionRate}%</strong>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default Billing
