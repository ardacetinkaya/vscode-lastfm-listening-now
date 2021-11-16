import * as vscode from 'vscode';
import { NowListeningView, getUsernameBox, getAPIKeyBox } from "./NowListening";

export function activate(context: vscode.ExtensionContext) {

	const _username = vscode.workspace.getConfiguration().get('lastfm.view.username');
	const _apiKey = vscode.workspace.getConfiguration().get('lastfm.view.apiKey');
	
	const nowListeningView = new NowListeningView(context.extensionUri, _username, _apiKey);

	context.subscriptions.push(vscode.window.registerWebviewViewProvider("vscode-lastfm-listening-now-view", nowListeningView));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-lastfm-listening-now.init', () => {
		const options: { [key: string]: (context: vscode.ExtensionContext) => Promise<void> } = {
			username: async (context: vscode.ExtensionContext) => {
				const username = await getUsernameBox();
				if (username) {
					await vscode.workspace.getConfiguration().update('lastfm.view.username', username, vscode.ConfigurationTarget.Global);
					console.log("Username is set");
				}
			},
			apiKey: async (context: vscode.ExtensionContext) => {
				const apiKey = await getAPIKeyBox();
				if (apiKey) {
					await vscode.workspace.getConfiguration().update('lastfm.view.apiKey', apiKey, vscode.ConfigurationTarget.Global);
					console.log("API key is set");
				}
			}
		};

		const quickPick = vscode.window.createQuickPick();
		quickPick.items = Object.keys(options).map(label => ({ label }));
		quickPick.onDidChangeSelection(selection => {
			if (selection[0]) {
				options[selection[0].label](context).catch(console.error);
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}));
}

// this method is called when your extension is deactivated
export function deactivate() { }
