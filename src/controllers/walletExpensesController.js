// walletExpensesController.js
// Controller functions for wallet expenses

const db = require('../config/db');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { deleteFileFromR2 } = require('../services/cloudflareService');
const path = require('path');

// Generate invoice number
const generateInvoiceNumber = async () => {
  try {
    const [rows] = await db.query(
      'SELECT MAX(id) as maxId FROM wallet_expenses'
    );
    const nextId = (rows[0].maxId || 0) + 1;
    const year = new Date().getFullYear();
    return `INV-${year}-${String(nextId).padStart(6, '0')}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    throw error;
  }
};

// Get all expenses with pagination
const getAllExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const [expenses] = await db.query(`
      SELECT 
        we.*,
        c.case_number,
        c.file_number,
        p.name as client_name,
        e.name as employee_name,
        creator.name as created_by_name,
        verifier.name as verified_by_name,
        ba.bank_name,
        ba.account_number
      FROM wallet_expenses we
      LEFT JOIN cases c ON we.case_id = c.id
      LEFT JOIN parties p ON we.client_id = p.id
      LEFT JOIN employees e ON we.employee_relat_id = e.id
      LEFT JOIN employees creator ON we.created_by = creator.id
      LEFT JOIN employees verifier ON we.verified_by = verifier.id
      LEFT JOIN bank_accounts ba ON we.bank_account_id = ba.id
      ORDER BY we.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);
    
    // Get total count
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM wallet_expenses');
    const total = countResult[0].total;
    
    res.json({ 
      success: true, 
      data: expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all expenses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch expenses' });
  }
};

// Get all expenses for a wallet
const getExpensesByWalletId = async (req, res) => {
  try {
    const { walletId } = req.params;
    
    const [expenses] = await db.query(`
      SELECT 
        we.*,
        c.case_number,
        c.file_number,
        p.name as client_name,
        e.name as employee_name,
        creator.name as created_by_name,
        verifier.name as verified_by_name,
        ba.bank_name,
        ba.account_number
      FROM wallet_expenses we
      LEFT JOIN cases c ON we.case_id = c.id
      LEFT JOIN parties p ON we.client_id = p.id
      LEFT JOIN employees e ON we.employee_relat_id = e.id
      LEFT JOIN employees creator ON we.created_by = creator.id
      LEFT JOIN employees verifier ON we.verified_by = verifier.id
      LEFT JOIN bank_accounts ba ON we.bank_account_id = ba.id
      WHERE we.wallet_id = ?
      ORDER BY we.created_at DESC
    `, [walletId]);
    
    res.json({ success: true, data: expenses });
  } catch (error) {
    console.error('Error fetching wallet expenses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wallet expenses' });
  }
};

// Get single expense by ID with items
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Fetching expense with ID:', id);
    
    // Get expense
    const [expenses] = await db.query(`
      SELECT 
        we.*,
        c.case_number,
        c.file_number,
        p.name as client_name,
        e.name as employee_name,
        creator.name as created_by_name,
        verifier.name as verified_by_name,
        ba.bank_name,
        ba.account_number
      FROM wallet_expenses we
      LEFT JOIN cases c ON we.case_id = c.id
      LEFT JOIN parties p ON we.client_id = p.id
      LEFT JOIN employees e ON we.employee_relat_id = e.id
      LEFT JOIN employees creator ON we.created_by = creator.id
      LEFT JOIN employees verifier ON we.verified_by = verifier.id
      LEFT JOIN bank_accounts ba ON we.bank_account_id = ba.id
      WHERE we.id = ?
    `, [id]);
    
    console.log('Query result:', expenses.length, 'rows');
    
    if (expenses.length === 0) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    
    // Get expense items
    const [items] = await db.query(`
      SELECT * FROM wallet_expenses_items
      WHERE wallet_expense_id = ?
      ORDER BY id
    `, [id]);
    
    // Get receipts
    const [receipts] = await db.query(`
      SELECT 
        r.*,
        e.name as uploaded_by_name
      FROM wallet_expense_receipts r
      LEFT JOIN employees e ON r.uploaded_by = e.id
      WHERE r.wallet_expense_id = ?
      ORDER BY r.uploaded_at DESC
    `, [id]);
    
    const expense = expenses[0];
    expense.items = items;
    expense.receipts = receipts;
    
    console.log('Returning expense:', expense.id);
    
    res.json({ success: true, data: expense });
  } catch (error) {
    console.error('Error fetching expense:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: 'Failed to fetch expense', details: error.message });
  }
};

