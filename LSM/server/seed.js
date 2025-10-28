// server/seed.js
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const config = require('./config');

// Import all models
const User = require('./models/User');
const Livestock = require('./models/Livestock');
const HealthRecord = require('./models/HealthRecord');
const BreedingRecord = require('./models/BreedingRecord');
const FeedingRecord = require('./models/FeedingRecord');
const ProductionRecord = require('./models/ProductionRecord');
const AnimalSale = require('./models/AnimalSale');
const ProductSale = require('./models/ProductSale');
const InventoryItem = require('./models/InventoryItem');
const Expense = require('./models/Expense');
const Income = require('./models/Income');
const Employee = require('./models/Employee');
const Task = require('./models/Task');
const Attendance = require('./models/Attendance');
const EnvironmentalData = require('./models/EnvironmentalData');
const Reminder = require('./models/Reminder');
const VeterinaryRecord = require('./models/VeterinaryRecord');

// --- Realistic Data Sets ---
const farmAnimals = {
  Cattle: ['Holstein', 'Angus', 'Hereford'],
  Sheep: ['Merino', 'Suffolk', 'Dorset'],
  Goat: ['Boer', 'Nubian', 'Alpine'],
  Pig: ['Yorkshire', 'Duroc', 'Berkshire'],
  Chicken: ['Leghorn', 'Rhode Island Red'],
};

const animalProducts = {
  Cattle: { type: 'Milk', unit: 'Liters' },
  Sheep: { type: 'Wool', unit: 'Kilograms' },
  Goat: { type: 'Milk', unit: 'Liters' },
  Pig: { type: 'Meat', unit: 'Kilograms' },
  Chicken: { type: 'Eggs', unit: 'Pieces' },
};

const feedTypes = ['Grain', 'Hay', 'Silage', 'Pasture', 'Concentrates'];

const healthIssues = {
  'Mastitis': 'Antibiotic treatment and udder care',
  'Lameness': 'Hoof trimming and anti-inflammatory medication',
  'Pneumonia': 'Course of antibiotics and supportive care',
  'Scours': 'Electrolytes and fluid therapy',
  'Bloat': 'Stomach tube and administration of anti-foaming agent',
  'Vaccination': 'Routine annual vaccination administered',
  'Parasite Control': 'Deworming medication administered',
};

const inventoryItems = [
  { itemName: 'Cattle Feed', category: 'Feed', unit: 'Kilograms' },
  { itemName: 'Chicken Feed', category: 'Feed', unit: 'Kilograms' },
  { itemName: 'Sheep Feed', category: 'Feed', unit: 'Kilograms' },
  { itemName: 'Mineral Blocks', category: 'Supplies', unit: 'Pieces' },
  { itemName: 'Hay Bales', category: 'Feed', unit: 'Pieces' },
  { itemName: 'Amoxicillin', category: 'Medicine', unit: 'Bottles' },
  { itemName: 'Ivermectin', category: 'Medicine', unit: 'Bottles' },
  { itemName: 'Fencing Wire', category: 'Equipment', unit: 'Pieces' }, // Changed 'Rolls' to 'Pieces'
  { itemName: 'Water Trough', category: 'Equipment', unit: 'Pieces' },
  { itemName: 'Milking Machine Liners', category: 'Equipment', unit: 'Pieces' },
];

const farmPositions = ['Farm Manager', 'Livestock Handler', 'Veterinary Technician', 'Farm Hand', 'Herdsman'];

const taskTitles = [
    'Repair fence in the north pasture',
    'Administer quarterly vaccinations to the sheep flock',
    'Move cattle to the lower field',
    'Clean and disinfect the milking parlor',
    'Organize the feed storage shed',
    'Perform health checks on newborn calves',
];

