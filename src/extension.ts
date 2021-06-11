import * as vscode from 'vscode';
import { BrowserPreview } from './editorPreview/browserPreview';
import { getWebviewOptions, Manager } from './manager';
import { GetRelativeActiveFile } from './utils/utils';

export function activate(context: vscode.ExtensionContext) {
	const manager = new Manager(context.extensionUri, context.globalState);

	context.subscriptions.push(
		vscode.commands.registerCommand('liveserver.start', () => {
			manager.openServer(true);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('liveserver.start.preview.atIndex', () => {
			manager.createOrShowPreview();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'liveserver.start.preview.atActiveFile',
			() => {
				const relativeActiveFile = GetRelativeActiveFile();
				manager.createOrShowPreview(undefined, relativeActiveFile);
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'liveserver.start.externalPreview.atActiveFile',
			() => {
				const relativeActiveFile = GetRelativeActiveFile();
				manager.showPreviewInBrowser(relativeActiveFile);
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('liveserver.end', () => {
			manager.closeServer(true);
		})
	);

	if (vscode.window.registerWebviewPanelSerializer) {
		vscode.window.registerWebviewPanelSerializer(BrowserPreview.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				const file = state.currentAddress ?? '/';
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
				manager.createOrShowPreview(webviewPanel, file);
			},
		});
	}
}
