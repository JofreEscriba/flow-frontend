require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const helmet = require("helmet");

const app = express();
const port = process.env.PORT || 3000;
const url = process.env.BASE_URL || "http://127.0.0.1:8000/api/";

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Endpoint GET de ejemplo
app.get("/api/example", async (req, res) => {
    try {
        // URL inventada para consumir datos
        const response = await axios.get(`${url}`);
        res.status(200).json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error("Error al realizar la solicitud:", error.message);
        res.status(500).json({
            success: false,
            message: "Error al obtener los datos",
        });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});