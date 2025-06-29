document.getElementById('applicantForm').addEventListener('submit', function(e) {
  const fio = document.getElementById('fio').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const specialty = document.getElementById('specialty').value;
  const certificate = document.getElementById('certificate').files[0];
  let errors = [];
  
  if (fio.length < 3) errors.push('Введите корректное ФИО');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('Введите корректный email');
  if (phone.length < 10) errors.push('Введите корректный телефон');
  if (!specialty) errors.push('Выберите специальность');
  if (!certificate) errors.push('Загрузите аттестат в формате PDF');
  if (certificate && certificate.type !== 'application/pdf') errors.push('Аттестат должен быть в формате PDF');
  if (certificate && certificate.size > 5 * 1024 * 1024) errors.push('Размер файла не должен превышать 5MB');
  
  if (errors.length) {
    alert(errors.join('\n'));
    e.preventDefault();
  }
});