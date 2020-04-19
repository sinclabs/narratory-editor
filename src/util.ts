export function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export const getErrorHTML = (cspSource: string, nonce: string, error: string) => `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">

		<!--
		Use a content security policy to only allow loading images from https or from our extension directory,
		and only allow scripts that have a specific nonce.
		-->
		<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource}; style-src ${cspSource}; script-src 'nonce-${nonce}';">

		<meta name="viewport" content="width=device-width, initial-scale=1.0">

		<title>Narratory Editor</title>
	</head>
	<body>
		<div class="notes">
			<p>Something went wrong</p>
			<p>${error}</p>
		</div>
	</body>
	</html>
`;