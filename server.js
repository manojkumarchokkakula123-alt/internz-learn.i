const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// --- Middleware Setup ---
// Enable CORS for frontend communication
app.use(cors());

// Parse incoming request bodies as JSON
app.use(bodyParser.json());

// Path to the mock database file
const DATA_FILE = path.join(__dirname, 'data.json');

// --- Helper Functions for Data Persistence ---

function readStudentData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is empty, return an empty array
        return [];
    }
}

function writeStudentData(data) {
    try {
        // Write the updated data back to the JSON file with nice formatting
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing data file:", error);
    }
}

// --- API Endpoints ---

// 1. Endpoint for Quiz Submission (Data Collection)
app.post('/api/quiz/submit', (req, res) => {
    const newStudentData = req.body;
    
    // Basic validation to ensure key fields are present
    if (!newStudentData.name || !newStudentData.email || !newStudentData.course || typeof newStudentData.score === 'undefined') {
        return res.status(400).json({ message: 'Missing required student data for submission.' });
    }

    const allData = readStudentData();
    allData.push(newStudentData);
    writeStudentData(allData);

    console.log(`✅ New Quiz Submission received: ${newStudentData.name} (Course: ${newStudentData.course}, Score: ${newStudentData.score}/${newStudentData.maxScore})`);
    
    res.status(201).json({ 
        message: 'Quiz submitted and data saved successfully!', 
        data: { id: allData.length, name: newStudentData.name, course: newStudentData.course } 
    });
});

// 2. Endpoint for Admin Dashboard Data Retrieval
app.get('/api/admin/data', (req, res) => {
    const allData = readStudentData();
    console.log(`📡 Admin requested data. Returning ${allData.length} records.`);
    
    res.status(200).json({ students: allData });
});


// 3. Mock Admin Login Endpoint
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Hardcoded mock credentials for this demo: admin/password123
    if (username === 'admin' && password === 'password123') {
        return res.status(200).json({ 
            success: true, 
            token: 'mock-auth-token-123', 
            message: 'Login successful' 
        });
    } else {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid credentials' 
        });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('Use Username: admin, Password: password123 to login to the frontend.');
});