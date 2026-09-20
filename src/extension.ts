import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('ErrorCopy Pro is now active!');

	// Command 1: Copy error with context
	let copyError = vscode.commands.registerCommand('error-copy-pro.copyError', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No editor open');
			return;
		}

		const line = editor.selection.active.line;
		const text = editor.document.lineAt(line).text;
		const context = getErrorContext(editor, line);
		const combined = `${text}\n\n${context}`;

		await vscode.env.clipboard.writeText(combined);
		vscode.window.showInformationMessage('✅ Error context copied to clipboard!');
	});

	// Command 2: Ask GitHub Copilot Chat
	let askCopilotChat = vscode.commands.registerCommand('error-copy-pro.askCopilotChat', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No editor open');
			return;
		}

		const errorContext = getFullErrorContext(editor);
		
		try {
			await vscode.commands.executeCommand('github.copilot.chat.startChat', {
				message: `I got this error:\n${errorContext}\n\nWhat does it mean and how do I fix it?`
			});
		} catch (error) {
			vscode.window.showWarningMessage('GitHub Copilot Chat not installed. Install "GitHub Copilot Chat" extension.');
		}
	});

	// Command 3: Ask Copilot Web (opens in browser or panel)
	let askCopilotWeb = vscode.commands.registerCommand('error-copy-pro.askCopilotWeb', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No editor open');
			return;
		}

		const errorContext = getFullErrorContext(editor);
		const encodedContext = encodeURIComponent(`I got this error:\n${errorContext}\n\nWhat does it mean and how do I fix it?`);
		const url = `https://copilot.microsoft.com/?q=${encodedContext}`;
		
		vscode.env.openExternal(vscode.Uri.parse(url));
		vscode.window.showInformationMessage('💡 Opening Copilot Web...');
	});

	// Command 4: Ask Claude
	let askClaude = vscode.commands.registerCommand('error-copy-pro.askClaude', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No editor open');
			return;
		}

		const errorContext = getFullErrorContext(editor);
		const encodedContext = encodeURIComponent(`I got this error:\n${errorContext}\n\nWhat does it mean and how do I fix it?`);
		const url = `https://claude.ai/new?q=${encodedContext}`;
		
		vscode.env.openExternal(vscode.Uri.parse(url));
		vscode.window.showInformationMessage('🤖 Opening Claude...');
	});

	// Command 5: Ask ChatGPT
	let askChatGPT = vscode.commands.registerCommand('error-copy-pro.askChatGPT', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No editor open');
			return;
		}

		const errorContext = getFullErrorContext(editor);
		const encodedContext = encodeURIComponent(`I got this error:\n${errorContext}\n\nWhat does it mean and how do I fix it?`);
		const url = `https://chatgpt.com/?q=${encodedContext}`;
		
		vscode.env.openExternal(vscode.Uri.parse(url));
		vscode.window.showInformationMessage('🤖 Opening ChatGPT...');
	});

	// Command 6: Search Stack Overflow
	let searchSO = vscode.commands.registerCommand('error-copy-pro.searchStackOverflow', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No editor open');
			return;
		}

		const line = editor.selection.active.line;
		const errorMessage = editor.document.lineAt(line).text.trim();
		const encodedError = encodeURIComponent(errorMessage);
		const url = `https://stackoverflow.com/search?q=${encodedError}`;
		
		vscode.env.openExternal(vscode.Uri.parse(url));
		vscode.window.showInformationMessage('🔍 Searching Stack Overflow...');
	});

	context.subscriptions.push(copyError, askCopilotChat, askCopilotWeb, askClaude, askChatGPT, searchSO);
}

function getErrorContext(editor: vscode.TextEditor, lineNumber: number): string {
	const doc = editor.document;
	const startLine = Math.max(0, lineNumber - 3);
	const endLine = Math.min(doc.lineCount - 1, lineNumber + 3);
	
	let context = 'Code context:\n';
	for (let i = startLine; i <= endLine; i++) {
		const prefix = i === lineNumber ? '>>> ' : '    ';
		context += `${prefix}Line ${i + 1}: ${doc.lineAt(i).text}\n`;
	}
	
	return context;
}

function getFullErrorContext(editor: vscode.TextEditor): string {
	const line = editor.selection.active.line;
	const errorLine = editor.document.lineAt(line).text;
	const context = getErrorContext(editor, line);
	return `${errorLine}\n\n${context}\n\nFile: ${editor.document.fileName}`;
}

export function deactivate() {}