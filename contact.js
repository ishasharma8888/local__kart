// Local Market Online Store - Contact Script
// Contact Form Validation & FAQ Accordion

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  const accordionItems = document.querySelectorAll('.accordion-item');

  // FAQ Accordion interaction
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (header) {
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close others
        accordionItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // Contact Form Validation & Submission
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();
      const subject = document.getElementById('contact-subject').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || name.length < 2) {
        alert('Please enter your name.');
        document.getElementById('contact-name').focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        document.getElementById('contact-email').focus();
        return;
      }

      if (!message || message.length < 10) {
        alert('Please enter a message of at least 10 characters.');
        document.getElementById('contact-message').focus();
        return;
      }

      // Success
      contactForm.reset();
      showToast('Thank you! Your message has been sent to our community team.');
      
      const successBanner = document.getElementById('contact-success-msg');
      if (successBanner) {
        successBanner.style.display = 'block';
        setTimeout(() => {
          successBanner.style.display = 'none';
        }, 5000);
      }
    });
  }
});
