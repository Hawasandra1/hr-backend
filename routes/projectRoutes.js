const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

// Protect all project routes and authorize for Admin, HR, and Manager roles
router.use(protect);
router.use(authorize('Admin', 'HR', 'Manager'));

// Route to get all projects and create a new project
router.route('/')
    .get(projectController.getAllProjects)
    .post(projectController.createProject);

// Routes for a single project (get, update, delete)
router.route('/:id')
    .get(projectController.getProjectById)
    .put(projectController.updateProject)
    .delete(projectController.deleteProject);

module.exports = router;
