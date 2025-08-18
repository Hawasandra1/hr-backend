'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payslip extends Model {
    static associate(models) {
      Payslip.belongsTo(models.Employee, {
        foreignKey: 'employeeId',
        as: 'employee',
      });
    }
  }
  Payslip.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    payslipId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payPeriodStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    payPeriodEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    employeeType: {
      type: DataTypes.ENUM('Hourly', 'Salaried', 'Commission'),
      allowNull: false,
    },
    grossPay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // --- NEW FIELDS for specific deductions ---
    paye: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    nssf: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    otherDeductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    // --- UPDATED: This now represents the TOTAL deductions ---
    deductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
    },
    netPay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Generated', 'Approved', 'Pending Approval', 'Rejected', 'Downloaded'),
      allowNull: false,
      defaultValue: 'Generated',
    },
  }, {
    sequelize,
    modelName: 'Payslip',
    tableName: 'payslips',
    timestamps: true,
  });
  return Payslip;
};
