/* Perilaku halaman utama: filter project, menu mobile, dan modal kontak.
   Dipakai bersama oleh index.html dan id.html — teks yang berbeda per
   bahasa dibaca dari atribut data-* di HTML, bukan ditulis di sini. */

  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  filterBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c=>{
        c.style.display = (f==='all' || c.dataset.cat===f) ? '' : 'none';
      });
    });
  });

  // Menu mobile
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.getElementById('nav-links');
  const setMenu = open=>{
    navLinks.classList.toggle('open',open);
    navToggle.setAttribute('aria-expanded',open);
    navToggle.setAttribute('aria-label',
      open ? navToggle.dataset.labelClose : navToggle.dataset.labelOpen);
  };
  navToggle.addEventListener('click',()=>{
    setMenu(!navLinks.classList.contains('open'));
  });
  // Memilih salah satu tautan langsung menutup menu
  navLinks.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click',()=>setMenu(false));
  });
  // Klik di luar navbar menutup menu
  document.addEventListener('click',e=>{
    if(!navLinks.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
  });
  // Esc menutup menu
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape') setMenu(false);
  });

  // Contact modal
  const contactModal = document.getElementById('contact-modal');
  document.querySelectorAll('[data-open-contact]').forEach(btn=>{
    btn.addEventListener('click',()=>contactModal.showModal());
  });
  contactModal.querySelector('.modal-close')
    .addEventListener('click',()=>contactModal.close());
  // Klik di area gelap di luar kotak menutup modal
  contactModal.addEventListener('click',e=>{
    if(e.target===contactModal) contactModal.close();
  });
  // Menutup modal setelah salah satu opsi dipilih
  contactModal.querySelectorAll('.contact-option').forEach(opt=>{
    opt.addEventListener('click',()=>contactModal.close());
  });
