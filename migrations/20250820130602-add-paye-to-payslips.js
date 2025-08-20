'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payslips', 'paye', { // Table name is 'payslips'
      type: Sequelize.DECIMAL(10, 2), // Or INTEGER, FLOAT, etc. Choose the correct data type
      allowNull: true, // Or false, depending on your requirements
      defaultValue: 0
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('payslips', 'paye');
  }
};