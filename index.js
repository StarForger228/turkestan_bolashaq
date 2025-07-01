require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const i18n = require('i18n');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');

const app = express();

const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layout'); // layout.ejs

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'certificate-' + uniqueSuffix + '.pdf');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Только PDF файлы разрешены!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB максимум
  }
});

// Настройка i18n
i18n.configure({
  locales: ['ru', 'kz', 'en'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'ru',
  cookie: 'lang',
  queryParameter: 'lang',
  objectNotation: true,
  autoReload: false,
  syncFiles: false
});

app.use(cookieParser());
app.use(i18n.init);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

// Middleware для смены языка
app.get('/lang/:locale', (req, res) => {
  res.cookie('lang', req.params.locale);
  res.setLocale(req.params.locale);
  const referer = req.get('Referer');
  console.log('LANG SWITCH, referer:', referer);
  if (referer && !referer.includes('/lang/')) {
    res.redirect(referer);
  } else {
    res.redirect('/');
  }
});

const bodyParser = require("body-parser");
const cors = require("cors");
const OpenAI = require("openai");

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: "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",
  baseURL: "https://openrouter.ai/api/v1"
});

// Функция для получения system prompt по языку
function getSystemPrompt(locale) {
  let lang = (locale || 'ru').toLowerCase();
  if (!['ru','kz','en'].includes(lang)) lang = 'ru';
  try {
    return fs.readFileSync(path.join(__dirname, `prompts/chatbot-system-prompt.${lang}.txt`), 'utf-8');
  } catch (e) {
    // fallback на русский
    return fs.readFileSync(path.join(__dirname, 'prompts/chatbot-system-prompt.ru.txt'), 'utf-8');
  }
}

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  // Определяем язык из cookie/lang, query, или defaultLocale
  let locale = req.cookies?.lang || req.query?.lang || req.getLocale?.() || 'ru';
  const systemPrompt = getSystemPrompt(locale);
  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    });
    const botReply = response.choices[0].message.content;
    res.json({ response: botReply });
  } catch (error) {
    console.error("❌ Ошибка OpenAI:", error.response?.data || error.message || error);
    res.status(500).json({ response: "Произошла ошибка. Попробуйте позже." });
  }
});

// Роуты
app.use('/', require('./routes/main'));
app.use('/admin', require('./routes/admin'));

// Экспортируем upload для использования в роутерах
app.locals.upload = upload;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});