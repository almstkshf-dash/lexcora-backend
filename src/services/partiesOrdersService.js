// partiesOrdersService.js
// Service functions for parties orders

const partiesOrdersModel = require('../models/partiesOrdersModel');
const { sendNotification, sendSystemNotification } = require('../utils/notificationHelper');

const getAllPartiesOrders = async (filters) => {
  try {
    return await partiesOrdersModel.getAllPartiesOrders(filters);
  } catch (error) {
    console.error("Error in getAllPartiesOrders service:", error);
    throw error;
  }
};

const getPartyOrderById = async (id) => {
  try {
    const order = await partiesOrdersModel.getPartyOrderById(id);
    if (!order) {
      throw new Error("Party order not found");
    }
    return order;
  } catch (error) {
    console.error("Error in getPartyOrderById service:", error);
    throw error;
  }
};

const getOrdersByPartyId = async (partyId) => {
  try {
    return await partiesOrdersModel.getOrdersByPartyId(partyId);
  } catch (error) {
    console.error("Error in getOrdersByPartyId service:", error);
    throw error;
  }
};

const createPartyOrder = async (orderData, createdBy) => {
  try {
    const result = await partiesOrdersModel.createPartyOrder(orderData);
    
    // Send notification about new party order
    try {
      // Fetch party name to include in notification
      const partyInfo = await partiesOrdersModel.getPartyOrderById(result);
      const partyName = partyInfo ? partyInfo.party_name : 'غير معروف';
      
      // Send system-wide notification (all users can see it)
      await sendSystemNotification({
        title: "طلب عميل جديد",
        message: `تم إنشاء طلب عميل جديد: "${orderData.type}" للعميل: ${partyName}`,
        type: "info",
        relatedType: "client request",
        createdBy: createdBy
      });
      
      // If there's an assigned employee, notify them specifically
      // Uncomment if you have an assigned_to field:
      // if (orderData.assigned_to) {
      //   await sendNotification({
      //     recipientId: orderData.assigned_to,
      //     title: "تم تعيين أمر طرف جديد",
      //     message: `تم تعيينك لأمر طرف: "${orderData.type}" - ${orderData.case_number || 'لا يوجد رقم قضية'}`,
      //     type: "info",
      //     relatedType: "party order",
      //     createdBy: createdBy
      //   });
      // }
    } catch (notifyError) {
      console.error('Error sending party order notification:', notifyError);
      // Don't throw - party order creation should succeed even if notification fails
    }
    
    return result;
  } catch (error) {
    console.error("Error in createPartyOrder service:", error);
    throw error;
  }
};

const updatePartyOrder = async (id, orderData, updatedBy) => {
  try {
    // Get current order data to compare changes
    const currentOrder = await partiesOrdersModel.getPartyOrderById(id);
    
    const updated = await partiesOrdersModel.updatePartyOrder(id, orderData);
    if (!updated) {
      throw new Error("Party order not found or not updated");
    }
    
    // Send notifications for important status changes
    if (currentOrder && currentOrder.status !== orderData.status) {
      try {
        let notificationTitle = "تحديث طلب عميل";
        let notificationMessage = `تم تغيير حالة طلب العميل من "${currentOrder.status}" إلى "${orderData.status}"`;
        let notificationType = "info";
        
        // Customize notification based on status change
        if (orderData.status === 'completed') {
          notificationTitle = "اكتمل طلب العميل";
          notificationMessage = `تم إكمال طلب العميل "${currentOrder.type}"`;
          notificationType = "success";
        } else if (orderData.status === 'cancelled') {
          notificationTitle = "تم إلغاء طلب العميل";
          notificationMessage = `تم إلغاء طلب العميل "${currentOrder.type}"`;
          notificationType = "warning";
        } else if (orderData.status === 'pending') {
          notificationTitle = "طلب العميل قيد الانتظار";
          notificationMessage = `طلب العميل "${currentOrder.type}" الآن قيد الانتظار`;
          notificationType = "info";
        }
        
        // Send system-wide notification for important status changes
        await sendSystemNotification({
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          relatedType: "client request",
          createdBy: updatedBy
        });
        
        // If there's an assigned employee, notify them specifically
        // Uncomment if you have an assigned_to field:
        // if (currentOrder.assigned_to) {
        //   await sendNotification({
        //     recipientId: currentOrder.assigned_to,
        //     title: notificationTitle,
        //     message: notificationMessage,
        //     type: notificationType,
        //     relatedType: "party order",
        //     createdBy: updatedBy
        //   });
        // }
      } catch (notifyError) {
        console.error('Error sending party order update notification:', notifyError);
      }
    }
    
    return { message: "Party order updated successfully" };
  } catch (error) {
    console.error("Error in updatePartyOrder service:", error);
    throw error;
  }
};

const deletePartyOrder = async (id) => {
  try {
    const deleted = await partiesOrdersModel.deletePartyOrder(id);
    if (!deleted) {
      throw new Error("Party order not found or not deleted");
    }
    return { message: "Party order deleted successfully" };
  } catch (error) {
    console.error("Error in deletePartyOrder service:", error);
    throw error;
  }
};

module.exports = {
  getAllPartiesOrders,
  getPartyOrderById,
  getOrdersByPartyId,
  createPartyOrder,
  updatePartyOrder,
  deletePartyOrder
};
