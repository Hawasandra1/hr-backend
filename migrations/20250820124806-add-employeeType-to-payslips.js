'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('payslips', 'employeeType', {
      type: Sequelize.STRING,
      allowNull: true, // or false if required
      // Add any other constraints
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('payslips', 'employeeType');
  }
};