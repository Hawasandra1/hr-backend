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
