document.addEventListener('DOMContentLoaded', function() {
  const revealElements = document.querySelectorAll('.content, .banner, h2, h1, table, form');
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < windowHeight - 60) {
        el.style.opacity = 1;
        el.style.transform = 'none';
        el.style.transition = 'opacity 0.7s, transform 0.7s';
      } else {
        el.style.opacity = 0;
        el.style.transform = 'translateY(40px)';
      }
    });
  };
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();

  // Языковое меню
  const langToggle = document.getElementById('lang-toggle');
  const langMenu = document.getElementById('lang-menu');
  if (langToggle && langMenu) {
    langToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      langMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', function() {
      langMenu.classList.add('hidden');
    });
    langMenu.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
}); 