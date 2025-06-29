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
}); 