const reminderTitles = [
  'Schedule annual herd health check',
  'Check fences for storm damage',
  'Order new supply of cattle feed',
  'Rotate sheep to new pasture',
  'Clean and inspect milking equipment',
  'Plan for upcoming breeding season',
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');

    // Clear all existing data
    await Promise.all(Object.values(mongoose.connection.collections).map(collection => collection.deleteMany({})));
    console.log('Cleared all existing data.');

    // --- User ---
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
    });
    await user.save();
    const userId = user._id;
    console.log('Created 1 user.');

    // --- Livestock ---
    const livestockToInsert = [];
    const speciesKeys = Object.keys(farmAnimals);
    for (let i = 0; i < 200; i++) { // Reduced for faster seeding
      const species = faker.helpers.arrayElement(speciesKeys);
      const breed = faker.helpers.arrayElement(farmAnimals[species]);
      livestockToInsert.push({
        userId,
        name: faker.person.firstName(),
        species,
        breed,
        dateOfBirth: faker.date.past({ years: 5 }),
        gender: faker.helpers.arrayElement(['Male', 'Female']),
        healthStatus: faker.helpers.arrayElement(['Healthy', 'Sick', 'Under Treatment', 'Recovered']),
      });
    }
    const createdLivestock = await Livestock.insertMany(livestockToInsert);
    console.log(`${createdLivestock.length} livestock records created.`);

    // --- Breeding and Health Records ---
    const males = createdLivestock.filter(animal => animal.gender === 'Male');
    const females = createdLivestock.filter(animal => animal.gender === 'Female');
    const breedingRecordsToInsert = [];
    if (males.length > 0 && females.length > 0) {
      for (let i = 0; i < 50; i++) {
        const male = faker.helpers.arrayElement(males);
        const potentialPartners = females.filter(female => female.species === male.species);
        if (potentialPartners.length > 0) {
          const female = faker.helpers.arrayElement(potentialPartners);
          breedingRecordsToInsert.push({
            userId,
            animalId: female._id,
            partnerAnimalId: male._id,
            breedingDate: faker.date.past({ years: 1 }),
            outcome: faker.helpers.arrayElement(['Successful', 'Unsuccessful', 'Pending']),
          });
        }
      }
      if (breedingRecordsToInsert.length > 0) {
        await BreedingRecord.insertMany(breedingRecordsToInsert);
        console.log(`${breedingRecordsToInsert.length} breeding records created.`);
      }
    }

    // --- Staff and Tasks ---
    const employeesToInsert = [];
    for (let i = 0; i < 5; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        employeesToInsert.push({
            userId,
            name: `${firstName} ${lastName}`,
            position: faker.helpers.arrayElement(farmPositions),
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@farm.com`,
            phone: faker.phone.number(),
            hireDate: faker.date.past({ years: 3 }),
        });
    }
    const createdEmployees = await Employee.insertMany(employeesToInsert);
    console.log(`${createdEmployees.length} employee records created.`);

    const tasksToInsert = [];
    createdEmployees.forEach(employee => {
      for (let i = 0; i < 3; i++) {
        tasksToInsert.push({
          userId,
          title: faker.helpers.arrayElement(taskTitles),
          description: `Complete task by end of day.`,
          assignedTo: employee._id,
          animalId: faker.helpers.arrayElement(createdLivestock)._id,
          taskType: faker.helpers.arrayElement(['Feeding', 'Cleaning', 'Health Check', 'Milking']),
          dueDate: faker.date.future(),
        });
      }
    });
    await Task.insertMany(tasksToInsert);
    console.log(`${tasksToInsert.length} task records created.`);

    // --- Sales, Inventory, and Finance ---
    const inventoryToInsert = inventoryItems.map(item => ({
        userId,
        ...item,
        currentStock: faker.number.int({ min: 50, max: 200 }),
        minimumStock: 25,
    }));
    await InventoryItem.insertMany(inventoryToInsert);
    console.log(`${inventoryToInsert.length} inventory items created.`);
    
    const expensesToInsert = [];
    for (let i = 0; i < 100; i++) {
        const category = faker.helpers.arrayElement(['Feed', 'Medicine', 'Equipment', 'Labor', 'Utilities']);
        expensesToInsert.push({
            userId,
            expenseDate: faker.date.past({ years: 1 }),
            category,
            description: `Purchase of ${category.toLowerCase()}`,
            amount: faker.finance.amount(20, 400),
        });
    }
    await Expense.insertMany(expensesToInsert);
    console.log(`${expensesToInsert.length} expense records created.`);

    const incomeToInsert = [];
    const animalSalesToInsert = [];
    const productSalesToInsert = [];

    for(let i = 0; i < 25; i++) {
        const animal = faker.helpers.arrayElement(createdLivestock);
        const salePrice = parseFloat(faker.finance.amount(500, 5000));
        animalSalesToInsert.push({
            userId, animalId: animal._id, saleDate: faker.date.past({ years: 1 }),
            buyerName: faker.person.fullName(), salePrice, saleReason: 'Breeding',
        });
        incomeToInsert.push({
            userId, incomeDate: faker.date.recent(), category: 'Animal Sale',
            description: `Sale of ${animal.breed} ${animal.species}`, amount: salePrice,
        });
    }

    for(let i = 0; i < 75; i++) {
        const species = faker.helpers.arrayElement(speciesKeys);
        const product = animalProducts[species];
        const quantity = faker.number.int({ min: 10, max: 100 });
        const unitPrice = parseFloat(faker.finance.amount(1, 10));
        const totalPrice = quantity * unitPrice;
        productSalesToInsert.push({
            userId, productType: product.type, quantity, unit: product.unit, unitPrice, totalPrice,
            saleDate: faker.date.past({ years: 1 }), buyerName: faker.person.fullName(),
        });
        incomeToInsert.push({
            userId, incomeDate: faker.date.recent(), category: 'Product Sale',
            description: `Sale of ${quantity} ${product.unit} of ${product.type}`, amount: totalPrice,
        });
    }

    await AnimalSale.insertMany(animalSalesToInsert);
    console.log(`${animalSalesToInsert.length} animal sale records created.`);
    await ProductSale.insertMany(productSalesToInsert);
    console.log(`${productSalesToInsert.length} product sale records created.`);
    await Income.insertMany(incomeToInsert);
    console.log(`${incomeToInsert.length} income records created.`);
    
    // --- Other Records ---
    const feedingToInsert = [], productionToInsert = [], vetToInsert = [], remindersToInsert = [], envToInsert = [];
    createdLivestock.forEach(animal => {
        feedingToInsert.push({ userId, animalId: animal._id, feedType: faker.helpers.arrayElement(feedTypes), quantity: faker.number.int({ min: 5, max: 20 }), date: faker.date.recent() });
        productionToInsert.push({ userId, animalId: animal._id, date: faker.date.recent(), productType: animalProducts[animal.species].type, quantity: faker.number.int({ min: 10, max: 30 }) });
        const diagnosis = faker.helpers.arrayElement(Object.keys(healthIssues));
        vetToInsert.push({ userId, animalId: animal._id, appointmentDate: faker.date.recent(), vetName: faker.person.fullName(), diagnosis, treatment: healthIssues[diagnosis] });
        remindersToInsert.push({ userId, animalId: animal._id, title: faker.helpers.arrayElement(reminderTitles), reminderType: 'Other', dueDate: faker.date.future() });
    });
    
    for (let i = 0; i < 50; i++) {
      envToInsert.push({ userId, location: { city: faker.location.city() }, date: faker.date.past(), temperature: faker.number.int({ min: 10, max: 35 }), humidity: faker.number.int({ min: 30, max: 90 }), weatherCondition: 'Sunny' });
    }

    await FeedingRecord.insertMany(feedingToInsert);
    console.log(`${feedingToInsert.length} feeding records created.`);
    await ProductionRecord.insertMany(productionToInsert);
    console.log(`${productionToInsert.length} production records created.`);
    await VeterinaryRecord.insertMany(vetToInsert);
    console.log(`${vetToInsert.length} veterinary records created.`);
    await Reminder.insertMany(remindersToInsert);
    console.log(`${remindersToInsert.length} reminder records created.`);
    await EnvironmentalData.insertMany(envToInsert);
    console.log(`${envToInsert.length} environmental data records created.`);

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seedDatabase();