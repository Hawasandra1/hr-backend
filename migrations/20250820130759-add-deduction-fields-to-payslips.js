'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // We use Promise.all to run all column additions concurrently
    await Promise.all([
      queryInterface.addColumn('payslips', 'paye', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      }),
      queryInterface.addColumn('payslips', 'nssf', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      }),
      queryInterface.addColumn('payslips', 'otherDeductions', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    // The 'down' function should reverse the changes made in 'up'
    await Promise.all([
      queryInterface.removeColumn('payslips', 'paye'),
      queryInterface.removeColumn('payslips', 'nssf'),
      queryInterface.removeColumn('payslips', 'otherDeductions'),
    ]);
  }
};