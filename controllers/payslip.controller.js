const db = require('../models');
const Payslip = db.Payslip;
const Employee = db.Employee;

const generateUniquePayslipId = () => {
    const datePart = new Date().toISOString().slice(0,19).replace(/[^0-9]/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `PS-${datePart}-${randomPart}`;
};

// @desc    Generate a new payslip with automatic deductions
exports.generatePayslip = async (req, res) => {
    try {
        const {
            employeeId, payPeriodStartDate, payPeriodEndDate, employeeType,
            grossPay, deductions: otherDeductions = 0, notes
        } = req.body;

        if (!employeeId || !payPeriodStartDate || !payPeriodEndDate || !employeeType || grossPay === undefined) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        const grossPayFloat = parseFloat(grossPay);
        const otherDeductionsFloat = parseFloat(otherDeductions);
        const payeAmount = grossPayFloat * 0.088;
        const nssfAmount = grossPayFloat * 0.10;
        const totalDeductions = payeAmount + nssfAmount + otherDeductionsFloat;
        const netPay = grossPayFloat - totalDeductions;

        if (netPay < 0) {
            return res.status(400).json({ message: 'Net pay cannot be negative after deductions.' });
        }

        const payslip = await Payslip.create({
            payslipId: generateUniquePayslipId(),
            employeeId,
            payPeriodStartDate,
            payPeriodEndDate,
            employeeType,
            grossPay: grossPayFloat,
            paye: payeAmount,
            nssf: nssfAmount,
            otherDeductions: otherDeductionsFloat,
            deductions: totalDeductions,
            netPay: netPay,
            notes,
            status: 'Generated'
        });

        res.status(201).json({ message: 'Payslip generated successfully!', payslip });

    } catch (error) {
        console.error('Error generating payslip:', error);
        res.status(500).json({ message: 'Error generating payslip.' });
    }
};

// @desc    Get all payslip summaries for HR/Admin
exports.getAllPayslips = async (req, res) => {
    try {
        const payslips = await Payslip.findAll({
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'firstName', 'lastName']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(payslips);
    } catch (error) {
        console.error('Error fetching payslips:', error);
        res.status(500).json({ message: 'Error fetching payslip summary.' });
    }
};

// @desc    Get all payslips for the currently logged-in employee
exports.getMyPayslips = async (req, res) => {
    const employeeId = req.user.id; // From JWT token
    try {
        const payslips = await Payslip.findAll({
            where: { employeeId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(payslips);
    } catch (error) {
        console.error('Error fetching employee payslips:', error);
        res.status(500).json({ message: 'Server error fetching your payslips.' });
    }
};

// @desc    Get a single payslip by its primary key (id)
exports.getPayslipById = async (req, res) => {
    try {
        const payslip = await Payslip.findByPk(req.params.id, {
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'firstName', 'lastName', 'position', 'email']
            }]
        });

        if (!payslip) {
            return res.status(404).json({ message: 'Payslip not found.' });
        }

        // --- THIS IS THE SECURITY FIX ---
        // Check if the logged-in user is an employee and if they own this payslip.
        // Admins, HR, and Managers can view any payslip.
        if (req.user.role === 'Employee' && payslip.employeeId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to view this payslip.' });
        }

        res.status(200).json(payslip);
    } catch (error) {
        console.error('Error fetching payslip by ID:', error);
        res.status(500).json({ message: 'Error fetching payslip details.' });
    }
};

// @desc    Update an existing payslip
exports.updatePayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const [updatedRows] = await Payslip.update(updateData, { where: { id } });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Payslip not found or no changes made.' });
        }

        const updatedPayslip = await Payslip.findByPk(id);
        res.status(200).json({ message: 'Payslip updated successfully!', payslip: updatedPayslip });

    } catch (error) {
        console.error('Error updating payslip:', error);
        res.status(500).json({ message: 'Error updating payslip.' });
    }
};

// @desc    Delete a payslip
exports.deletePayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRows = await Payslip.destroy({ where: { id } });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Payslip not found.' });
        }

        res.status(200).json({ message: 'Payslip deleted successfully!' });

    } catch (error) {
        console.error('Error deleting payslip:', error);
        res.status(500).json({ message: 'Error deleting payslip.' });
    }
};
