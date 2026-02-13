require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Shipment = require('../models/Shipment');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Clear existing data
    await User.deleteMany({});
    await Shipment.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const admin = new User({
      email: 'admin@test.com',
      password: 'password123',
      name: 'Admin User',
      role: 'admin',
    });

    const manager = new User({
      email: 'manager@test.com',
      password: 'password123',
      name: 'Manager User',
      role: 'manager',
    });

    await admin.save();
    await manager.save();
    console.log('Users created');

    // Create shipments
    const shipments = [
      {
        shipmentId: 'SHP-001',
        origin: 'Shanghai',
        destination: 'Rotterdam',
        status: 'In Transit',
        riskScore: 15,
        compliancePercentage: 95,
        departureDate: new Date('2024-01-15'),
        expectedArrival: new Date('2024-02-20'),
        cargoType: 'Electronics',
        weight: 2500,
        value: 50000,
        currentLocation: 'Red Sea',
        documents: ['Bill of Lading', 'Invoice', 'Packing List'],
        riskFactors: { weather: 5, compliance: 10 },
        notes: 'Low risk shipment',
      },
      {
        shipmentId: 'SHP-002',
        origin: 'Los Angeles',
        destination: 'Hamburg',
        status: 'In Transit',
        riskScore: 55,
        compliancePercentage: 70,
        departureDate: new Date('2024-01-18'),
        expectedArrival: new Date('2024-02-15'),
        cargoType: 'Textiles',
        weight: 1800,
        value: 35000,
        currentLocation: 'Atlantic Ocean',
        documents: ['Certificate of Origin', 'Invoice'],
        riskFactors: { weather: 20, geopolitical: 25, compliance: 10 },
        notes: 'Medium risk - weather delays',
      },
      {
        shipmentId: 'SHP-003',
        origin: 'Singapore',
        destination: 'Rotterdam',
        status: 'Delayed',
        riskScore: 75,
        compliancePercentage: 50,
        departureDate: new Date('2024-01-10'),
        expectedArrival: new Date('2024-02-18'),
        cargoType: 'Chemicals',
        weight: 3200,
        value: 85000,
        currentLocation: 'Port of Singapore',
        documents: ['Hazmat Certificate', 'Insurance'],
        riskFactors: { hazmat: 30, compliance: 25, documentation: 20 },
        notes: 'High risk - hazardous materials',
      },
      {
        shipmentId: 'SHP-004',
        origin: 'Mumbai',
        destination: 'Rotterdam',
        status: 'Completed',
        riskScore: 25,
        compliancePercentage: 85,
        departureDate: new Date('2024-01-05'),
        expectedArrival: new Date('2024-02-10'),
        cargoType: 'Machinery',
        weight: 4500,
        value: 120000,
        currentLocation: 'Rotterdam',
        documents: ['All Documents Complete'],
        riskFactors: { documentation: 15, compliance: 10 },
        notes: 'Completed successfully',
      },
      {
        shipmentId: 'SHP-005',
        origin: 'Hong Kong',
        destination: 'Hamburg',
        status: 'At Port',
        riskScore: 85,
        compliancePercentage: 40,
        departureDate: new Date('2024-01-20'),
        expectedArrival: new Date('2024-02-25'),
        cargoType: 'Hazardous',
        weight: 900,
        value: 180000,
        currentLocation: 'Hamburg Port',
        documents: ['Dangerous Goods Form', 'SDS'],
        riskFactors: { hazmat: 40, geopolitical: 30, compliance: 15 },
        notes: 'Very high risk - hazmat + geopolitical',
      },
      {
        shipmentId: 'SHP-006',
        origin: 'Bangkok',
        destination: 'Rotterdam',
        status: 'In Transit',
        riskScore: 35,
        compliancePercentage: 80,
        departureDate: new Date('2024-01-22'),
        expectedArrival: new Date('2024-02-28'),
        cargoType: 'Automotive',
        weight: 3500,
        value: 95000,
        currentLocation: 'Indian Ocean',
        documents: ['Bill of Lading', 'Invoice'],
        riskFactors: { weather: 15, compliance: 10, documentation: 10 },
        notes: 'Medium-low risk',
      },
    ];

    await Shipment.insertMany(shipments);
    console.log('Shipments created');

    console.log('Seed data completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seed error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
