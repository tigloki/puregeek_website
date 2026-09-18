function pgToggleMenu() {
  var nav = document.getElementById('pg-mobile-nav');
  if (!nav) return;
  nav.style.display = (nav.style.display === 'none' || !nav.style.display) ? 'flex' : 'none';
}

function pgUpdateSendState(card) {
  var name = card.querySelector('.pg-name');
  var contact = card.querySelector('.pg-contact');
  var anyChecked = Array.prototype.some.call(card.querySelectorAll('.pg-opt'), function (c) { return c.checked; });
  var btn = card.querySelector('.pg-send-btn');
  if (!btn) return;
  var canSend = anyChecked && name.value.trim().length > 0 && contact.value.trim().length > 0;
  btn.disabled = !canSend;
}

function pgSubmit(btn) {
  var card = btn.closest('.card');
  var formBlock = card.querySelector('.pg-form-block');
  var thanksBlock = card.querySelector('.pg-thanks-block');
  var errorBlock = card.querySelector('.pg-error-block');
  var name = card.querySelector('.pg-name').value;
  var contact = card.querySelector('.pg-contact').value;
  var interests = Array.prototype.filter.call(card.querySelectorAll('.pg-opt'), function (c) { return c.checked; })
    .map(function (c) { return c.nextElementSibling.textContent; });

  btn.disabled = true;
  btn.textContent = 'Sending...';

  fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name,
      contact: contact,
      interests: interests,
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
