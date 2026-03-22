const { predictShipmentDelay } = require('../../ml/src/predictor');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5002';

async function requestMlPrediction(shipment) {
  if (!ML_SERVICE_URL) {
    return null;
  }

  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipment),
    });

    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}`);
    }

    const data = await response.json();
    return data.delayPrediction;
  } catch (error) {
    return null;
  }
}

async function getDelayPrediction(shipment) {
  const remotePrediction = await requestMlPrediction(shipment);
  return remotePrediction || predictShipmentDelay(shipment);
}

async function enrichShipmentPrediction(shipment) {
  const plainShipment =
    typeof shipment.toObject === 'function' ? shipment.toObject() : shipment;

  return {
    ...plainShipment,
    delayPrediction: await getDelayPrediction(plainShipment),
  };
}

async function enrichShipmentsPrediction(shipments) {
  return Promise.all(shipments.map((shipment) => enrichShipmentPrediction(shipment)));
}

module.exports = {
  enrichShipmentPrediction,
  enrichShipmentsPrediction,
};
