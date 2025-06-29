const express = require('express');
const router = express.Router();
const pool = require('../db/db');

function renderWithLocale(view, title) {
    return (req, res) => res.render(view, {
      locale: req.getLocale(),
      message: req.session.message,
      title,
      __: res.__.bind(req) // <-- Явно пробрасываем функцию __
    });
  }

  router.get('/', renderWithLocale('index', 'Главная — Туркестан Болашак'));
  router.get('/about', renderWithLocale('about', 'О колледже — Туркестан Болашак'));
router.get('/activity', renderWithLocale('activity', 'Деятельность — Туркестан Болашак'));
router.get('/specialties', renderWithLocale('specialties', 'Специальности — Туркестан Болашак'));

router.get('/students', (req, res) => {
    console.log('ROUTE /students CALLED');
    res.render('students', {
      locale: req.getLocale(),
      message: req.session.message,
      title: 'Студентам — Туркестан Болашак',
      __: res.__.bind(req)
    });
  });

router.get('/applicants', renderWithLocale('applicants', 'Абитуриентам — Туркестан Болашак'));
router.get('/contacts', renderWithLocale('contacts', 'Контакты — Туркестан Болашак'));
router.get('/admin', renderWithLocale('admin/login', 'Вход — Туркестан Болашак'));
router.get('/news', renderWithLocale('news', 'Новости — Туркестан Болашак'));
router.get('/gallery', renderWithLocale('gallery', 'Галерея — Туркестан Болашак'));
router.get('/teachers', renderWithLocale('teachers', 'Преподаватели — Туркестан Болашак'));
router.get('/contests', renderWithLocale('contests', 'Конкурсы — Туркестан Болашак'));

router.get('/test', (req, res) => {
    res.render('test', {
      locale: req.getLocale(),
      title: 'Test Page',
      __: res.__.bind(req)
    });
  });

router.post('/applicants', async (req, res) => {
  try {
    // Используем multer middleware для обработки файла
    const upload = req.app.locals.upload;
    upload.single('certificate')(req, res, async function(err) {
      if (err) {
        console.error('Ошибка загрузки файла:', err);
        req.session.message = 'Ошибка при загрузке файла. Убедитесь, что файл в формате PDF и не превышает 5MB.';
        return res.redirect('/applicants');
      }

      const { fio, email, phone, specialty, comment } = req.body;
      const certificateFile = req.file ? req.file.filename : null;

      await pool.query(
        'INSERT INTO applicants (fio, email, phone, specialty, comment, certificate_file) VALUES (?, ?, ?, ?, ?, ?)',
        [fio, email, phone, specialty, comment, certificateFile]
      );
      req.session.message = 'Заявка успешно отправлена!';
      res.redirect('/applicants');
    });
  } catch (err) {
    console.error('Ошибка при сохранении заявки:', err);
    req.session.message = 'Ошибка при отправке заявки.';
    res.redirect('/applicants');
  }
});

module.exports = router;