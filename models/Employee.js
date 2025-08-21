'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      Employee.belongsTo(models.Department, {
        foreignKey: 'departmentId',
        as: 'department'
      });
    }
  }
  Employee.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Invalid email format.' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: { args: [6], msg: 'Password must be at least 6 characters long.' }
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Employee'
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // The 'salary' field has been removed from this model definition.
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'on leave'),
      allowNull: false,
      defaultValue: 'active'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Employee',
    tableName: 'employees',
    timestamps: true,
    hooks: {
      beforeCreate: async (employee) => {
        if (employee.password) {
          const salt = await bcrypt.genSalt(10);
          employee.password = await bcrypt.hash(employee.password, salt);
        }
      },
      beforeUpdate: async (employee) => {
        if (employee.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          employee.password = await bcrypt.hash(employee.password, salt);
        }
      }
    }
  });
  return Employee;
};
