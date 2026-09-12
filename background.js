const MENU_ID = 'promptvault';
const PROMPT_PREFIX = 'promptvault_prompt_';

async function getPrompts() {
  const { prompts = [] } = await chrome.storage.local.get({ prompts: [] });
  return prompts;
}

async function rebuildContextMenus() {
  await chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'PromptVault',
    contexts: ['editable']
  });

  const prompts = await getPrompts();

  if (prompts.length === 0) {
    chrome.contextMenus.create({
      id: MENU_ID + '_empty',
      parentId: MENU_ID,
      title: 'No prompts saved',
      enabled: false,
      contexts: ['editable']
    });
    return;
  }

  for (const prompt of prompts) {
    chrome.contextMenus.create({
      id: PROMPT_PREFIX + prompt.id,
      parentId: MENU_ID,
      title: prompt.title || 'Untitled',
      contexts: ['editable']
    });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  rebuildContextMenus();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.prompts) {
    rebuildContextMenus();
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.menuItemId.startsWith(PROMPT_PREFIX)) return;

  const promptId = info.menuItemId.slice(PROMPT_PREFIX.length);
  const prompts = await getPrompts();
  const prompt = prompts.find(p => p.id === promptId);

  if (!prompt || !tab?.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: 'INJECT_PROMPT',
      text: prompt.body
    });
  } catch (err) {
    console.warn('PromptVault: could not send message to tab.', err);
  }
});