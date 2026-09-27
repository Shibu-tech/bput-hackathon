const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Location = require('../models/Location');
const MessMenu = require('../models/MessMenu');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Location.deleteMany({});
    await MessMenu.deleteMany({});

    console.log('Existing data cleared');

    // Create Locations
    const locations = [
      { buildingName: 'Hostel A', floor: 1, roomNumber: '101' },
      { buildingName: 'Hostel A', floor: 1, roomNumber: '102' },
      { buildingName: 'Hostel A', floor: 2, roomNumber: '201' },
      { buildingName: 'Hostel A', floor: 2, roomNumber: '202' },
      { buildingName: 'Hostel B', floor: 1, roomNumber: '101' },
      { buildingName: 'Hostel B', floor: 1, roomNumber: '102' },
      { buildingName: 'Hostel B', floor: 2, roomNumber: '201' },
      { buildingName: 'Hostel B', floor: 2, roomNumber: '202' },
    ];

    const createdLocations = await Location.insertMany(locations);
    console.log(`Created ${createdLocations.length} locations`);

    // Create Users
    const users = [
      // ADMIN
      {
        fullName: 'Admin User',
        role: 'ADMIN',
        phoneNumber: '9999999999',
        passwordHash: 'admin123', // Will be hashed by pre-save hook
      },
      // WARDENS (one per hostel)
      {
        fullName: 'Warden Hostel A',
        role: 'WARDEN',
        phoneNumber: '8888888888',
        passwordHash: 'warden123',
        hostel: 'Hostel A',
      },
      {
        fullName: 'Warden Hostel B',
        role: 'WARDEN',
        phoneNumber: '8888888889',
        passwordHash: 'warden123',
        hostel: 'Hostel B',
      },
      // TECHNICIANS (one per category)
      {
        fullName: 'IT Technician',
        role: 'TECHNICIAN',
        phoneNumber: '7777777777',
        passwordHash: 'tech123',
        shifts: [
          { category: 'IT', startMinute: 480, endMinute: 1080 } // 8:00 AM to 6:00 PM
        ]
      },
      {
        fullName: 'Electrical Technician',
        role: 'TECHNICIAN',
        phoneNumber: '7777777778',
        passwordHash: 'tech123',
        shifts: [
          { category: 'ELECTRICAL', startMinute: 480, endMinute: 1080 }
        ]
      },
      {
        fullName: 'Plumbing Technician',
        role: 'TECHNICIAN',
        phoneNumber: '7777777779',
        passwordHash: 'tech123',
        shifts: [
          { category: 'PLUMBING', startMinute: 480, endMinute: 1080 }
        ]
      },
      // SECURITY
      {
        fullName: 'Security Guard 1',
        role: 'SECURITY',
        phoneNumber: '6666666666',
        passwordHash: 'security123'
      },
      {
        fullName: 'Security Guard 2',
        role: 'SECURITY',
        phoneNumber: '6666666667',
        passwordHash: 'security123'
      },
      // STUDENTS (assign to rooms)
      {
        fullName: 'Student Hostel A Room 101',
        role: 'STUDENT',
        phoneNumber: '5555555555',
        passwordHash: 'student123',
        locationId: createdLocations.find(l => l.buildingName === 'Hostel A' && l.floor === 1 && l.roomNumber === '101')._id,
        hostel: 'Hostel A',
        batch: '2024'
      },
      {
        fullName: 'Student Hostel A Room 102',
        role: 'STUDENT',
        phoneNumber: '5555555556',
        passwordHash: 'student123',
        locationId: createdLocations.find(l => l.buildingName === 'Hostel A' && l.floor === 1 && l.roomNumber === '102')._id,
        hostel: 'Hostel A',
        batch: '2024'
      },
      {
        fullName: 'Student Hostel A Room 201',
        role: 'STUDENT',
        phoneNumber: '5555555557',
        passwordHash: 'student123',
        locationId: createdLocations.find(l => l.buildingName === 'Hostel A' && l.floor === 2 && l.roomNumber === '201')._id,
        hostel: 'Hostel A',
        batch: '2024'
      },
      {
        fullName: 'Student Hostel A Room 202',
        role: 'STUDENT',
        phoneNumber: '5555555558',
        passwordHash: 'student123',
        locationId: createdLocations.find(l => l.buildingName === 'Hostel A' && l.floor === 2 && l.roomNumber === '202')._id,
        hostel: 'Hostel A',
        batch: '2024'
      },
      {
        fullName: 'Student Hostel B Room 101',
        role: 'STUDENT',
        phoneNumber: '5555555559',
        passwordHash: 'student123',
        locationId: createdLocations.find(l => l.buildingName === 'Hostel B' && l.floor === 1 && l.roomNumber === '101')._id,
        hostel: 'Hostel B',
        batch: '2024'
      },
      {
        fullName: 'Student Hostel B Room 102',
        role: 'STUDENT',
        phoneNumber: '5555555560',
        passwordHash: 'student123',
        locationId: createdLocations.find(l => l.buildingName === 'Hostel B' && l.floor === 1 && l.roomNumber === '102')._id,
        hostel: 'Hostel B',
        batch: '2024'
      }
    ];

    // Hash passwords before inserting
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    }

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create sample MessMenu for today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const messMenu = {
      menuDate: today,
      mealType: 'LUNCH',
      items: ['Rice', 'Dal', 'Vegetable Curry', 'Salad'],
      updatedBy: createdUsers.find(u => u.role === 'ADMIN')._id
    };

    await MessMenu.create(messMenu);
    console.log('Created sample mess menu for today');

    // Display credentials
    console.log('\n=== SEEDING COMPLETE ===');
    console.log('Credentials for testing:');
    console.log('ADMIN - Phone: 9999999999, Password: admin123');
    console.log('WARDEN (Hostel A) - Phone: 8888888888, Password: warden123');
    console.log('WARDEN (Hostel B) - Phone: 8888888889, Password: warden123');
    console.log('TECHNICIAN (IT) - Phone: 7777777777, Password: tech123');
    console.log('STUDENT - Phone: 5555555555, Password: student123');
    console.log('========================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();