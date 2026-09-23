import * as vscode from 'vscode';

let copilotOutput: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
	console.log('ErrorCopy Pro is now active!');
	copilotOutput = vscode.window.createOutputChannel('ErrorCopy Copilot');

	const copyError = vscode.commands.registerCommand('error-copy-pro.copyError', () => copyPrompt());
	const explainError = vscode.commands.registerCommand('error-copy-pro.explainError', () => chooseProvider());
	const askCopilotChat = vscode.commands.registerCommand('error-copy-pro.askCopilotChat', () => askProvider('copilot'));
	const askCopilotWeb = vscode.commands.registerCommand('error-copy-pro.askCopilotWeb', () => askProvider('copilotWeb'));
	const askClaude = vscode.commands.registerCommand('error-copy-pro.askClaude', () => askProvider('claude'));
	const askChatGPT = vscode.commands.registerCommand('error-copy-pro.askChatGPT', () => askProvider('chatgpt'));
	const searchSO = vscode.commands.registerCommand('error-copy-pro.searchStackOverflow', () => askProvider('stackoverflow'));

	context.subscriptions.push(copilotOutput, copyError, explainError, askCopilotChat, askCopilotWeb, askClaude, askChatGPT, searchSO);
}

type Provider = 'copilot' | 'copilotWeb' | 'claude' | 'chatgpt' | 'stackoverflow';

async function copyPrompt(): Promise<void> {
	const prompt = buildPrompt();
	if (!prompt) return;
	if (await copyPromptToClipboard(prompt)) {
		vscode.window.showInformationMessage('Error context copied as a Markdown prompt. Paste it with Ctrl+V.');
	}
}

async function chooseProvider(): Promise<void> {
	const choice = await vscode.window.showQuickPick([
		{ label: 'GitHub Copilot Chat', provider: 'copilot' as Provider, description: 'Open inside VS Code when available' },
		{ label: 'Copilot Web', provider: 'copilotWeb' as Provider, description: 'Copy the prompt and open the browser' },
		{ label: 'Claude', provider: 'claude' as Provider, description: 'Copy the prompt and open the browser' },
		{ label: 'ChatGPT', provider: 'chatgpt' as Provider, description: 'Copy the prompt and open the browser' },
		{ label: 'Stack Overflow', provider: 'stackoverflow' as Provider, description: 'Search the diagnostic text' },
		{ label: 'Copy Prompt Only', provider: undefined, description: 'Copy without opening an AI provider' }
	], { placeHolder: 'Choose where to explain this error' });
	if (!choice) return;
	if (choice.provider) await askProvider(choice.provider);
	else await copyPrompt();
}

async function askProvider(provider: Provider): Promise<void> {
	const prompt = buildPrompt();
	if (!prompt) return;
	const copied = await copyPromptToClipboard(prompt);

	if (provider === 'copilot') {
		try {
			await askCopilot(prompt);
			if (copied) vscode.window.showInformationMessage('Copilot answered in the ErrorCopy Copilot output panel. The prompt was also copied as a backup.');
			return;
		} catch {
			vscode.window.showWarningMessage('Copilot model access is unavailable. Use Ctrl+V to paste the copied prompt into Copilot Chat.');
			return;
		}
	}

	const editor = vscode.window.activeTextEditor;
	const errorText = editor ? getDiagnosticText(editor) : '';
	const urls: Record<Exclude<Provider, 'copilot'>, string> = {
		copilotWeb: 'https://copilot.microsoft.com/',
		claude: 'https://claude.ai/new',
		chatgpt: 'https://chatgpt.com/',
		stackoverflow: `https://stackoverflow.com/search?q=${encodeURIComponent(errorText || 'programming error')}`
	};
	await vscode.env.openExternal(vscode.Uri.parse(urls[provider]));
	if (copied) vscode.window.showInformationMessage('Prompt copied to your clipboard. In the browser, press Ctrl+V to paste it into the chat.');
}

async function askCopilot(prompt: string): Promise<void> {
	const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
	if (models.length === 0) throw new Error('No Copilot language model is available.');

	const response = await models[0].sendRequest(
		[vscode.LanguageModelChatMessage.User(prompt)],
		{ justification: 'ErrorCopy needs Copilot to explain the selected VS Code diagnostic.' }
	);

	if (!copilotOutput) throw new Error('Copilot output is not initialized.');
	copilotOutput.clear();
	copilotOutput.appendLine(`ErrorCopy response from ${models[0].name}`);
	copilotOutput.appendLine('');
	for await (const text of response.text) {
		copilotOutput.append(text);
	}
	copilotOutput.show(true);
}

