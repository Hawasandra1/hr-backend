const db = require('../models');
const { Op } = require('sequelize');

// It's cleaner to get all models we need at the top
const { Employee, Leave, Project, Department } = db;

exports.getEmployeesOverview = async (req, res) => {
  try {
    // The authorization middleware already handles this, but it's good practice
    if (!req.user || !(['HR', 'Manager', 'Admin'].includes(req.user.role))) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // --- CORRECTED DATA FETCHING ---
    const totalEmployees = await Employee.count({ where: { status: 'active' } });
    const formerEmployees = await Employee.count({ where: { status: 'inactive' } });
    const totalLeaves = await Leave.count();
    // FIX: Changed status to 'Pending' to match the database model's ENUM definition
    const pendingLeaveApplication = await Leave.count({ where: { status: 'Pending' } });
    const totalProjects = await Project.count();

    // FIX: Changed status to 'Planning' to match the database model's ENUM definition
    const upcomingProjects = await Project.findAll({
      where: {
        status: 'Planning'
      },
      limit: 5,
      order: [['startDate', 'ASC']]
    });

    // --- Construct and Send Response ---
    res.status(200).json({
      totalEmployees,
      totalLeaves,
      totalProjects,
      formerEmployees,
      pendingLeaveApplication,
      upcomingProjects, // Send the full list for the "Upcoming Projects" card
    });

  } catch (error) {
    console.error("Error in getEmployeesOverview:", error);
    res.status(500).json({ message: 'Error retrieving employees overview.' });
  }
};

exports.getDepartmentEmployeeDistribution = async (req, res) => {
  try {
    const departmentDistribution = await Department.findAll({
      attributes: [
        'name',
        [db.sequelize.fn('COUNT', db.sequelize.col('employees.id')), 'count']
      ],
      include: [{
        model: Employee,
        as: 'employees',
        attributes: [],
        where: { status: 'active' },
        required: false // Use LEFT JOIN to include departments with 0 employees
      }],
      group: ['Department.id', 'Department.name'],
      order: [['name', 'ASC']]
    });

    // The raw query returns a count that is a string, so we parse it to an integer
    const formattedData = departmentDistribution.map(dept => ({
      name: dept.name,
      count: parseInt(dept.getDataValue('count') || 0)
    }));

    res.status(200).json(formattedData);

  } catch (error) {
    console.error("Error in getDepartmentEmployeeDistribution:", error);
    res.status(500).json({ message: 'Error retrieving department distribution.' });
  }
};

exports.getLeaveStatusBreakdown = async (req, res) => {
  try {
    const leaveStatus = await Leave.findAll({
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('status')), 'count']
      ],
      group: ['status'],
    });
    
    const formattedData = leaveStatus.map(item => ({
        status: item.status,
        count: parseInt(item.getDataValue('count') || 0)
    }));

    res.status(200).json(formattedData);

  } catch (error) {
    console.error("Error in getLeaveStatusBreakdown:", error);
    res.status(500).json({ message: 'Error retrieving leave status breakdown.' });
  }
};
