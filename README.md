
## 🚀 Installation

1. **Download or clone** this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `promptvault` folder.
5. The extension will appear in your toolbar. Pin it for easy access.

## 🖱️ Usage

### Adding a Prompt
1. Click the PromptVault icon in the toolbar.
2. Click **+ New**.
3. Enter a **Title** and the **Prompt Body**.
4. Click **Save**.

### Injecting a Prompt (Popup)
1. Click inside any text input, textarea, or contenteditable element on a webpage.
2. Open the PromptVault popup.
3. Find the prompt you want and click **Inject**.
4. The text is inserted at the cursor position.

### Injecting a Prompt (Context Menu)
1. Right-click inside any editable field.
2. Hover over **PromptVault**.
3. Select the prompt you want to insert.
4. The text is inserted automatically.

### Editing / Deleting
- Click **Edit** on any prompt card to modify its title or body.
- Click **Delete** to remove it permanently (a confirmation dialog appears).

## 🔧 How It Works

| Component | Responsibility |
|-----------|----------------|
| `popup.js` | Manages the prompt library UI, reads/writes to `chrome.storage.local`, and sends injection messages to the active tab. |
| `background.js` | Creates the right-click context menu from stored prompts and handles menu clicks by sending the selected prompt to the content script. |
| `content.js` | Runs on every page, remembers the last focused editable element, and inserts text when it receives an `INJECT_PROMPT` message. |

Communication between the popup/background and the content script is done via `chrome.tabs.sendMessage`.

## 🔐 Permissions Explained

| Permission | Why it's needed |
|------------|-----------------|
| `storage` | Save and retrieve your prompt library locally. |
| `contextMenus` | Add the PromptVault submenu to the right-click menu on editable fields. |
| `activeTab` | Allow the popup to send messages to the currently active tab. |
| `content_scripts` with `<all_urls>` | Enable prompt injection on any website you visit. |

## 🐛 Troubleshooting

- **Injection doesn't work** – Reload the webpage after installing the extension. Content scripts only run on pages loaded *after* the extension is installed.
- **“Could not inject. Reload the page.”** – The page was open before the extension loaded. Refresh the tab.
- **Context menu missing** – Make sure you right-click inside a text input, textarea, or `contenteditable` element.
- **Extension won't load** – Check `chrome://extensions` for red **Errors**. Common causes: invalid JSON in `manifest.json` (trailing commas, comments, smart quotes) or a syntax error in `background.js`.
- **Chrome internal pages** – Extensions cannot run on `chrome://` pages, the Chrome Web Store, or some PDF viewers.

## 🛠️ Development

To modify the extension:
1. Edit the source files.
2. Go to `chrome://extensions` and click the **Reload** icon on the PromptVault card.
3. Reload any test page to pick up changes to the content script.

## 🔮 Future Enhancements

- Import / export prompts as JSON
- Prompt categories and tags
- Keyboard shortcuts for quick injection
- Sync prompts across devices using `chrome.storage.sync`
- Rich text / Markdown support in prompt bodies

## 📄 License

This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).
