const executionsService = require('../services/executionsService');

const getAllExecutions = async (req, res) => {
  try {
    const executions = await executionsService.getAllExecutions();
    res.json({ success: true, data: executions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch executions' });
  }
};

const createExecution = async (req, res) => {
  try {
    
    const executionId = await executionsService.createExecution(req.body);
    res.status(201).json({ id: executionId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create execution' });
  }
};

const updateExecution = async (req, res) => {
  try {
    const success = await executionsService.updateExecution(req.params.id, req.body);
    if (success) {
      res.json({ message: 'Execution updated' });
    } else {
      res.status(404).json({ error: 'Execution not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update execution' });
  }
};

const deleteExecution = async (req, res) => {
  try {
    const success = await executionsService.deleteExecution(req.params.id);
    if (success) {
      res.json({ message: 'Execution deleted' });
    } else {
      res.status(404).json({ error: 'Execution not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete execution' });
  }
};

const getExecutionById = async (req, res) => {
  try {
    const execution = await executionsService.getExecutionById(req.params.id);
    if (execution) {
      res.json({ success: true, data: execution });
    } else {
      res.status(404).json({ success: false, error: 'Execution not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch execution' });
  }
};

const getExecutionsByDate = async (req, res) => {
  try {
    const executions = await executionsService.getExecutionsByDate(req.params.date);
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch executions by date' });
  }
};

const getExecutionsByType = async (req, res) => {
  try {
    const executions = await executionsService.getExecutionsByType(req.params.type);
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch executions by type' });
  }
};

const getExecutionsByStatus = async (req, res) => {
  try {
    const executions = await executionsService.getExecutionsByStatus(req.params.status);
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch executions by status' });
  }
};

const getExecutionsByAmountRange = async (req, res) => {
  try {
    const { minAmount, maxAmount } = req.params;
    const executions = await executionsService.getExecutionsByAmountRange(minAmount, maxAmount);
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch executions by amount range' });
  }
};

const getExecutionsByCaseId = async (req, res) => {
  try {
    const executions = await executionsService.getExecutionsByCaseId(req.params.caseId);

    res.json({ success: true, data: executions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch executions by case ID' });
  }
};

const deleteExecutionDocument = async (req, res) => {
  try {
    const success = await executionsService.deleteExecutionDocument(req.params.id);
    if (success) {
      res.json({ message: 'Execution document deleted successfully' });
    } else {
      res.status(404).json({ error: 'Execution document not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete execution document' });
  }
};

module.exports = {
  getAllExecutions,
  createExecution,
  updateExecution,
  deleteExecution,
  getExecutionById,
  getExecutionsByDate,
  getExecutionsByType,
  getExecutionsByStatus,
  getExecutionsByAmountRange,
  getExecutionsByCaseId,
  deleteExecutionDocument
};