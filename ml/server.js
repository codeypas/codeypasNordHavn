require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { predictShipmentDelay } = require('./src/predictor');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ML service is running' });
});

app.post('/predict', (req, res) => {
  const delayPrediction = predictShipmentDelay(req.body || {});
  res.json({ delayPrediction });
});

const PORT = process.env.ML_PORT || 5002;

app.listen(PORT, () => {
  console.log(`ML service running on port ${PORT}`);
});
