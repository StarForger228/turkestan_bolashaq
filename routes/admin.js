const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Middleware для проверки авторизации
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect('/admin');
}

router.get('/', (req, res) => {
  res.render('admin/login', { locale: req.getLocale(), error: req.session.error });
  req.session.error = null;
});

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length && await bcrypt.compare(password, rows[0].password)) {
      req.session.user = { id: rows[0].id, username: rows[0].username };
      return res.redirect('/admin/dashboard');
    }
    req.session.error = 'Неверный логин или пароль';
    res.redirect('/admin');
  } catch (e) {
    req.session.error = 'Ошибка авторизации';
    res.redirect('/admin');
  }
});

router.get('/dashboard', isAuthenticated, async (req, res) => {
  const [applicants] = await pool.query('SELECT * FROM applicants ORDER BY created_at DESC');
  res.render('admin/dashboard', { locale: req.getLocale(), user: req.session.user, applicants });
});

// Удаление заявки по id (только для авторизованных)
router.post('/delete/:id', isAuthenticated, async (req, res) => {
  const id = req.params.id;
  try {
    // Сначала получаем информацию о файле
    const [rows] = await pool.query('SELECT certificate_file FROM applicants WHERE id = ?', [id]);
    if (rows.length > 0 && rows[0].certificate_file) {
      // Удаляем файл с диска
      const filePath = path.join(__dirname, '../public/uploads', rows[0].certificate_file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Удаляем запись из базы
    await pool.query('DELETE FROM applicants WHERE id = ?', [id]);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Ошибка при удалении заявки:', err);
    res.redirect('/admin/dashboard');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin'));
});

module.exports = router;