async function copyPromptToClipboard(prompt: string): Promise<boolean> {
	try {
		await vscode.env.clipboard.writeText(prompt);
		return true;
	} catch {
		vscode.window.showErrorMessage('ErrorCopy could not copy the prompt to the clipboard. Try the copy command again.');
		return false;
	}
}

function buildPrompt(): string | undefined {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('Open a file and place the cursor on the error first.');
		return undefined;
	}

	const config = vscode.workspace.getConfiguration('errorCopy');
	const includePath = config.get<boolean>('includeFilePath', false);
	const includeCode = config.get<boolean>('includeSurroundingCode', true);
	const maxLines = config.get<number>('maxContextLines', 12);
	const line = editor.selection.active.line;
	const selected = editor.document.getText(editor.selection).trim();
	const diagnostic = getDiagnosticText(editor, includePath);
	const parts = [
		'You are helping debug an issue in a VS Code project.',
		'',
		'Please explain the root cause, provide the smallest correct fix, show corrected code, and mention any side effects.',
		'',
		`Language: ${editor.document.languageId}`,
		`Line: ${line + 1}`,
		diagnostic ? `Diagnostic:\n${diagnostic}` : '',
		selected ? `Selected text:\n\`\`\`\n${selected}\n\`\`\`` : '',
		includeCode ? `Relevant code:\n\`\`\`${editor.document.languageId}\n${getCodeContext(editor, line, maxLines)}\n\`\`\`` : '',
		includePath ? `File: ${editor.document.fileName}` : ''
	].filter(Boolean).join('\n\n');

	return maskSensitiveData(parts);
}

function getDiagnosticText(editor: vscode.TextEditor, includeFilePaths = false): string {
	const line = editor.selection.active.line;
	const diagnostics = vscode.languages.getDiagnostics(editor.document.uri)
		.filter(diagnostic => diagnostic.range.start.line <= line && diagnostic.range.end.line >= line);

	return diagnostics.map((diagnostic, index) => {
		const severity = getDiagnosticSeverity(diagnostic.severity);
		const source = diagnostic.source ? `Source: ${diagnostic.source}` : '';
		const code = diagnostic.code === undefined ? '' : `Code: ${formatDiagnosticCode(diagnostic.code)}`;
		const range = `Range: lines ${diagnostic.range.start.line + 1}-${diagnostic.range.end.line + 1}, columns ${diagnostic.range.start.character + 1}-${diagnostic.range.end.character + 1}`;
		const relatedInformation = diagnostic.relatedInformation?.map(info => {
			const location = includeFilePaths
				? `${info.location.uri.fsPath}:${info.location.range.start.line + 1}`
				: `line ${info.location.range.start.line + 1}`;
			return `- ${location}: ${info.message}`;
		}).join('\n') ?? '';

		return [
			`Diagnostic ${index + 1}`,
			`Severity: ${severity}`,
			source,
			code,
			range,
			`Message: ${diagnostic.message}`,
			relatedInformation ? `Related information:\n${relatedInformation}` : ''
		].filter(Boolean).join('\n');
	}).join('\n\n');
}

function getDiagnosticSeverity(severity: vscode.DiagnosticSeverity): string {
	return {
		[vscode.DiagnosticSeverity.Error]: 'Error',
		[vscode.DiagnosticSeverity.Warning]: 'Warning',
		[vscode.DiagnosticSeverity.Information]: 'Information',
		[vscode.DiagnosticSeverity.Hint]: 'Hint'
	}[severity] ?? 'Unknown';
}

function formatDiagnosticCode(code: string | number | {
	value: string | number;
	 target?: vscode.Uri;
}): string {
	if (typeof code === 'object') return String(code.value);
	return String(code);
}

function getCodeContext(editor: vscode.TextEditor, lineNumber: number, maxLines: number): string {
	const doc = editor.document;
	const radius = Math.max(1, Math.floor(maxLines / 2));
	const startLine = Math.max(0, lineNumber - radius);
	const endLine = Math.min(doc.lineCount - 1, lineNumber + radius);
	return Array.from({ length: endLine - startLine + 1 }, (_, index) => {
		const line = startLine + index;
		return `${line === lineNumber ? '>>> ' : '    '}${line + 1}: ${doc.lineAt(line).text}`;
	}).join('\n');
}

function maskSensitiveData(value: string): string {
	return value
		.replace(/(api[_-]?key|token|secret|password)\s*[:=]\s*(['"]?)[^\s,'"`]+\2/gi, '$1: [REDACTED]')
		.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]');
}

export function deactivate() {}