const db = require('../config/db');

/**
 * Check if user has a specific permission
 * @param {string} requiredPermissionEn - English permission name (e.g., 'Add Case')
 */
const checkPermission = (requiredPermissionEn) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role_en;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      // Check if user is admin - admins bypass all permission checks
      if (userRole === 'admin') {
        return next();
      }

      // Check if user has the specific permission
      const [result] = await db.query(`
        SELECT 1
        FROM employee_permissions ep
        INNER JOIN permissions p ON ep.permission_id = p.id
        WHERE ep.employee_id = ? AND p.permission_en = ?
        LIMIT 1
      `, [userId, requiredPermissionEn]);

      if (result.length === 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'ليس لديك صلاحية للقيام بهذا الإجراء' 
        });
      }

      next();

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'حدث خطأ أثناء التحقق من الصلاحيات' 
      });
    }
  };
};



module.exports = {
  checkPermission,
};
