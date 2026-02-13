const express = require('express');
const Shipment = require('../models/Shipment');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { shipmentId, origin, destination, status, riskScore, compliancePercentage, departureDate, expectedArrival, cargoType, weight, value, currentLocation, documents, riskFactors, notes } = req.body;

    if (!shipmentId || !origin || !destination) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newShipment = new Shipment({
      shipmentId,
      origin,
      destination,
      status,
      riskScore,
      compliancePercentage,
      departureDate,
      expectedArrival,
      cargoType,
      weight,
      value,
      currentLocation,
      documents,
      riskFactors,
      notes,
    });

    await newShipment.save();
    res.status(201).json(newShipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndDelete(req.params.id);

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
