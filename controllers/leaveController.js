const db = require('../models');
const Leave = db.Leave;
const Employee = db.Employee;
const { Op } = require('sequelize');

// @desc    Employee requests a new leave
exports.requestLeave = async (req, res) => {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user.id; 

    if (!leaveType || !startDate || !endDate) {
        return res.status(400).json({ message: 'Leave type, start date, and end date are required.' });
    }

    try {
        const leave = await Leave.create({
            employeeId,
            leaveType,
            startDate,
            endDate,
            reason,
            status: 'Pending'
        });

        // --- NOTIFICATION LOGIC ---
        const connectedClients = req.app.locals.wss.clients.size;
        console.log(`Attempting to broadcast: Found ${connectedClients} connected WebSocket clients.`);

        if (connectedClients > 0) {
            // Find the employee's name for a better notification message
            const employee = await Employee.findByPk(employeeId, { attributes: ['firstName', 'lastName'] });
            const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'an employee';

            const notification = {
                type: 'NEW_LEAVE_REQUEST',
                payload: {
                    message: `New leave request from ${employeeName}.`,
                    leaveId: leave.id
                }
            };
            req.app.locals.broadcast(notification);
            console.log('Notification broadcasted successfully.');
        } else {
            console.log('No clients connected, skipping broadcast.');
        }

        res.status(201).json({ message: 'Leave request submitted successfully!', leave });
    } catch (error) {
        console.error('Error submitting leave request:', error);
        res.status(500).json({ message: 'Server error submitting leave request.' });
    }
};

// @desc    Get all leave requests for all employees
exports.getAllLeaveRequests = async (req, res) => {
    try {
        const leaves = await Leave.findAll({
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'firstName', 'lastName']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(leaves);
    } catch (error) {
        console.error('Error fetching all leave requests:', error);
        res.status(500).json({ message: 'Server error fetching leave requests.' });
    }
};

// @desc    Get all leave requests for the currently logged-in employee
exports.getMyLeaveRequests = async (req, res) => {
    const employeeId = req.user.id;
    try {
        const leaves = await Leave.findAll({
            where: { employeeId },
            order: [['startDate', 'DESC']]
        });
        res.status(200).json(leaves);
    } catch (error) {
        console.error('Error fetching employee leave requests:', error);
        res.status(500).json({ message: 'Server error fetching your leave requests.' });
    }
};

// @desc    Update the status of a leave request (Approve/Reject)
exports.updateLeaveStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be "Approved" or "Rejected".' });
    }

    try {
        const leave = await Leave.findByPk(id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found.' });
        }

        if (status === 'Approved') {
            await Employee.update({ status: 'on leave' }, { where: { id: leave.employeeId } });
        }
        
        leave.status = status;
        await leave.save();

        res.status(200).json({ message: `Leave request has been ${status.toLowerCase()}.`, leave });
    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(500).json({ message: 'Server error updating leave status.' });
    }
};
