const db = require('../models');
const Project = db.Project;
const Employee = db.Employee; // Needed for including employee details

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin, HR, Manager)
exports.createProject = async (req, res) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json({ message: 'Project created successfully!', project });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Server error creating project.' });
    }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private (Admin, HR, Manager)
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            include: [{
                model: Employee,
                as: 'employee', // This matches the alias in the model's association
                attributes: ['id', 'firstName', 'lastName']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Server error fetching projects.' });
    }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private (Admin, HR, Manager)
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id, {
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'firstName', 'lastName']
            }]
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project by ID:', error);
        res.status(500).json({ message: 'Server error fetching project.' });
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin, HR, Manager)
exports.updateProject = async (req, res) => {
    try {
        const [updatedRows] = await Project.update(req.body, {
            where: { id: req.params.id }
        });
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Project not found or no changes made.' });
        }
        const updatedProject = await Project.findByPk(req.params.id);
        res.status(200).json({ message: 'Project updated successfully!', project: updatedProject });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Server error updating project.' });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin, HR, Manager)
exports.deleteProject = async (req, res) => {
    try {
        const deletedRows = await Project.destroy({
            where: { id: req.params.id }
        });
        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        res.status(200).json({ message: 'Project deleted successfully!' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Server error deleting project.' });
    }
};
