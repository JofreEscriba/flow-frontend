require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const helmet = require("helmet");

const app = express();
const port = process.env.PORT || 5000;
const baseUrl = process.env.BASE_URL || "http://flow-backend.test/api/";

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Auth Routes
app.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const response = await axios.post(`${baseUrl}login`, { email, password });

        if (response.status === 200) {
            res.status(200).json({
                success: true,
                message: "Inicio de sesión exitoso",
                user: response.data.user,
                token: response.data.token // Incluir el token en la respuesta
            });
        } else {
            res.status(response.status).json({
                success: false,
                message: response.data.message || "Error en el inicio de sesión",
            });
        }
    } catch (error) {
        console.error("Error en Sign In:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || "Error interno del servidor",
        });
    }
});

app.post("/logout", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.post(`${baseUrl}logout`, {}, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'    
            }
        });
        
        if (response.status === 200) {
            res.status(200).json({
                success: true,
                message: "Cierre de sesión exitoso",
            });
        } else {
            res.status(response.status).json({
                success: false,
                message: response.data.message || "Error en el cierre de sesión",
            });
        }
    } catch (error) {
        console.error("Error en Logout:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || "Error interno del servidor",
        });
    }
});

// Verificar perfil de usuario (reemplaza el endpoint de token)
app.get("/profile", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.get(`${baseUrl}profile`, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            }
        });

        if (response.status === 200) {
            res.status(200).json({
                success: true,
                message: "Perfil obtenido exitosamente",
                user: response.data.user,
            });
        } else {
            res.status(response.status).json({
                success: false,
                message: response.data.message || "Error al obtener el perfil",
            });
        }
    } catch (error) {
        console.error("Error en Profile:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || "Error interno del servidor",
        });
    }
});

app.post("/signup", async (req, res) => {
    const { name, email, password, country } = req.body;

    try {
        const response = await axios.post(`${baseUrl}register`, { name, email, password, country });

        if (response.status === 201) {
            res.status(201).json({
                success: true,
                message: "Registro exitoso",
                user: response.data.user,
            });
        } else {
            res.status(response.status).json({
                success: false,
                message: response.data.message || "Error en el registro",
            });
        }
    } catch (error) {
        console.error("Error en Sign Up:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || "Error interno del servidor",
        });
    }
});

// User Management Routes
app.get("/users", async (req, res) => {
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.get(`${baseUrl}users`, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            }
        });
        
        res.status(200).json({
            success: true,
            users: response.data.users
        });
    } catch (error) {
        console.error("Error al obtener usuarios:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ 
            success: false, 
            message: "Error al obtener usuarios" 
        });
    }
});

app.patch("/users/:id/role", async (req, res) => {
    const { role } = req.body;
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.patch(`${baseUrl}users/${id}/role`, { role }, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            res.status(200).json({
                success: true,
                message: "Rol actualizado exitosamente",
                user: response.data.user,
            });
        } else {
            res.status(response.status).json({
                success: false,
                message: response.data.message || "Error al actualizar el rol",
            });
        }
    } catch (error) {
        console.error("Error al actualizar rol:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || "Error interno del servidor",
        });
    }
});

app.put("/users/:id", async (req, res) => {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.put(`${baseUrl}users/${id}`, req.body, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        res.status(200).json({
            success: true,
            message: "Usuario actualizado exitosamente",
            user: response.data.user
        });
    } catch (error) {
        console.error("Error al actualizar usuario:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ 
            success: false, 
            message: "Error al actualizar usuario" 
        });
    }
});

app.delete("/users/:id", async (req, res) => {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.delete(`${baseUrl}users/${id}`, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            }
        });
        res.status(200).json({
            success: true,
            message: "Usuario eliminado exitosamente"
        });
    } catch (error) {
        console.error("Error al eliminar usuario:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ 
            success: false, 
            message: "Error al eliminar usuario" 
        });
    }
});

// Helper function to add auth headers
const addAuthHeaders = (authHeader) => ({
    'Authorization': authHeader,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
});

// Customer Routes
app.get("/customers", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.get(`${baseUrl}customers`, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al obtener clientes:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al obtener clientes" });
    }
});

app.post("/customers", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.post(`${baseUrl}customers`, req.body, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error al crear cliente:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al crear cliente" });
    }
});

app.get("/customers/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.get(`${baseUrl}customers/${req.params.id}`, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al obtener cliente:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al obtener cliente" });
    }
});

app.put("/customers/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.put(`${baseUrl}customers/${req.params.id}`, req.body, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al actualizar cliente:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al actualizar cliente" });
    }
});

app.delete("/customers/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.delete(`${baseUrl}customers/${req.params.id}`, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al eliminar cliente:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al eliminar cliente" });
    }
});

// Sales Routes
app.get("/sales", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.get(`${baseUrl}sales`, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(200).json(response.data);
        console.log("Ventas obtenidas exitosamente:", response.data);
    } catch (error) {
        console.error("Error al obtener ventas:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al obtener ventas" });
    }
});

app.post("/sales", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.post(`${baseUrl}sales`, req.body, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error al crear venta:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al crear venta" });
    }
});

app.get("/sales/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.get(`${baseUrl}sales/${req.params.id}`, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al obtener venta:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al obtener venta" });
    }
});

app.put("/sales/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        console.log("Actualizando venta con ID:", req.params.id, "y datos:", req.body); // DEBUG
        const response = await axios.put(`${baseUrl}sales/${req.params.id}`, req.body, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al actualizar venta:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al actualizar venta" });
    }
});

app.delete("/sales/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.delete(`${baseUrl}sales/${req.params.id}`, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al eliminar venta:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al eliminar venta" });
    }
});

// Services Routes
app.get("/services", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.get(`${baseUrl}services`, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al obtener servicios:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al obtener servicios" });
    }
});

app.post("/services", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.post(`${baseUrl}services`, req.body, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error al crear servicio:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al crear servicio" });
    }
});

app.get("/services/customer/:customerId", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.get(`${baseUrl}services/customer/${req.params.customerId}`, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al obtener servicios por cliente:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al obtener servicios por cliente" });
    }
});

app.get("/services/sale/:saleId", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.get(`${baseUrl}services/sale/${req.params.sale_id}`, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al obtener servicios por venta:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al obtener servicios por venta" });
    }
});

app.put("/services/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        const response = await axios.put(`${baseUrl}services/${req.params.id}`, req.body, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al actualizar servicio:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al actualizar servicio" });
    }
});

app.delete("/services/:service_id", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token de autorización requerido"
        });
    }

    try {
        console.log("Eliminando sale con ID:", req.params); // DEBUG

        const response = await axios.delete(`${baseUrl}services/${req.params.service_id}`, {
            headers: addAuthHeaders(authHeader)
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al eliminar servicio:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ success: false, message: "Error al eliminar servicio" });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});