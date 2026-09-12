const STORAGE_KEY = 'prompts';

const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const searchInput = document.getElementById('searchInput');
const editorEl = document.getElementById('editor');
const titleInput = document.getElementById('titleInput');
const bodyInput = document.getElementById('bodyInput');
const newBtn = document.getElementById('newBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const toastEl = document.getElementById('toast');

let prompts = [];
let editingId = null;
let toastTimer = null;

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 1500);
}

async function loadPrompts() {
  const data = await chrome.storage.local.get({ [STORAGE_KEY]: [] });
  prompts = data[STORAGE_KEY];
  render();
}

async function savePrompts() {
  await chrome.storage.local.set({ [STORAGE_KEY]: prompts });
}

function uid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);
}

function render() {
  const q = searchInput.value.trim().toLowerCase();

  const filtered = prompts.filter(p => {
    const title = (p.title || '').toLowerCase();
    const body = (p.body || '').toLowerCase();
    return title.includes(q) || body.includes(q);
  });

  listEl.innerHTML = '';
  emptyEl.hidden = filtered.length > 0;

  for (const prompt of filtered) {
    const li = document.createElement('li');

    const title = document.createElement('h3');
    title.textContent = prompt.title || 'Untitled';

    const preview = document.createElement('p');
    preview.textContent =
      (prompt.body || '').replace(/\s+/g, ' ').slice(0, 100) || 'No content';

    const actions = document.createElement('div');
    actions.className = 'actions';

    const injectBtn = document.createElement('button');
    injectBtn.textContent = 'Inject';
    injectBtn.className = 'primary';
    injectBtn.addEventListener('click', () => injectPrompt(prompt));

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(prompt));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deletePrompt(prompt.id));

    actions.append(injectBtn, editBtn, deleteBtn);
    li.append(title, preview, actions);
    listEl.appendChild(li);
  }
}

function startEdit(prompt) {
  editingId = prompt.id;
  titleInput.value = prompt.title;
  bodyInput.value = prompt.body;
  editorEl.hidden = false;
  titleInput.focus();
}

function resetEditor() {
  editingId = null;
  titleInput.value = '';
  bodyInput.value = '';
  editorEl.hidden = true;
}

async function savePrompt() {
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title || !body) {
    showToast('Title and body are required.');
    return;
  }

  if (editingId) {
    const idx = prompts.findIndex(p => p.id === editingId);
    if (idx !== -1) {
      prompts[idx] = { ...prompts[idx], title, body };
    }
  } else {
    prompts.push({ id: uid(), title, body });
  }

  await savePrompts();
  resetEditor();
  render();
  showToast('Saved.');
}

async function deletePrompt(id) {
  if (!confirm('Delete this prompt?')) return;

  prompts = prompts.filter(p => p.id !== id);
  await savePrompts();
  render();
  showToast('Deleted.');
}

async function injectPrompt(prompt) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    showToast('No active tab.');
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: 'INJECT_PROMPT',
      text: prompt.body
    });

    showToast('Injected!');
    setTimeout(() => window.close(), 300);
  } catch (err) {
    console.warn(err);
    showToast('Could not inject. Reload the page.');
  }
}

newBtn.addEventListener('click', () => {
  resetEditor();
  editorEl.hidden = false;
  titleInput.focus();
});

saveBtn.addEventListener('click', savePrompt);
cancelBtn.addEventListener('click', resetEditor);
searchInput.addEventListener('input', render);

loadPrompts();