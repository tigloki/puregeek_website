function pgToggleMenu() {
  var nav = document.getElementById('pg-mobile-nav');
  var btn = document.getElementById('pg-menu-btn');
  if (!nav) return;
  var opening = (nav.style.display === 'none' || !nav.style.display);
  nav.style.display = opening ? 'flex' : 'none';
  if (btn) btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
}

var pgModalLastFocus = null;

function pgOpenContactModal(triggerEl) {
  var modal = document.getElementById('pg-contact-modal');
  if (!modal) return;
  pgModalLastFocus = triggerEl || document.activeElement;
  modal.style.display = 'flex';
  var firstField = modal.querySelector('input, textarea, button');
  if (firstField) firstField.focus();
}

function pgCloseContactModal() {
  var modal = document.getElementById('pg-contact-modal');
  if (modal) modal.style.display = 'none';
  if (pgModalLastFocus && typeof pgModalLastFocus.focus === 'function') pgModalLastFocus.focus();
  pgModalLastFocus = null;
}

function pgModalFocusTrap(e) {
  if (e.key !== 'Tab') return;
  var modal = document.getElementById('pg-contact-modal');
  if (!modal || modal.style.display === 'none' || !modal.style.display) return;
  var focusable = modal.querySelectorAll('button, input, textarea, [href]');
  if (!focusable.length) return;
  var first = focusable[0];
  var last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function pgModalOverlayClick(e) {
  if (e.target && e.target.id === 'pg-contact-modal') pgCloseContactModal();
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') pgCloseContactModal();
  pgModalFocusTrap(e);
});

function pgUpdateSendState(card) {
  var name = card.querySelector('.pg-name');
  var contact = card.querySelector('.pg-contact');
  var message = card.querySelector('.pg-message');
  var counter = card.querySelector('.pg-char-count');
  if (counter && message) counter.textContent = message.value.length + '/' + message.maxLength;
  var btn = card.querySelector('.pg-send-btn');
  if (!btn) return;
  var canSend = name.value.trim().length > 0 && contact.value.trim().length > 0 && message.value.trim().length > 0;
  btn.disabled = !canSend;
}

function pgSubmit(btn) {
  var card = btn.closest('.card');
  var formBlock = card.querySelector('.pg-form-block');
  var thanksBlock = card.querySelector('.pg-thanks-block');
  var errorBlock = card.querySelector('.pg-error-block');
  var name = card.querySelector('.pg-name').value;
  var contact = card.querySelector('.pg-contact').value;
  var message = card.querySelector('.pg-message').value.trim();

  btn.disabled = true;
  btn.textContent = 'Sending...';

  fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name,
      contact: contact,
      message: message,
      source_page: document.title,
    }),
  })
    .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
    .then(function (result) {
      if (!result.ok) throw new Error((result.body && result.body.error) || 'Submission failed');
      thanksBlock.querySelector('.pg-thanks-name').textContent = name;
      thanksBlock.querySelector('.pg-thanks-contact').textContent = contact;
      formBlock.style.display = 'none';
      thanksBlock.style.display = 'block';
    })
    .catch(function (err) {
      btn.disabled = false;
      btn.textContent = 'Send';
      if (errorBlock) {
        errorBlock.textContent = 'Something went wrong sending that — try again in a moment.';
        errorBlock.style.display = 'block';
      } else {
        alert('Something went wrong sending that — try again in a moment.');
      }
      console.error(err);
    });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.card').forEach(function (card) {
    if (!card.querySelector('.pg-form-block')) return;
    card.addEventListener('input', function () { pgUpdateSendState(card); });
  });
});
