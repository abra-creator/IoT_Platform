const express = require("express");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());


// ==========================================
// POSTGRESQL DATABASE CONNECTION
// ==========================================

//const pool = new Pool({
//    user: "postgres",
//    host: "localhost",
//    database: "iot_platform",
//    password: "IoTKizwe@2026",
//    port: 5432
//});
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});



// ==========================================
// TEST DATABASE CONNECTION
// ==========================================

pool.query("SELECT NOW()", (error, result) => {

    if (error) {
        console.error("❌ PostgreSQL connection failed:");
        console.error(error.message);
    } else {
        console.log("✅ PostgreSQL connected successfully!");
        console.log("Database time:", result.rows[0].now);
    }

});


// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.send("IoT Platform Server is Running!");

});


// ==========================================
// SENSOR API
// ==========================================

app.post("/api/sensor", async (req, res) => {

    try {

        const {
            device_id,
            temperature,
            humidity,
            distance,
            motion,
            voltage
        } = req.body;

        console.log("Sensor data received:");
        console.log(req.body);


        // Save sensor data into PostgreSQL
        const result = await pool.query(
            `
            INSERT INTO sensor_data
            (
                device_id,
                temperature,
                humidity,
                distance,
                motion,
                voltage
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [device_id, temperature, humidity, distance, motion, voltage]
        );


        console.log("✅ Sensor data saved to database");


        res.json({

            success: true,

            message: "Sensor data saved successfully",

            data: result.rows[0]

        });


    } catch (error) {

        console.error("❌ Database error:");
        console.error(error.message);

        res.status(500).json({

            success: false,

            message: "Failed to save sensor data",

            error: error.message

        });

    }

});


// ==========================================
// START SERVER
// ==========================================
console.log("About to start Express server...");

app.listen(PORT, () => {
    console.log("=================================");
    console.log("IoT PLATFORM SERVER");
    console.log("=================================");
    console.log(`🚀Server running on port ${PORT}`);
    console.log(`Folder: ${__dirname}`);
    console.log("=================================");
});
