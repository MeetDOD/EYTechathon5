const express = require('express');
require('dotenv').config(); 
const app = express();

const PORT = process.env.PORT || 8080;

app.get('/create', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ status: 401, message: "Unauthorized Access Token Missing" });
        }

        console.log('Request received:', token);
        // Respond immediately
        res.status(200).json({ status: 200, message: "Request received, processing in background" });

        // Background fetch with retry logic
        const fetchWithRetry = async (retries = 3) => {
            try {
                console.log(process.env.WORKFLOW_SERVER);
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
                if (retries > 0) {
                    console.warn('Retrying fetch, attempts left:', retries, 'Error:', error.message);
                    await fetchWithRetry(retries - 1); // Retry
                } else {
                    console.error('Background fetch failed:', error);
                }
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