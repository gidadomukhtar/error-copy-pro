# ErrorCopy Pro

Stop manually copying error messages. **Understand them faster with AI.**

Automatically extract error context and get explanations from GitHub Copilot Chat, Copilot Web, Claude, ChatGPT, or Stack Overflow.

## Fastest Workflow

1. Put the cursor on the error or select the relevant code.
2. Run `ErrorCopy: Explain This Error` from the Command Palette, or right-click in the editor.
3. Choose a provider. ErrorCopy collects the complete matching VS Code diagnostic, including severity, source, diagnostic code, exact range, message, and related information, plus selected text, surrounding code, language, and line number.
4. Copilot answers in the `ErrorCopy Copilot` output panel when a Copilot language model is available. Other providers open in your browser, while the prepared Markdown prompt is copied to your clipboard for manual paste.

Use `ErrorCopy: Copy Error with Context` when you only need the prompt. The copied prompt contains both the code and the diagnostic shown in VS Code's Problems panel. Sensitive values such as API keys, tokens, passwords, and Bearer credentials are masked automatically.

Prompt privacy and context size can be adjusted in Settings under `ErrorCopy Pro`:

- `errorCopy.includeFilePath`
- `errorCopy.includeSurroundingCode`
- `errorCopy.maxContextLines`

## 🚀 Features

✅ **GitHub Copilot** (Primary - if available)
- Uses VS Code's public Language Model API
- Streams the answer into the `ErrorCopy Copilot` output panel
- Requires a signed-in Copilot-enabled VS Code installation

✅ **Copilot Web** (Microsoft's free web version)
- Opens the Copilot website
- Copies the complete prompt first
- Paste with `Ctrl+V` in the browser chat box

✅ **Claude**
- Web-based AI
- Copies the complete prompt before opening Claude
- Paste with `Ctrl+V` in the browser chat box

✅ **ChatGPT**
- Web-based AI
- Copies the complete prompt before opening ChatGPT
- Paste with `Ctrl+V` in the browser chat box

✅ **Stack Overflow Search**
- Find existing solutions
- Community answers

✅ **Smart Context Extraction**
- Automatic error capture
- Code context (surrounding lines)
- File location
- VS Code Problems-panel diagnostics

## 🎯 How to Use

### Copy Error with Context
1. Click on any line with an error
2. Press `Ctrl+Shift+E` (Windows/Linux) or `Cmd+Shift+E` (Mac)
3. Error + context copied to clipboard

### Ask AI About Error

**Option 1: GitHub Copilot Chat (Recommended)**
1. Click on error line
2. Run command: "ErrorCopy: Ask GitHub Copilot Chat"
3. Allow language-model access if VS Code asks for permission
4. Open View → Output and select "ErrorCopy Copilot"
5. Read the streamed explanation

**Option 2: Copilot Web**
1. Click on error line
2. Run command: "ErrorCopy: Ask Copilot Web"
3. The prompt is copied and the browser opens
4. Click the chat box and press `Ctrl+V`

**Option 3: Claude**
1. Click on error line
2. Run command: "ErrorCopy: Ask Claude"
3. The prompt is copied and Claude opens in the browser
4. Click the chat box and press `Ctrl+V`

**Option 4: ChatGPT**
1. Click on error line
2. Run command: "ErrorCopy: Ask ChatGPT"
3. The prompt is copied and ChatGPT opens in the browser
4. Click the chat box and press `Ctrl+V`

**Option 5: Stack Overflow Search**
1. Click on error line
2. Run command: "ErrorCopy: Search Stack Overflow"
3. Opens Stack Overflow with error
4. Find community solutions

## ⌨️ Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Copy Error | `Ctrl+Shift+E` | `Cmd+Shift+E` |

## 💡 Example Workflow
Error in console:
"NullReferenceException: Object reference not set to an instance of an object"

Click on the error line
Press Ctrl+Shift+E → Error copied with context
Run "Ask GitHub Copilot Chat"
Copilot explains: "This happens when you're accessing a property on null.
Check if the object exists before using it."
Problem solved in seconds!

## 🔧 Requirements

- VS Code 1.90 or higher
- GitHub Copilot access is required only for the native Copilot provider
- Claude, ChatGPT, Copilot Web, and Stack Overflow require internet access

## Privacy

ErrorCopy prepares prompts locally. It does not call external AI APIs itself. When using an external provider, review the prompt before submitting it. API keys, tokens, passwords, and Bearer credentials are masked automatically, but no automatic redaction can guarantee that every secret format is detected.

File paths are excluded by default. Surrounding code can be disabled and the context size can be changed in Settings under `ErrorCopy Pro`.

## Test During Development

1. Clone the repository and run `npm install`.
2. Run `npm run compile`.
3. Press `F5` to open an Extension Development Host.
4. Open a file with a VS Code diagnostic and place the cursor on it.
5. Run `ErrorCopy: Explain This Error` or use the editor context menu.
6. Verify the copied prompt includes the diagnostic message, source, code, severity, range, and surrounding code.
7. For Copilot, sign in to GitHub, allow model access, and inspect the `ErrorCopy Copilot` output channel.

The project currently uses compile and type-check validation. Full automated Extension Host tests are not yet included.

## 📥 Installation

For local testing, use the Extension Development Host instructions above. Marketplace installation will be available after the extension is packaged and published.

## 🎓 Built For

- Developers debugging in VS Code
- Students learning to debug
- Teams in Africa & low-bandwidth areas (free options available)
- Anyone tired of copying errors manually

## 💻 Tech Stack

- VS Code Extension API
- TypeScript
- GitHub Copilot Chat integration
- Multi-provider AI support

## 📝 License

MIT

---

**Made by Gidado Mukhtar**  
GitHub: [@gidadomukhtar](https://github.com/gidadomukhtar)  
LinkedIn: [@gidado-mukhtar](https://www.linkedin.com/in/gidado-mukhtar-16a7a73a6/)
