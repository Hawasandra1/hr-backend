'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payslips', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      payslipId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      payPeriodStartDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      payPeriodEndDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      employeeType: {
        type: Sequelize.ENUM('Hourly', 'Salaried', 'Commission'),
        allowNull: false,
      },
      grossPay: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      paye: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      nssf: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      otherDeductions: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      deductions: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      netPay: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Generated', 'Approved', 'Pending Approval', 'Rejected', 'Downloaded'),
        allowNull: false,
        defaultValue: 'Generated',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payslips');
  }
};