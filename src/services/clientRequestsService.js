const clientRequestsModel = require("../models/clientRequestsModel");
const { sendNotification, sendSystemNotification } = require("../utils/notificationHelper");

const addClientRequest = async (clientRequestData, createdBy) => {
  try {
    const result = await clientRequestsModel.addClientRequest(clientRequestData);
    
    // Send notification about new client request
    try {
      // Send system-wide notification (all users can see it)
      await sendSystemNotification({
        title: "New Client Request",
        message: `New client request received: "${clientRequestData.type}" - ${clientRequestData.details}`,
        type: "info",
        relatedType: "client requset", // Note: using "client requset" to match your database enum
        createdBy: createdBy
      });
      
      // If you want to notify a specific employee instead, uncomment and use:
      // if (clientRequestData.assigned_to) {
      //   await sendNotification({
      //     recipientId: clientRequestData.assigned_to,
      //     title: "New Client Request Assigned",
      //     message: `You have been assigned a client request: "${clientRequestData.type}" - ${clientRequestData.details}`,
      //     type: "info",
      //     relatedType: "client request",
      //     createdBy: createdBy
      //   });
      // }
    } catch (notifyError) {
      console.error('Error sending client request notification:', notifyError);
      // Don't throw - client request creation should succeed even if notification fails
    }
    
    return result;
  } catch (error) {
    console.error("Error in addClientRequest service:", error);
    throw error;
  }
};

const getAllClientRequests = async () => {
  try {
    const clientRequests = await clientRequestsModel.getAllClientRequests();
    return clientRequests;
  } catch (error) {
    console.error("Error in getAllClientRequests service:", error);
    throw error;
  }
};

const getClientRequestById = async (id) => {
  try {
    const clientRequest = await clientRequestsModel.getClientRequestById(id);
    if (!clientRequest) {
      throw new Error("Client request not found");
    }
    return clientRequest;
  } catch (error) {
    console.error("Error in getClientRequestById service:", error);
    throw error;
  }
};

const getClientRequestsByClientId = async (client_id) => {
  try {
    const clientRequests = await clientRequestsModel.getClientRequestsByClientId(client_id);
    return clientRequests;
  } catch (error) {
    console.error("Error in getClientRequestsByClientId service:", error);
    throw error;
  }
};

const updateClientRequest = async (id, clientRequestData, updatedBy) => {
  console.log("Updating client request with data:", clientRequestData);
  try {
    // Get current request data to compare changes
    const currentRequest = await clientRequestsModel.getClientRequestById(id);
    
    const updated = await clientRequestsModel.updateClientRequest(id, clientRequestData);
    if (!updated) {
      throw new Error("Client request not found or not updated");
    }
    
    // Send notifications for important status changes
    if (currentRequest && currentRequest.status !== clientRequestData.status) {
      try {
        let notificationTitle = "Client Request Updated";
        let notificationMessage = `Client request status changed from "${currentRequest.status}" to "${clientRequestData.status}"`;
        let notificationType = "info";
        
        // Customize notification based on status change
        if (clientRequestData.status === 'approved') {
          notificationTitle = "Client Request Approved";
          notificationMessage = `Client request "${currentRequest.type}" has been approved`;
          notificationType = "success";
        } else if (clientRequestData.status === 'rejected') {
          notificationTitle = "Client Request Rejected";
          notificationMessage = `Client request "${currentRequest.type}" has been rejected`;
          notificationType = "warning";
        } else if (clientRequestData.status === 'completed') {
          notificationTitle = "Client Request Completed";
          notificationMessage = `Client request "${currentRequest.type}" has been completed`;
          notificationType = "success";
        }
        
        // Send notification to assigned employee if any
        if (currentRequest.assigned_to) {
          await sendNotification({
            recipientId: currentRequest.assigned_to,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
            relatedType: "client request",
            createdBy: updatedBy
          });
        }
      } catch (notifyError) {
        console.error('Error sending client request update notification:', notifyError);
      }
    }
    
    return { message: "Client request updated successfully" };
  } catch (error) {
    console.error("Error in updateClientRequest service:", error);
    throw error;
  }
};

const deleteClientRequest = async (id) => {
  try {
    const deleted = await clientRequestsModel.deleteClientRequest(id);
    if (!deleted) {
      throw new Error("Client request not found or not deleted");
    }
    return { message: "Client request deleted successfully" };
  } catch (error) {
    console.error("Error in deleteClientRequest service:", error);
    throw error;
  }
};

module.exports = {
  addClientRequest,
  getAllClientRequests,
  getClientRequestById,
  getClientRequestsByClientId,
  updateClientRequest,
  deleteClientRequest,
};