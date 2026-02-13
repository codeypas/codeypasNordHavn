const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['In Transit', 'At Port', 'Delayed', 'Completed'],
      default: 'In Transit',
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    compliancePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    expectedArrival: {
      type: Date,
      required: true,
    },
    cargoType: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    currentLocation: {
      type: String,
      default: 'Port of Origin',
    },
    documents: {
      type: [String],
      default: [],
    },
    riskFactors: {
      type: Object,
      default: {},
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shipment', shipmentSchema);
