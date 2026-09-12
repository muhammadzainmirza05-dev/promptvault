let lastFocusedEditable = null;

function isEditable(el) {
  if (!el) return false;

  const tag = el.tagName;

  if (tag === 'TEXTAREA') return true;

  if (tag === 'INPUT') {
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    return ![
      'hidden', 'checkbox', 'radio', 'button', 'submit', 'reset',
      'file', 'image', 'range', 'color', 'date', 'datetime-local',
      'month', 'week', 'time'
    ].includes(type);
  }

  return el.isContentEditable;
}

document.addEventListener('focusin', (e) => {
  if (isEditable(e.target)) {
    lastFocusedEditable = e.target;
  }
}, true);

function insertIntoInput(el, text) {
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;

  el.setRangeText(text, start, end, 'end');
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function insertIntoContentEditable(el, text) {
  el.focus();

  const selection = window.getSelection();
  if (!selection.rangeCount) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  document.execCommand('insertText', false, text);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

function injectPrompt(text) {
  const active = document.activeElement;
  const target = isEditable(active) ? active : lastFocusedEditable;

  if (!target) {
    console.warn('PromptVault: No focused editable field found.');
    return;
  }

  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    insertIntoInput(target, text);
  } else if (target.isContentEditable) {
    insertIntoContentEditable(target, text);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'INJECT_PROMPT' && typeof message.text === 'string') {
    injectPrompt(message.text);
    sendResponse({ ok: true });
  }
  return true;
});