document.addEventListener('DOMContentLoaded', function() {
  var searchDialog = document.getElementById('search-dialog');
  var searchOpen = document.getElementById('search-open');
  var searchClose = document.getElementById('search-close');
  var searchInput = document.getElementById('search-input');
  var menuToggle = document.getElementById('menu-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  var themeToggle = document.getElementById('theme-toggle');
  var scrollTop = document.getElementById('scroll-top');

  if (searchOpen && searchDialog) {
    searchOpen.addEventListener('click', function() {
      searchDialog.showModal();
      if (searchInput) {
        setTimeout(function() { searchInput.focus(); }, 100);
      }
    });
  }

  if (searchClose && searchDialog) {
    searchClose.addEventListener('click', function() {
      searchDialog.close();
    });
  }

  if (searchDialog) {
    searchDialog.addEventListener('click', function(e) {
      if (e.target === searchDialog) {
        searchDialog.close();
      }
    });
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function() {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    mobileNav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (themeToggle) {
    var stored = localStorage.getItem('theme');
    if (stored) {
      document.documentElement.setAttribute('data-theme', stored);
    }

    themeToggle.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var next = current === 'dark' ? 'light' : current === 'light' ? 'dark' : (prefersDark ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  if (scrollTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 500) {
        scrollTop.classList.add('is-visible');
      } else {
        scrollTop.classList.remove('is-visible');
      }
    });

    scrollTop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
