// seeders/YYYYMMDDHHMMSS-create-admin-user.js
'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if admin user already exists
      const existingAdmin = await queryInterface.sequelize.query(
        "SELECT id FROM \"Users\" WHERE email = 'admin@gmail.com';",
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (existingAdmin.length > 0) {
        console.log('Admin user already exists, skipping creation.');
        return;
      }

      // Hash the password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('1234.xyz', salt);

      // Create admin user
      await queryInterface.bulkInsert('Users', [{
        username: 'admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'Admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);

      console.log('✅ Admin user created successfully');
      console.log('Email: admin@gmail.com');
      console.log('Password: 1234.xyz');
      console.log('Role: Admin');

    } catch (error) {
      console.error('❌ Error creating admin user:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Users', {
        email: 'admin@gmail.com'
      });
      console.log('Admin user removed successfully');
    } catch (error) {
      console.error('Error removing admin user:', error);
      throw error;
    }
  }
};

// -----------------------------------------------------------
// Alternative seeder for creating sample data
// seeders/YYYYMMDDHHMMSS-create-sample-users.js

'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const salt = await bcrypt.genSalt(12);
      const defaultPassword = await bcrypt.hash('password123', salt);

      const sampleUsers = [
        {
          username: 'hr_manager',
          email: 'hr@company.com',
          password: defaultPassword,
          role: 'HR',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          username: 'team_manager',
          email: 'manager@company.com',
          password: defaultPassword,
          role: 'Manager',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          username: 'john_employee',
          email: 'employee@company.com',
          password: defaultPassword,
          role: 'Employee',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Check if users already exist
      for (const userData of sampleUsers) {
        const existing = await queryInterface.sequelize.query(
          `SELECT id FROM "Users" WHERE email = '${userData.email}';`,
          { type: Sequelize.QueryTypes.SELECT }
        );

        if (existing.length === 0) {
          await queryInterface.bulkInsert('Users', [userData]);
          console.log(`✅ Created user: ${userData.email} (${userData.role})`);
        } else {
          console.log(`ℹ️  User already exists: ${userData.email}`);
        }
      }

    } catch (error) {
      console.error('❌ Error creating sample users:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const emails = [
      'hr@company.com',
      'manager@company.com', 
      'employee@company.com'
    ];

    await queryInterface.bulkDelete('Users', {
      email: emails
    });
  }
};