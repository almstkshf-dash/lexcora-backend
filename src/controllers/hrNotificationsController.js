const db = require("../config/db");

// Get notifications for expired and near-expiry dates
const getNotifications = async (req, res) => {
  try {
    const { days_threshold = 30 } = req.query; // Default to 30 days before expiry
    
    // Employee notifications query
    const employeeQuery = `
      SELECT 
        e.id,
        e.name,
        e.residence_end_date,
        e.id_end_date,
        e.passport_end_date,
        e.labor_card_end_date,
        e.health_insurance_end_date,
        e.contract_end_date,
        d.name_ar as department_name,
        'employee' as notification_type
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE (
        (e.residence_end_date IS NOT NULL AND e.residence_end_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)) OR
        (e.id_end_date IS NOT NULL AND e.id_end_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)) OR
        (e.passport_end_date IS NOT NULL AND e.passport_end_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)) OR
        (e.labor_card_end_date IS NOT NULL AND e.labor_card_end_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)) OR
        (e.health_insurance_end_date IS NOT NULL AND e.health_insurance_end_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)) OR
        (e.contract_end_date IS NOT NULL AND e.contract_end_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY))
      )
      ORDER BY e.name
    `;

    // Assets notifications query  
    const assetsQuery = `
      SELECT 
        a.id,
        a.name,
        a.expiry_date,
        a.record_type,
        b.name_ar as branch_name,
        'asset' as notification_type
      FROM assets a
      LEFT JOIN branches b ON a.branch_id = b.id
      WHERE a.expiry_date IS NOT NULL 
        AND a.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY a.expiry_date
    `;

    // Execute both queries
    const [employeeResults] = await db.query(employeeQuery, [
      days_threshold, days_threshold, days_threshold, 
      days_threshold, days_threshold, days_threshold
    ]);
    
    const [assetResults] = await db.query(assetsQuery, [days_threshold]);

    // Process employee notifications
    const employeeNotifications = [];
    employeeResults.forEach(employee => {
      const dateFields = [
        { field: 'residence_end_date', label_ar: 'تاريخ انتهاء الإقامة', label_en: 'Residence End Date' },
        { field: 'id_end_date', label_ar: 'تاريخ انتهاء الهوية', label_en: 'ID End Date' },
        { field: 'passport_end_date', label_ar: 'تاريخ انتهاء الجواز', label_en: 'Passport End Date' },
        { field: 'labor_card_end_date', label_ar: 'تاريخ انتهاء رخصة العمل', label_en: 'Labor Card End Date' },
        { field: 'health_insurance_end_date', label_ar: 'تاريخ انتهاء التأمين الصحي', label_en: 'Health Insurance End Date' },
        { field: 'contract_end_date', label_ar: 'تاريخ انتهاء العقد', label_en: 'Contract End Date' }
      ];

      dateFields.forEach(dateField => {
        const dateValue = employee[dateField.field];
        if (dateValue) {
          const today = new Date();
          const expiryDate = new Date(dateValue);
          const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
          
          let status = 'upcoming';
          if (daysRemaining < 0) {
            status = 'expired';
          } else if (daysRemaining <= 7) {
            status = 'critical';
          } else if (daysRemaining <= 30) {
            status = 'warning';
          }

          employeeNotifications.push({
            id: `emp_${employee.id}_${dateField.field}`,
            employee_id: employee.id,
            employee_name: employee.name,
            department_name: employee.department_name,
            document_type_ar: dateField.label_ar,
            document_type_en: dateField.label_en,
            expiry_date: dateValue,
            days_remaining: daysRemaining,
            status: status,
            type: 'employee'
          });
        }
      });
    });

    // Process asset notifications
    const assetNotifications = assetResults.map(asset => {
      const today = new Date();
      const expiryDate = new Date(asset.expiry_date);
      const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      let status = 'upcoming';
      if (daysRemaining < 0) {
        status = 'expired';
      } else if (daysRemaining <= 7) {
        status = 'critical';
      } else if (daysRemaining <= 30) {
        status = 'warning';
      }

      return {
        id: `asset_${asset.id}`,
        asset_id: asset.id,
        asset_name: asset.name,
        branch_name: asset.branch_name,
        record_type: asset.record_type,
        expiry_date: asset.expiry_date,
        days_remaining: daysRemaining,
        status: status,
        type: 'asset'
      };
    });

    // Combine and sort all notifications by urgency and expiry date
    const allNotifications = [...employeeNotifications, ...assetNotifications];
    const statusPriority = { 'expired': 0, 'critical': 1, 'warning': 2, 'upcoming': 3 };
    
    allNotifications.sort((a, b) => {
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      return a.days_remaining - b.days_remaining;
    });

    // Summary statistics
    const summary = {
      total: allNotifications.length,
      expired: allNotifications.filter(n => n.status === 'expired').length,
      critical: allNotifications.filter(n => n.status === 'critical').length,
      warning: allNotifications.filter(n => n.status === 'warning').length,
      upcoming: allNotifications.filter(n => n.status === 'upcoming').length,
      employees: employeeNotifications.length,
      assets: assetNotifications.length
    };

    res.json({
      success: true,
      data: {
        notifications: allNotifications,
        employee_notifications: employeeNotifications,
        asset_notifications: assetNotifications,
        summary: summary
      }
    });

  } catch (err) {
    console.error('Notifications error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  getNotifications
};