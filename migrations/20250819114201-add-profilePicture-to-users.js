'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // This function runs when you migrate
    await queryInterface.addColumn('users', 'profilePicture', {
      type: Sequelize.STRING, // Or whatever data type you need (e.g., Sequelize.TEXT)
      allowNull: true,      // Set to false if the picture is required
    });
  },

  async down(queryInterface, Sequelize) {
    // This function runs if you need to undo the migration
    await queryInterface.removeColumn('users', 'profilePicture');
  }
};