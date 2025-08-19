'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Password123', salt); // <-- CHANGE THIS PASSWORD

    await queryInterface.bulkInsert('users', [{
      username: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'Admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@gmail.com' }, {});
  }
};