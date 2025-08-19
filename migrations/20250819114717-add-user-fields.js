'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // We use Promise.all to run all additions concurrently
    return Promise.all([
      queryInterface.addColumn('users', 'isActive', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      }),
      queryInterface.addColumn('users', 'lastLogin', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
      queryInterface.addColumn('users', 'departmentId', {
        type: Sequelize.INTEGER,
        allowNull: true, // or false depending on your logic
        references: {
          model: 'departments', // IMPORTANT: Make sure this table name is correct
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    // The 'down' function should remove all three columns
    return Promise.all([
      queryInterface.removeColumn('users', 'isActive'),
      queryInterface.removeColumn('users', 'lastLogin'),
      queryInterface.removeColumn('users', 'departmentId'),
    ]);
  }
};