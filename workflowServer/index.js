const express = require('express');
require('dotenv').config(); 
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: "*" }));


app.get('/create', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ status: 401, message: "Unauthorized Access Token Missing" });
        }

        console.log('Request received:', token);
        // Respond immediately
        res.status(200).json({ status: 200, message: "Request received, processing in background" });

        const fetchWithRetry = async () => {
            try {
                const backgroundRes = await fetch(`${process.env.WORKFLOW_SERVER}/workflow/generate-workflow-content`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const response = await backgroundRes.json();
                console.log('Background process completed:', response);
            } catch (error) {
                console.error('Error handling request:', error);
            }
        };

        const alertAfterFetchWithRetry = async () => {
            try{
                const result = await fetch(`${process.env.WORKFLOW_SERVER}/workflow/alert`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
                const response = await result.json();
                console.log('Alert response:', response);
            }catch(error){
                console.error('Error handling request:', error);
            }
        }

        fetchWithRetry();
        alertAfterFetchWithRetry();
    } catch (error) {
        console.error('Error handling request:', error);
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});