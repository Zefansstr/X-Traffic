const { MongoClient } = require('mongodb');

async function seedDepartments() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://Zefansstr:E2Mkfj6008ahlO8Q@cluster0.egvtm5y.mongodb.net/sales-dashboard?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db('sales-dashboard');
    const departmentsCollection = db.collection('departments');

    // Check if departments already exist
    const existingDepartments = await departmentsCollection.countDocuments();
    if (existingDepartments > 0) {
      console.log('Departments already exist:', existingDepartments);
      return;
    }

    // Default departments
    const defaultDepartments = [
      {
        name: 'TMT',
        code: 'TMT',
        description: 'TMT Customer Closing',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'CRT',
        code: 'CRT',
        description: 'Customer Registration Team',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert default departments
    await departmentsCollection.insertMany(defaultDepartments);
    console.log('✅ Default departments seeded successfully');
    console.log('Created departments:', defaultDepartments);

  } catch (error) {
    console.error('❌ Error seeding departments:', error);
  } finally {
    await client.close();
  }
}

seedDepartments(); 