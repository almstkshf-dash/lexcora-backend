const db = require('../config/db');
const nodemailer = require('nodemailer');
const { uploadToS3, generatePresignedUrl } = require('../services/storageService');

// ─────────────────────────────────────────────
// Template CRUD
// ─────────────────────────────────────────────

const MESSAGE_TYPES = [
  'welcome_client',
  'acquittal',
  'price_quote',
  'eid_al_fitr',
  'eid_al_adha',
  'national_day',
  'islamic_new_year',
  'gregorian_new_year',
  'birthday',
  'ramadan'
];

// Ensure the client_messages table exists (idempotent)
const ensureTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS client_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      message_type VARCHAR(50) NOT NULL,
      title_ar TEXT,
      title_en TEXT,
      body_ar LONGTEXT,
      body_en LONGTEXT,
      image_url TEXT,
      extra_fields JSON,
      created_by INT,
      updated_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_message_type (message_type)
    )
  `);

  // Seed default templates if missing
  for (const type of MESSAGE_TYPES) {
    const [rows] = await db.query('SELECT id FROM client_messages WHERE message_type = ?', [type]);
    if (rows.length === 0) {
      const defaults = getDefaultTemplate(type);
      await db.query(
        'INSERT INTO client_messages (message_type, title_ar, title_en, body_ar, body_en) VALUES (?,?,?,?,?)',
        [type, defaults.title_ar, defaults.title_en, defaults.body_ar, defaults.body_en]
      );
    }
  }
};

const getDefaultTemplate = (type) => {
  const templates = {
    welcome_client: {
      title_ar: 'مرحباً بك في منصتنا القانونية',
      title_en: 'Welcome to Our Legal Portal',
      body_ar: 'عزيزي/عزيزتي {{client_name}}،\n\nيسعدنا انضمامك إلينا كموكل. يمكنك الوصول إلى بوابة الموكلين عبر الرابط التالي:\n{{portal_url}}\n\nبيانات تسجيل الدخول:\nالبريد الإلكتروني: {{email}}\nكلمة المرور المؤقتة: {{temp_password}}\n\nيرجى تغيير كلمة المرور عند أول تسجيل دخول.\n\nمع خالص التقدير،\nفريق {{firm_name}}',
      body_en: 'Dear {{client_name}},\n\nWe are pleased to welcome you as our client. You can access the client portal via:\n{{portal_url}}\n\nLogin credentials:\nEmail: {{email}}\nTemporary Password: {{temp_password}}\n\nPlease change your password upon first login.\n\nBest regards,\n{{firm_name}} Team'
    },
    acquittal: {
      title_ar: 'تهانينا بصدور حكم البراءة',
      title_en: 'Congratulations on Your Acquittal',
      body_ar: 'عزيزي/عزيزتي {{client_name}}،\n\nيسعدنا أن نبشرك بصدور حكم البراءة في قضيتك رقم {{case_number}}.\n\nملخص الحكم:\n{{verdict_summary}}\n\nنتمنى لك حياةً مليئة بالأمن والسعادة.\n\nمع خالص التقدير والاحترام،\nفريق {{firm_name}}',
      body_en: 'Dear {{client_name}},\n\nWe are delighted to inform you that the acquittal verdict has been issued in your case number {{case_number}}.\n\nVerdict Summary:\n{{verdict_summary}}\n\nWe wish you a life full of peace and happiness.\n\nWith warm regards,\n{{firm_name}} Team'
    },
    price_quote: {
      title_ar: 'عرض سعر مبدئي',
      title_en: 'Price Quote',
      body_ar: 'عزيزي/عزيزتي {{client_name}}،\n\nيسرنا في {{firm_name}} تقديم عرض السعر التالي للخدمات القانونية المطلوبة.\n\nالخدمات المقدمة:\n{{services_list}}\n\nالمبلغ الإجمالي: {{total_amount}} {{currency}}\n\nإذا كان لديكم أي استفسارات، فلا تترددوا في التواصل معنا.\n\nمع خالص التقدير،\nفريق {{firm_name}}',
      body_en: 'Dear {{client_name}},\n\nWe at {{firm_name}} are pleased to provide the following price quote for the requested legal services.\n\nProvided Services:\n{{services_list}}\n\nTotal Amount: {{total_amount}} {{currency}}\n\nShould you have any questions, please do not hesitate to contact us.\n\nBest regards,\n{{firm_name}} Team'
    },
    eid_al_fitr: {
      title_ar: 'كل عام وأنتم بخير بمناسبة عيد الفطر المبارك',
      title_en: 'Eid Al-Fitr Mubarak',
      body_ar: 'عزيزي/عزيزتي {{client_name}}،\n\nبمناسبة حلول عيد الفطر المبارك، نتقدم إليكم بأحر التهاني وأصدق التمنيات بدوام الصحة والسعادة والرفاهية.\n\nكل عام وأنتم بخير.\n\nفريق {{firm_name}}',
      body_en: 'Dear {{client_name}},\n\nOn the occasion of Eid Al-Fitr, we extend our warmest congratulations and sincere wishes for your continued health, happiness, and prosperity.\n\nEid Mubarak!\n\n{{firm_name}} Team'
    },
    eid_al_adha: {
      title_ar: 'كل عام وأنتم بخير بمناسبة عيد الأضحى المبارك',
      title_en: 'Eid Al-Adha Mubarak',
      body_ar: 'عزيزي/عزيزتي {{client_name}}،\n\nبمناسبة حلول عيد الأضحى المبارك، نتقدم إليكم بأحر التهاني وأصدق التمنيات بدوام الصحة والسعادة والرفاهية.\n\nكل عام وأنتم بخير.\n\nفريق {{firm_name}}',
      body_en: 'Dear {{client_name}},\n\nOn the occasion of Eid Al-Adha, we extend our warmest congratulations and sincere wishes for your continued health, happiness, and prosperity.\n\nEid Mubarak!\n\n{{firm_name}} Team'
    },
    national_day: {
      title_ar: 'تهانينا بمناسبة اليوم الوطني',
      title_en: 'Happy National Day',
      body_ar: 'عزيزي/عزيزتي {{client_name}}،\n\nبمناسبة اليوم الوطني لـ{{country_name}}، نتقدم بأسمى التهاني والتبريكات. ندعو الله أن يديم على هذا الوطن الأمن والازدهار.\n\nكل عام وأنتم بخير.\n\nفريق {{firm_name}}',
      body_en: 'Dear {{client_name}},\n\nOn the occasion of {{country_name}} National Day, we extend our warmest congratulations. May this nation continue to flourish and prosper.\n\nBest wishes,\n{{firm_name}} Team'
    },
    islamic_new_year: {
      title_ar: 'عام هجري جديد مبارك',
      title_en: 'Happy Islamic New Year',
      body_ar: 'عزيزي/عزيزتي {{client_name}}،\n\nبمناسبة حلول العام الهجري الجديد، نتقدم بأحر التهاني وأطيب التمنيات. نسأل الله أن يجعله عاماً مباركاً يمتلئ بالخير والسعادة لكم ولأسركم.\n\nكل عام وأنتم بخير.\n\nفريق {{firm_name}}',
      body_en: 'Dear {{client_name}},\n\nOn the occasion of the Islamic New Year, we extend our warmest wishes. May this year bring you and your family joy, prosperity, and success.\n\nHappy Islamic New Year!\n\n{{firm_name}} Team'
    },
    gregorian_new_year: {
      title_ar: 'كل عام وأنتم بخير بمناسبة العام الجديد',
      title_en: 'Happy New Year',
      body_ar: 'عزيزي/عزيزتي {{client_name}}،\n\nمع بداية العام الجديد {{year}}، نتقدم بأحر التهاني وأسمى التمنيات بعام مليء بالنجاح والتوفيق والسعادة.\n\nكل عام وأنتم بخير.\n\nفريق {{firm_name}}',
      body_en: 'Dear {{client_name}},\n\nAs we welcome the New Year {{year}}, we extend our warmest wishes for a year filled with success, joy, and happiness.\n\nHappy New Year!\n\n{{firm_name}} Team'
    },
    birthday: {
      title_ar: 'عيد ميلاد سعيد',
      title_en: 'Happy Birthday',
      body_ar: 'عزيزي/عزيزتي {{client_name}}،\n\nبمناسبة عيد ميلادك، نتقدم بأحر التهاني وأصدق التمنيات. ندعو الله أن يمتعك بالصحة والسعادة وطول العمر.\n\nكل عام وأنت بخير.\n\nفريق {{firm_name}}',
      body_en: 'Dear {{client_name}},\n\nOn your special birthday, we extend our warmest wishes. May this year bring you health, happiness, and continued success.\n\nHappy Birthday!\n\n{{firm_name}} Team'
    },
    ramadan: {
      title_ar: 'رمضان كريم',
      title_en: 'Ramadan Mubarak',
      body_ar: 'عزيزي/عزيزتي {{client_name}}،\n\nبمناسبة حلول شهر رمضان المبارك، نتقدم بأحر التهاني وأطيب التمنيات. نسأل الله أن يتقبل منكم الصيام والقيام وصالح الأعمال.\n\nرمضان كريم.\n\nفريق {{firm_name}}',
      body_en: 'Dear {{client_name}},\n\nAs the blessed month of Ramadan begins, we extend our warmest wishes. May this holy month bring you peace, blessings, and spiritual renewal.\n\nRamadan Mubarak!\n\n{{firm_name}} Team'
    }
  };
  return templates[type] || { title_ar: '', title_en: '', body_ar: '', body_en: '' };
};

// GET /api/client-messages
const getTemplates = async (req, res) => {
  try {
    await ensureTable();
    const [rows] = await db.query('SELECT * FROM client_messages ORDER BY message_type ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getTemplates error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/client-messages/:type
const getTemplate = async (req, res) => {
  try {
    await ensureTable();
    const { type } = req.params;
    const [rows] = await db.query('SELECT * FROM client_messages WHERE message_type = ?', [type]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/client-messages/:type
const updateTemplate = async (req, res) => {
  try {
    await ensureTable();
    const { type } = req.params;
    if (!MESSAGE_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid message type' });
    }
    const { title_ar, title_en, body_ar, body_en, image_url, extra_fields } = req.body;
    const updated_by = req.user?.id;

    await db.query(`
      INSERT INTO client_messages (message_type, title_ar, title_en, body_ar, body_en, image_url, extra_fields, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title_ar = VALUES(title_ar),
        title_en = VALUES(title_en),
        body_ar = VALUES(body_ar),
        body_en = VALUES(body_en),
        image_url = VALUES(image_url),
        extra_fields = VALUES(extra_fields),
        updated_by = VALUES(updated_by)
    `, [type, title_ar, title_en, body_ar, body_en, image_url || null, JSON.stringify(extra_fields || {}), updated_by]);

    res.json({ success: true, message: 'Template updated successfully' });
  } catch (err) {
    console.error('updateTemplate error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// Integration Settings (Outlook + WhatsApp)
// ─────────────────────────────────────────────

const ensureSettingsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS messaging_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

// GET /api/client-messages/settings
const getSettings = async (req, res) => {
  try {
    await ensureSettingsTable();
    const [rows] = await db.query('SELECT setting_key, setting_value FROM messaging_settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    // Never expose password in plaintext
    if (settings.outlook_password) settings.outlook_password = '••••••••';
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/client-messages/settings
const updateSettings = async (req, res) => {
  try {
    await ensureSettingsTable();
    const allowedKeys = [
      'outlook_email', 'outlook_password', 'outlook_smtp_host', 'outlook_smtp_port',
      'whatsapp_api_url', 'whatsapp_api_token', 'whatsapp_phone_id',
      'firm_name', 'firm_name_ar', 'portal_url', 'national_day_country'
    ];
    const pairs = Object.entries(req.body).filter(([k]) => allowedKeys.includes(k));
    for (const [key, value] of pairs) {
      await db.query(`
        INSERT INTO messaging_settings (setting_key, setting_value) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `, [key, value]);
    }
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// Sending Messages
// ─────────────────────────────────────────────

const buildMessageBody = (template, language, vars) => {
  const body = language === 'ar' ? template.body_ar : template.body_en;
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
};

const buildSubject = (template, language) => {
  return language === 'ar' ? template.title_ar : template.title_en;
};

const getSmtpSettings = async () => {
  await ensureSettingsTable();
  const [rows] = await db.query(
    "SELECT setting_key, setting_value FROM messaging_settings WHERE setting_key IN ('outlook_email','outlook_password','outlook_smtp_host','outlook_smtp_port','firm_name','firm_name_ar','portal_url','national_day_country')"
  );
  const s = {};
  rows.forEach(r => { s[r.setting_key] = r.setting_value; });
  return s;
};

// POST /api/client-messages/send
const sendMessage = async (req, res) => {
  try {
    await ensureTable();
    const {
      message_type,
      client_ids,   // array of party IDs
      language,     // 'ar' | 'en'
      channel,      // 'email' | 'whatsapp'
      variables,    // { case_number, verdict_summary, country_name, year, ... }
      attachment_urls // optional array of pre-uploaded URLs
    } = req.body;

    if (!MESSAGE_TYPES.includes(message_type)) {
      return res.status(400).json({ success: false, message: 'Invalid message type' });
    }
    if (!['email', 'whatsapp'].includes(channel)) {
      return res.status(400).json({ success: false, message: 'Channel must be email or whatsapp' });
    }
    if (!client_ids || !client_ids.length) {
      return res.status(400).json({ success: false, message: 'At least one client must be selected' });
    }

    // Fetch template
    const [templateRows] = await db.query('SELECT * FROM client_messages WHERE message_type = ?', [message_type]);
    const template = templateRows[0];
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });

    // Fetch SMTP/WhatsApp settings
    const settings = await getSmtpSettings();
    const firmName = language === 'ar' ? (settings.firm_name_ar || settings.firm_name || 'المكتب') : (settings.firm_name || 'Our Firm');

    // Fetch clients from parties table
    const placeholders = client_ids.map(() => '?').join(',');
    const [clients] = await db.query(
      `SELECT id, name, email, phone FROM parties WHERE id IN (${placeholders})`,
      client_ids
    );

    const results = [];
    const errors = [];

    for (const client of clients) {
      const vars = {
        client_name: client.name,
        email: client.email,
        firm_name: firmName,
        portal_url: settings.portal_url || '',
        country_name: variables?.country_name || settings.national_day_country || '',
        case_number: variables?.case_number || '',
        verdict_summary: variables?.verdict_summary || '',
        year: variables?.year || new Date().getFullYear(),
        temp_password: variables?.temp_password || '',
        ...variables
      };

      const subject = buildSubject(template, language);
      const body = buildMessageBody(template, language, vars);

      try {
        if (channel === 'email') {
          if (!client.email) throw new Error(`Client ${client.name} has no email address`);
          if (!settings.outlook_email || !settings.outlook_password) {
            throw new Error('Email integration not configured. Please configure in Settings → Messaging Integrations.');
          }

          const transporter = nodemailer.createTransport({
            host: settings.outlook_smtp_host || 'smtp.office365.com',
            port: parseInt(settings.outlook_smtp_port || '587'),
            secure: false,
            auth: {
              user: settings.outlook_email,
              pass: settings.outlook_password
            },
            tls: { ciphers: 'SSLv3' }
          });

          const mailOptions = {
            from: `"${firmName}" <${settings.outlook_email}>`,
            to: client.email,
            subject,
            text: body,
            html: body.replace(/\n/g, '<br>'),
            attachments: (attachment_urls || []).map((url, i) => ({ filename: `attachment_${i + 1}`, path: url }))
          };

          await transporter.sendMail(mailOptions);
          results.push({ client_id: client.id, name: client.name, status: 'sent', channel: 'email' });

        } else if (channel === 'whatsapp') {
          if (!client.phone) throw new Error(`Client ${client.name} has no phone number`);
          if (!settings.whatsapp_api_url || !settings.whatsapp_api_token) {
            throw new Error('WhatsApp integration not configured. Please configure in Settings → Messaging Integrations.');
          }

          const phone = client.phone.replace(/\D/g, '');
          const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phone,
            type: 'text',
            text: { body }
          };

          const waRes = await fetch(`${settings.whatsapp_api_url}/${settings.whatsapp_phone_id}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${settings.whatsapp_api_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          const waData = await waRes.json();
          if (!waRes.ok) throw new Error(waData.error?.message || 'WhatsApp send failed');

          // Send image if any
          if (template.image_url || (attachment_urls && attachment_urls.length)) {
            const imageUrl = template.image_url || attachment_urls[0];
            const imgPayload = {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: phone,
              type: 'image',
              image: { link: imageUrl }
            };
            await fetch(`${settings.whatsapp_api_url}/${settings.whatsapp_phone_id}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${settings.whatsapp_api_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(imgPayload)
            });
          }

          results.push({ client_id: client.id, name: client.name, status: 'sent', channel: 'whatsapp' });
        }
      } catch (sendErr) {
        console.error(`Send error for client ${client.id}:`, sendErr.message);
        errors.push({ client_id: client.id, name: client.name, error: sendErr.message });
      }
    }

    const allFailed = results.length === 0;
    res.status(allFailed ? 500 : 200).json({
      success: !allFailed,
      message: allFailed ? 'All messages failed to send' : `Sent to ${results.length} client(s)`,
      data: { results, errors }
    });

  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getTemplates,
  getTemplate,
  updateTemplate,
  getSettings,
  updateSettings,
  sendMessage,
  MESSAGE_TYPES
};
