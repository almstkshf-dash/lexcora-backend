const {
  getEmployeeAttendance,
  getWorkHours,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../models/employeeAttendanceModel");

// Get attendance records for an employee
const getAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Fetch attendance records and work hours in parallel
    const [attendanceRecords, workHours] = await Promise.all([
      getEmployeeAttendance(employeeId),
      getWorkHours(),
    ]);

    res.json({
      success: true,
      data: {
        attendance: attendanceRecords,
        workHours: workHours,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Create new attendance record
const addAttendance = async (req, res) => {
  try {
    const { employee_id, checkin, checkout } = req.body;
    const created_by = req.user?.id || null;

    if (!employee_id || !checkin) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and check-in time are required",
      });
    }

    // Convert ISO datetime to MySQL format (YYYY-MM-DD HH:MM:SS)
    const formatDateTime = (isoString) => {
      if (!isoString) return null;
      const date = new Date(isoString);
      return date
    };

    const formattedCheckin = formatDateTime(checkin);
    const formattedCheckout = checkout ? formatDateTime(checkout) : null;

    const attendanceId = await createAttendance({
      employee_id,
      checkin: formattedCheckin,
      checkout: formattedCheckout,
      created_by,
    });

    res.status(201).json({
      success: true,
      message: "Attendance record created successfully",
      data: { id: attendanceId },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update attendance record
const updateAttendanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkin, checkout } = req.body;

    if (!checkin) {
      return res.status(400).json({
        success: false,
        message: "Check-in time is required",
      });
    }

    // Convert ISO datetime to MySQL format (YYYY-MM-DD HH:MM:SS)
    const formatDateTime = (isoString) => {
      if (!isoString) return null;
      const date = new Date(isoString);
      
      return date
    };

    const formattedCheckin = formatDateTime(checkin);
    const formattedCheckout = checkout ? formatDateTime(checkout) : null;

    const updated = await updateAttendance(id, { 
      checkin: formattedCheckin, 
      checkout: formattedCheckout 
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.json({
      success: true,
      message: "Attendance record updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete attendance record
const deleteAttendanceRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deleteAttendance(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getAttendance,
  addAttendance,
  updateAttendanceRecord,
  deleteAttendanceRecord,
};
