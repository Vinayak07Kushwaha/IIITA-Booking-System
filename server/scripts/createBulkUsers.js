const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Generate users according to your specifications
const generateUsers = () => {
  const users = [];
  
  const categories = [
    { prefix: 'MML2024', count: 16, branch: 'MML', course: 'Machine Learning' },
    { prefix: 'MDE2024', count: 16, branch: 'MDE', course: 'Data Engineering' },
    { prefix: 'MSE2024', count: 16, branch: 'MSE', course: 'Software Engineering' },
    { prefix: 'MHC2024', count: 16, branch: 'MHC', course: 'Human Computer Interaction' },
    { prefix: 'MRM2024', count: 16, branch: 'MRM', course: 'Risk Management' },
    { prefix: 'MWC2024', count: 16, branch: 'MWC', course: 'Web Computing' }
  ];
  
  categories.forEach(category => {
    for (let i = 1; i <= category.count; i++) {
      const username = `${category.prefix}${i}`;
      const rollNumber = `${category.branch}2024${i.toString().padStart(3, '0')}`;
      
      users.push({
        rollNumber: rollNumber,
        username: username,
        name: `${category.course} Student ${i}`,
        email: `${username.toLowerCase()}@college.ac.in`,
        branch: category.branch,
        year: '1st',
        semester: '1st',
        course: category.course,
        password: 'password123'
      });
    }
  });
  
  return users;
};

const createBulkUsers = async () => {
  try {
    console.log('🗑️  Deleting ALL existing users with 2024 patterns...');
    
    // Delete ALL existing users with these patterns
    const deleteResult = await User.deleteMany({
      $or: [
        // Delete by rollNumber patterns (any 2024 pattern)
        { rollNumber: { $regex: /2024/ } },
        // Delete by username patterns (any 2024 pattern)
        { username: { $regex: /2024/ } }
      ]
    });
    
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing users`);
    
    // Wait for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📝 Creating 96 new users with corrected format...');
    
    const users = generateUsers();
    
    // Insert users one by one with better error handling
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        await User.create(user);
        successCount++;
        if (successCount % 16 === 0) {
          console.log(`✅ Created ${successCount} users...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error creating ${user.username}:`, error.message);
      }
    }
    
    console.log('\n🎉 User creation completed!');
    console.log(`✅ Successfully created: ${successCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    
    console.log('\n📊 Final username patterns:');
    console.log('MML20241 to MML202416 (Machine Learning)');
    console.log('MDE20241 to MDE202416 (Data Engineering)');
    console.log('MSE20241 to MSE202416 (Software Engineering)');
    console.log('MHC20241 to MHC202416 (Human Computer Interaction)');
    console.log('MRM20241 to MRM202416 (Risk Management)');
    console.log('MWC20241 to MWC202416 (Web Computing)');
    
    console.log('\n📋 Roll number format (3-digit):');
    console.log('MML2024001 to MML2024016');
    console.log('MDE2024001 to MDE2024016');
    console.log('MSE2024001 to MSE2024016');
    console.log('MHC2024001 to MHC2024016');
    console.log('MRM2024001 to MRM2024016');
    console.log('MWC2024001 to MWC2024016');
    
    console.log('\n🔐 Default password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

// Run the script
createBulkUsers();
