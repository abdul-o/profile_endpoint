// index.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Load configuration from env or defaults
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const EMAIL = process.env.EMAIL || 'abdullateefdauda01@gmail.com';
const FULL_NAME = process.env.FULL_NAME || 'Abdullateef Dauda';
const STACK = process.env.STACK || 'Node.js/Express';
const CATFACT_TIMEOUT_MS = process.env.CATFACT_TIMEOUT_MS ? Number(process.env.CATFACT_TIMEOUT_MS) : 3000;

app.use(cors()); // Allow cross-origin requests; adjust origin in production as needed
app.use(morgan('dev')); // basic request logging

app.get('/me', async (req, res) => {
  // Ensure JSON response header
  res.setHeader('Content-Type', 'application/json');

  // Prepare base response fields
  const response = {
    status: 'success',
    user: {
      email: EMAIL,
      name: FULL_NAME,
      stack: STACK
    },
    timestamp: new Date().toISOString(),
    fact: '' // will be filled
  };

  // Fetch cat fact
  try {
    const result = await axios.get('https://catfact.ninja/fact', {
      timeout: CATFACT_TIMEOUT_MS,
      headers: {
        'Accept': 'application/json'
      }
    });

    // The API returns JSON shape like { fact: "..." , length: N }
    if (result && result.data && typeof result.data.fact === 'string') {
      response.fact = result.data.fact;
      // Send final JSON
      return res.status(200).json(response);
    } else {
      // Unexpected shape — fallback
      response.fact = 'A cat fact could not be retrieved right now.';
      return res.status(200).json(response);
    }
  } catch (err) {
    // Log the error for debugging
    console.error('Error fetching cat fact:', err && err.message ? err.message : err);

    // Graceful fallback — still return 200 with fallback fact
    response.fact = 'A cat fact could not be retrieved right now.';
    return res.status(200).json(response);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Profile endpoint listening on port ${PORT}`);
});
