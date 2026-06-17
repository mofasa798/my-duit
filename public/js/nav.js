/**
 * public/js/nav.js
 *
 * - Auto-highlight nav link aktif berdasarkan URL
 * - Hamburger menu toggle untuk tampilan mobile
 */
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;

  // ===== Active link highlight =====
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isIndex = href.includes('index.html');

    if (currentPath === '/' || currentPath.includes('index.html')) {
      if (isIndex) link.classList.add('active');
    } else if (
      href &&
      !isIndex &&
      currentPath.includes(href.split('/').pop())
    ) {
      link.classList.add('active');
    }
  });

  // ===== Hamburger toggle =====
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile-menu');
  const iconOpen = document.getElementById('nav-icon-open'); // 3 garis
  const iconClose = document.getElementById('nav-icon-close'); // X

  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  const openMenu = () => {
    isOpen = true;
    mobileMenu.classList.remove('hidden', 'opacity-0', '-translate-y-2');
    mobileMenu.classList.add('opacity-100', 'translate-y-0');
    iconOpen.classList.add('hidden');
    iconClose.classList.remove('hidden');
    hamburger.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    isOpen = false;
    mobileMenu.classList.add('opacity-0', '-translate-y-2');
    mobileMenu.classList.remove('opacity-100', 'translate-y-0');
    hamburger.setAttribute('aria-expanded', 'false');
    iconOpen.classList.remove('hidden');
    iconClose.classList.add('hidden');
    // Tunggu animasi selesai lalu hidden
    setTimeout(() => {
      if (!isOpen) mobileMenu.classList.add('hidden');
    }, 200);
  };

  hamburger.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  // Tutup saat klik di luar navbar
  document.addEventListener('click', (e) => {
    if (
      isOpen &&
      !hamburger.contains(e.target) &&
      !mobileMenu.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Tutup saat resize ke desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && isOpen) closeMenu();
  });
});
