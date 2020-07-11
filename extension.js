const vscode = require('vscode');
const http = require('http');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Activated yolo mode.');

	let disposable = vscode.commands.registerCommand('yolo', () => {
		http
			.get('http://whatthecommit.com/index.txt', (res) => {
				let data = '';
				res.on('data', (c) => (data += c));
				res.on('end', () => {
					commitAll(data);
				});
			})
			.on('error', () => {
				vscode.window.showInformationMessage(
					'Looks like whatthecommit.com is unreachable. A generic commit message was used instead.'
				);
				commitAll('Blame Nick.');
			});
	});

	context.subscriptions.push(disposable);
}

exports.activate = activate;

/**
 * Just commit everything
 * @param {string} message
 */
async function commitAll(message) {
	const pushAfterCommit = vscode.workspace
		.getConfiguration('yolo')
		.get('pushAfterCommit');

	const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
	const repo = gitExtension.getAPI(1).repositories[0];
	repo.inputBox.value = message;

	await vscode.commands.executeCommand('saveAll');
	await vscode.commands.executeCommand('git.stageAll');
	await vscode.commands.executeCommand('git.commitStaged');

	if (pushAfterCommit) await vscode.commands.executeCommand('git.sync');
	vscode.window.showInformationMessage(
		`${pushAfterCommit ? 'Pushed' : 'Commited'} all your broken code! 🎉`
	);
}
