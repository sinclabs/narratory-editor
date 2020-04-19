import * as vscode from 'vscode';
import { NarratoryEditorProvider } from './narratoryEditor';


export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "naratory-editor" is now active!');

	let disposable = vscode.commands.registerCommand('naratory-editor.testAgent', () => {
		vscode.window.showInformationMessage('Hello World from naratoryEditor!');
	});

	context.subscriptions.push(disposable);

	// Register our custom editor provider
	context.subscriptions.push(NarratoryEditorProvider.register(context));
}

// this method is called when your extension is deactivated
export function deactivate() {}