// Create new wallet expense
const createWalletExpense = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { 
      wallet_id, 
      client_id,
      amount,
      case_id,
      invoice_date,
      employee_relat_id,
      bank_account_id,
      items
    } = req.body;
    
    // Validate required fields
    if (!wallet_id || !amount || !invoice_date || !items || items.length === 0 || !bank_account_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet ID, Bank Account, Amount, Invoice Date, and Items are required' 
      });
    }
    
    // Validate amount is positive
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount must be greater than zero' 
      });
    }
    
    await connection.beginTransaction();
    
    // Calculate VAT (5%) and total with VAT
    const subtotal = parseFloat(amount);
    const vatAmount = subtotal * 0.05;
    const totalWithVat = subtotal + vatAmount;
    
    // Check wallet balance
    const [wallet] = await connection.query(
      'SELECT balance FROM wallets WHERE id = ?',
      [wallet_id]
    );
    
    if (wallet.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        error: 'Wallet not found' 
      });
    }
    
    const walletBalance = parseFloat(wallet[0].balance);
    if (totalWithVat > walletBalance) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient wallet balance' 
      });
    }
    
    // Check bank account balance
    const [bankAccount] = await connection.query(
      'SELECT current_balance FROM bank_accounts WHERE id = ?',
      [bank_account_id]
    );
    
    if (bankAccount.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        error: 'Bank account not found' 
      });
    }
    
    const bankBalance = parseFloat(bankAccount[0].current_balance);
    if (totalWithVat > bankBalance) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient bank account balance' 
      });
    }
    
    // Generate invoice number
    const invoice_number = await generateInvoiceNumber();
    
    // Get created_by from authenticated user
    const created_by = req.user?.id || req.userId || null;
    
    // Insert expense
    const [result] = await connection.query(`
      INSERT INTO wallet_expenses 
      (wallet_id, client_id, amount, case_id, invoice_number, invoice_date, employee_relat_id, bank_account_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [wallet_id, client_id, amount, case_id || null, invoice_number, invoice_date, employee_relat_id || null, bank_account_id, created_by]);
    
    const expenseId = result.insertId;
    
    // Insert expense items
    for (const item of items) {
      await connection.query(`
        INSERT INTO wallet_expenses_items 
        (wallet_expense_id, description, amount)
        VALUES (?, ?, ?)
      `, [expenseId, item.description, item.amount]);
    }
    
    // Update wallet balance (decrease by total including VAT)
    await connection.query(`
      UPDATE wallets 
      SET balance = balance - ?
      WHERE id = ?
    `, [totalWithVat, wallet_id]);
    
    // Update bank account balance (decrease by total including VAT)
    await connection.query(`
      UPDATE bank_accounts 
      SET current_balance = current_balance - ?
      WHERE id = ?
    `, [totalWithVat, bank_account_id]);
    
    await connection.commit();
    
    res.status(201).json({ 
      success: true, 
      message: 'Wallet expense created successfully',
      data: { id: expenseId, invoice_number }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating wallet expense:', error);
    res.status(500).json({ success: false, error: 'Failed to create wallet expense' });
  } finally {
    connection.release();
  }
};

// Update wallet expense
const updateWalletExpense = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id } = req.params;
    const { 
      amount,
      case_id,
      invoice_date,
      employee_relat_id,
      bank_account_id,
      items
    } = req.body;
    
    await connection.beginTransaction();
    
    // Get old amount to adjust wallet balance
    const [oldExpense] = await connection.query(
      'SELECT amount, wallet_id, bank_account_id FROM wallet_expenses WHERE id = ?',
      [id]
    );
    
    if (oldExpense.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    
    const oldAmount = parseFloat(oldExpense[0].amount);
    const newAmount = parseFloat(amount);
    const walletId = oldExpense[0].wallet_id;
    const oldBankAccountId = oldExpense[0].bank_account_id;
    
    // Update expense
    await connection.query(`
      UPDATE wallet_expenses 
      SET amount = ?, case_id = ?, invoice_date = ?, employee_relat_id = ?, bank_account_id = ?
      WHERE id = ?
    `, [amount, case_id || null, invoice_date, employee_relat_id || null, bank_account_id, id]);
    
    // Delete old items
    await connection.query(
      'DELETE FROM wallet_expenses_items WHERE wallet_expense_id = ?',
      [id]
    );
    
    // Insert new items
    if (items && items.length > 0) {
      for (const item of items) {
        await connection.query(`
          INSERT INTO wallet_expenses_items 
          (wallet_expense_id, description, amount)
          VALUES (?, ?, ?)
        `, [id, item.description, item.amount]);
      }
    }
    
    // Update wallet balance (adjust for difference)
    const difference = newAmount - oldAmount;
    await connection.query(`
      UPDATE wallets 
      SET balance = balance - ?
      WHERE id = ?
    `, [difference, walletId]);
    
    // Update bank account balances
    // If bank account changed, restore old and deduct from new
    if (oldBankAccountId && bank_account_id && oldBankAccountId !== parseInt(bank_account_id)) {
      // Restore to old bank account
      await connection.query(`
        UPDATE bank_accounts 
        SET current_balance = current_balance + ?
        WHERE id = ?
      `, [oldAmount, oldBankAccountId]);
      
      // Deduct from new bank account
      await connection.query(`
        UPDATE bank_accounts 
        SET current_balance = current_balance - ?
        WHERE id = ?
      `, [newAmount, bank_account_id]);
    } else if (bank_account_id) {
      // Same bank account, just adjust for difference
      await connection.query(`
        UPDATE bank_accounts 
        SET current_balance = current_balance - ?
        WHERE id = ?
      `, [difference, bank_account_id]);
    }
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: 'Wallet expense updated successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating wallet expense:', error);
    res.status(500).json({ success: false, error: 'Failed to update wallet expense' });
  } finally {
    connection.release();
  }
};

// Delete wallet expense
const deleteWalletExpense = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();
    
    // Get expense details to restore wallet balance
    const [expense] = await connection.query(
      'SELECT amount, wallet_id, bank_account_id FROM wallet_expenses WHERE id = ?',
      [id]
    );
    
    if (expense.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    
    const amount = parseFloat(expense[0].amount);
    const walletId = expense[0].wallet_id;
    const bankAccountId = expense[0].bank_account_id;
    
    // Delete expense (items will be deleted automatically due to CASCADE)
    await connection.query('DELETE FROM wallet_expenses WHERE id = ?', [id]);
    
    // Restore wallet balance
    await connection.query(`
      UPDATE wallets 
      SET balance = balance + ?
      WHERE id = ?
    `, [amount, walletId]);
    
    // Restore bank account balance if bank_account_id exists
    if (bankAccountId) {
      await connection.query(`
        UPDATE bank_accounts 
        SET current_balance = current_balance + ?
        WHERE id = ?
      `, [amount, bankAccountId]);
    }
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: 'Wallet expense deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting wallet expense:', error);
    res.status(500).json({ success: false, error: 'Failed to delete wallet expense' });
  } finally {
    connection.release();
  }
};

// Get expense items
const getExpenseItems = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [items] = await db.query(`
      SELECT * FROM wallet_expenses_items
      WHERE wallet_expense_id = ?
      ORDER BY id
    `, [id]);
    
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching expense items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch expense items' });
  }
};

// Upload receipts for expense
const uploadReceipts = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided',
      });
    }

    // Check if expense exists
    const [expense] = await db.query(
      'SELECT id FROM wallet_expenses WHERE id = ?',
      [id]
    );
    
    if (expense.length === 0) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    // Configure R2 client
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    });

    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const folder = 'wallet-expense-receipts';
    const uploadedBy = req.user?.id || req.userId || null;

    const uploadPromises = req.files.map(async (file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const filename = `${timestamp}-${randomString}${fileExtension}`;
      const key = `${folder}/${filename}`;

      // Upload to R2
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(putCommand);

      // Get file URL
      const usePublicUrl = process.env.CLOUDFLARE_R2_USE_PUBLIC_URL === 'true';
      const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
      const fileUrl = usePublicUrl && publicUrl ? `${publicUrl}/${key}` : key;

      // Save to database
      const [result] = await db.query(`
        INSERT INTO wallet_expense_receipts 
        (wallet_expense_id, file_name, file_path, uploaded_by)
        VALUES (?, ?, ?, ?)
      `, [id, file.originalname, fileUrl, uploadedBy]);

      return {
        id: result.insertId,
        file_name: file.originalname,
        file_path: fileUrl,
        uploaded_at: new Date(),
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: 'Receipts uploaded successfully',
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Error uploading receipts:', error);
    res.status(500).json({ success: false, error: 'Failed to upload receipts' });
  }
};

// Get receipts for expense
const getExpenseReceipts = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [receipts] = await db.query(`
      SELECT 
        r.*,
        e.name as uploaded_by_name
      FROM wallet_expense_receipts r
      LEFT JOIN employees e ON r.uploaded_by = e.id
      WHERE r.wallet_expense_id = ?
      ORDER BY r.uploaded_at DESC
    `, [id]);
    
    res.json({ success: true, data: receipts });
  } catch (error) {
    console.error('Error fetching expense receipts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch receipts' });
  }
};

// Delete receipt
const deleteReceipt = async (req, res) => {
  try {
    const { id, receiptId } = req.params;
    
    // Get receipt details
    const [receipt] = await db.query(
      'SELECT file_path FROM wallet_expense_receipts WHERE id = ? AND wallet_expense_id = ?',
      [receiptId, id]
    );
    
    if (receipt.length === 0) {
      return res.status(404).json({ success: false, error: 'Receipt not found' });
    }
    
    // Delete from R2
    await deleteFileFromR2(receipt[0].file_path);
    
    // Delete from database
    await db.query('DELETE FROM wallet_expense_receipts WHERE id = ?', [receiptId]);
    
    res.json({ 
      success: true, 
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({ success: false, error: 'Failed to delete receipt' });
  }
};

// Approve expense (verify)
const approveExpense = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id } = req.params;
    const verifiedBy = req.user?.id || req.userId || null;
    
    await connection.beginTransaction();
    
    // Check if expense exists and is pending
    const [expense] = await connection.query(
      'SELECT status FROM wallet_expenses WHERE id = ?',
      [id]
    );
    
    if (expense.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    
    if (expense[0].status === 'verified') {
      await connection.rollback();
      return res.status(400).json({ success: false, error: 'Expense already verified' });
    }
    
    // Update status to verified
    await connection.query(`
      UPDATE wallet_expenses 
      SET status = 'verified', verified_by = ?, verified_at = NOW()
      WHERE id = ?
    `, [verifiedBy, id]);
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: 'Expense approved successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error approving expense:', error);
    res.status(500).json({ success: false, error: 'Failed to approve expense' });
  } finally {
    connection.release();
  }
};

// Reject expense
const rejectExpense = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const verifiedBy = req.user?.id || req.userId || null;
    
    if (!rejection_reason) {
      return res.status(400).json({ success: false, error: 'Rejection reason is required' });
    }
    
    await connection.beginTransaction();
    
    // Get expense details
    const [expense] = await connection.query(
      'SELECT status, amount, wallet_id, bank_account_id FROM wallet_expenses WHERE id = ?',
      [id]
    );
    
    if (expense.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    
    if (expense[0].status === 'rejected') {
      await connection.rollback();
      return res.status(400).json({ success: false, error: 'Expense already rejected' });
    }
    
    if (expense[0].status === 'verified') {
      await connection.rollback();
      return res.status(400).json({ success: false, error: 'Cannot reject verified expense' });
    }
    
    const amount = parseFloat(expense[0].amount);
    const walletId = expense[0].wallet_id;
    const bankAccountId = expense[0].bank_account_id;
    
    // Update status to rejected
    await connection.query(`
      UPDATE wallet_expenses 
      SET status = 'rejected', verified_by = ?, verified_at = NOW(), rejection_reason = ?
      WHERE id = ?
    `, [verifiedBy, rejection_reason, id]);
    
    // Refund wallet balance
    await connection.query(`
      UPDATE wallets 
      SET balance = balance + ?
      WHERE id = ?
    `, [amount, walletId]);
    
    // Refund bank account balance if exists
    if (bankAccountId) {
      await connection.query(`
        UPDATE bank_accounts 
        SET current_balance = current_balance + ?
        WHERE id = ?
      `, [amount, bankAccountId]);
    }
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: 'Expense rejected and amount refunded'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error rejecting expense:', error);
    res.status(500).json({ success: false, error: 'Failed to reject expense' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllExpenses,
  getExpensesByWalletId,
  getExpenseById,
  createWalletExpense,
  updateWalletExpense,
  deleteWalletExpense,
  getExpenseItems,
  uploadReceipts,
  getExpenseReceipts,
  deleteReceipt,
  approveExpense,
  rejectExpense
};

