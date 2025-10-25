const { 
  getWorkHours, 
  createWorkHours, 
  updateWorkHours 
} = require("../models/workHoursModel");

// Get current working hours
const getWorkingHours = async (req, res) => {
  try {
    const workHours = await getWorkHours();
    
    if (!workHours) {
      // If no work hours exist, return default values
      return res.status(200).json({
        success: true,
        data: {
          id: null,
          start_time: "09:00",
          end_time: "17:00"
        }
      });
    }

    res.status(200).json({
      success: true,
      data: workHours
    });
  } catch (error) {
    console.error("Error fetching working hours:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch working hours"
    });
  }
};

// Update working hours
const updateWorkingHours = async (req, res) => {
  try {
    const { start_time, end_time } = req.body;

    // Validate input
    if (!start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "Start time and end time are required"
      });
    }

    // Validate and format time (accepts HH:MM or HH:MM:SS)
    const timeRegexWithSeconds = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    
    // Trim any whitespace and ensure string format
    let trimmedStartTime = String(start_time).trim();
    let trimmedEndTime = String(end_time).trim();
    
    // Remove seconds if present (convert HH:MM:SS to HH:MM)
    if (trimmedStartTime.includes(':') && trimmedStartTime.split(':').length === 3) {
      const parts = trimmedStartTime.split(':');
      trimmedStartTime = `${parts[0]}:${parts[1]}`;
    }
    if (trimmedEndTime.includes(':') && trimmedEndTime.split(':').length === 3) {
      const parts = trimmedEndTime.split(':');
      trimmedEndTime = `${parts[0]}:${parts[1]}`;
    }
    
    // Ensure 2-digit format (e.g., "9:00" becomes "09:00")
    if (trimmedStartTime.length === 4 && trimmedStartTime.charAt(1) === ':') {
      trimmedStartTime = '0' + trimmedStartTime;
    }
    if (trimmedEndTime.length === 4 && trimmedEndTime.charAt(1) === ':') {
      trimmedEndTime = '0' + trimmedEndTime;
    }
    
    // Final validation with HH:MM format
    const finalTimeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!finalTimeRegex.test(trimmedStartTime) || !finalTimeRegex.test(trimmedEndTime)) {
      return res.status(400).json({
        success: false,
        message: `Invalid time format. Received: start="${trimmedStartTime}", end="${trimmedEndTime}". Please use HH:MM format (e.g., 09:00, 17:30)`
      });
    }

    // Check if working hours already exist
    const existingWorkHours = await getWorkHours();

    let result;
    if (existingWorkHours && existingWorkHours.id) {
      // Update existing working hours
      result = await updateWorkHours(existingWorkHours.id, { 
        start_time: trimmedStartTime, 
        end_time: trimmedEndTime 
      });
      if (!result) {
        return res.status(400).json({
          success: false,
          message: "Failed to update working hours"
        });
      }
    } else {
      // Create new working hours
      result = await createWorkHours({ 
        start_time: trimmedStartTime, 
        end_time: trimmedEndTime 
      });
      if (!result) {
        return res.status(400).json({
          success: false,
          message: "Failed to create working hours"
        });
      }
    }

    // Fetch updated working hours
    const updatedWorkHours = await getWorkHours();

    res.status(200).json({
      success: true,
      message: "Working hours updated successfully",
      data: updatedWorkHours
    });
  } catch (error) {
    console.error("Error updating working hours:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update working hours"
    });
  }
};

module.exports = {
  getWorkingHours,
  updateWorkingHours
};