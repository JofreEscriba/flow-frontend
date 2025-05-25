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


app.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Realizar la solicitud al backend externo
        const response = await axios.post(`${baseUrl}login`, { email, password });

        if (response.status === 200) {
            res.status(200).json({
                success: true,
                message: "Inicio de sesión exitoso",
                user: response.data.user,
            });
        } else {
            res.status(response.status).json({
                success: false,
                message: response.data.message || "Error en el inicio de sesión",
            });
        }
    } catch (error) {
        console.error("Error en Sign In:", error.message);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
});

app.post("/signup", async (req, res) => {
    const { name,email, password } = req.body;

    try {
        // Realizar la solicitud al backend externo
        const response = await axios.post(`${baseUrl}register`, {name,email, password });

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
        console.error("Error en Sign Up:", error.message);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
});

// Customer Routes
app.get("/customers", async (req, res) => {
    try {
        const response = await axios.get(`${baseUrl}customers`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al obtener clientes:", error.message);
        res.status(500).json({ success: false, message: "Error al obtener clientes" });
    }
});

app.post("/customers", async (req, res) => {
    try {
        const response = await axios.post(`${baseUrl}customers`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error al crear cliente:", error.message);
        res.status(500).json({ success: false, message: "Error al crear cliente" });
    }
});

app.get("/customers/:id", async (req, res) => {
    try {
        const response = await axios.get(`${baseUrl}customers/${req.params.id}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al obtener cliente:", error.message);
        res.status(500).json({ success: false, message: "Error al obtener cliente" });
    }
});

app.put("/customers/:id", async (req, res) => {
    try {
        const response = await axios.put(`${baseUrl}customers/${req.params.id}`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al actualizar cliente:", error.message);
        res.status(500).json({ success: false, message: "Error al actualizar cliente" });
    }
});

app.delete("/customers/:id", async (req, res) => {
    try {
        const response = await axios.delete(`${baseUrl}customers/${req.params.id}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al eliminar cliente:", error.message);
        res.status(500).json({ success: false, message: "Error al eliminar cliente" });
    }
});

// Sales Routes
app.get("/sales", async (req, res) => {
    try {
        const response = await axios.get(`${baseUrl}sales`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al obtener ventas:", error.message);
        res.status(500).json({ success: false, message: "Error al obtener ventas" });
    }
});

app.post("/sales", async (req, res) => {
    try {
        const response = await axios.post(`${baseUrl}sales`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error al crear venta:", error.message);
        res.status(500).json({ success: false, message: "Error al crear venta" });
    }
});

app.get("/sales/:id", async (req, res) => {
    try {
        const response = await axios.get(`${baseUrl}sales/${req.params.id}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al obtener venta:", error.message);
        res.status(500).json({ success: false, message: "Error al obtener venta" });
    }
});

app.put("/sales/:id", async (req, res) => {
    try {
        const response = await axios.put(`${baseUrl}sales/${req.params.id}`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al actualizar venta:", error.message);
        res.status(500).json({ success: false, message: "Error al actualizar venta" });
    }
});

app.delete("/sales/:id", async (req, res) => {
    try {
        const response = await axios.delete(`${baseUrl}sales/${req.params.id}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al eliminar venta:", error.message);
        res.status(500).json({ success: false, message: "Error al eliminar venta" });
    }
});

// Services Routes
app.get("/services", async (req, res) => {
    try {
        const response = await axios.get(`${baseUrl}services`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al obtener servicios:", error.message);
        res.status(500).json({ success: false, message: "Error al obtener servicios" });
    }
});

app.post("/services", async (req, res) => {
    try {
        const response = await axios.post(`${baseUrl}services`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error al crear servicio:", error.message);
        res.status(500).json({ success: false, message: "Error al crear servicio" });
    }
});

app.get("/services/:id", async (req, res) => {
    try {
        const response = await axios.get(`${baseUrl}services/${req.params.id}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al obtener servicio:", error.message);
        res.status(500).json({ success: false, message: "Error al obtener servicio" });
    }
});

app.put("/services/:id", async (req, res) => {
    try {
        const response = await axios.put(`${baseUrl}services/${req.params.id}`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al actualizar servicio:", error.message);
        res.status(500).json({ success: false, message: "Error al actualizar servicio" });
    }
});

app.delete("/services/:id", async (req, res) => {
    try {
        const response = await axios.delete(`${baseUrl}services/${req.params.id}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error al eliminar servicio:", error.message);
        res.status(500).json({ success: false, message: "Error al eliminar servicio" });
    }
});

app.get("/users", async (req, res) => {
  try {
    console.log(baseUrl);
    const response = await axios.get(`${baseUrl}users`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN_CRUD}`,
        'Accept': 'application/json'
      }
    });
    console.log(response);
    res.status(200).json(response.data.users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message);
    res.status(500).json({ success: false, message: "Error al obtener usuarios" });
  }
});



// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});