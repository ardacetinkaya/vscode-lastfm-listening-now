import 'isomorphic-fetch';
import * as vscode from "vscode";
import { getNonce } from "./Utilities";


class Track {
	artist: string;
	name: string;
	image: string;
	nowPlaying: boolean;
	url: string;
	tags: Array<string>;
	constructor(artist: string, name: string, image: string, nowPlaying: boolean = false, url: string = "", tags: Array<string>) {
		this.artist = artist;
		this.name = name;
		this.image = image;
		this.nowPlaying = nowPlaying;
		this.url = url;
		this.tags = tags;
	}
}



export class NowListeningView implements vscode.WebviewViewProvider {
	_view?: vscode.WebviewView;
	_doc?: vscode.TextDocument;
	_tracks: Track[] = [];
	_placeholder: string = "Please set your Last.fm user name.";

	constructor(private readonly _extensionUri: vscode.Uri, private readonly _username: string | unknown, private readonly _apiKey: string | unknown) {
		if (_username && _apiKey) {
			this._placeholder = "";
		}
	}

	public resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri],
		};

		var webViewContent = this._getHtmlForWebview(webviewView.webview)
			.then((content) => {
				webviewView.webview.html = content;
			});
	}

	private _autoCheckCurrentPlayInterval = setTimeout(() => {
		if (!this._username) {
			if (!this._apiKey) {
				console.log("No username and api key configured");
				return;
			}
			console.log("No username configured");
			return;
		}
		if (!this._apiKey) {
			console.log("No api key configured");
			return;
		}

		let self = this;

		fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${this._username}&api_key=${this._apiKey}&format=json&limit=15`, {
			method: 'GET',
		}).then(function (response) {
			return response.json();
		}).then(async function (data) {

			//Clear array for every time
			self._tracks.length = 0;

			//For each track, get top tags associated to it and push track info + tags to Track[]  

			let promises = [];
			let test = 0;

			for (const t of data.recenttracks.track) {
				let url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&artist=${t.artist["#text"]}&track=${t.name}&autocorrect=1&api_key=d54e96c2d8ebe046577ca45e6e28500f&format=json`;
				const result = await fetch(url);
				let response = await result.json();
				console.log(response);
				test++;

				let tagResult = response.track.toptags.tag;
				let tags = new Array<string>();


				if (tagResult) {
					for (let i = 0; i < 4; i++) {
						if (tagResult[i]) {
							tags.push(tagResult[i].name);
						}
					}
				}

				self._tracks.push({
					artist: t.artist["#text"],
					name: t.name,
					image: t.image[2]["#text"],
					nowPlaying: (t["@attr"] && t["@attr"].nowplaying === "true"),
					url: t.url,
					tags: tags
				});
			}

			console.log(test);

			self._view?.webview.postMessage(self._tracks);
		});

	}, 1000);


	private async _getHtmlForWebview(webview: vscode.Webview) {
		this._autoCheckCurrentPlayInterval;

		//HTML resources
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"));
		const nowPlayingImage = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "now_playing.gif"));

		const nonce = getNonce();
		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
				<link href="${styleVSCodeUri}" rel="stylesheet">

			</head>
      <body>
          <ul id="tracks" class="tracks">${this._placeholder}
          </ul>
          <script nonce="${nonce}">
            const tsvscode = acquireVsCodeApi();
            window.addEventListener('message', event => {
              var ul = document.getElementById("tracks");
              ul.innerHTML = "";
              event.data.forEach((t) => {
                var li = document.createElement("li");
                var img = document.createElement("img");
                var span = document.createElement("span");
                var artist = document.createElement("p");
                var song = document.createElement("a");
				var tag1 = document.createElement("span");
				var tag2 = document.createElement("span");
				var tag3 = document.createElement("span");
                song.href = t.url;
                artist.className = "artist";
                artist.innerText = t.artist;

                if(t.nowPlaying) {
                  var nowPlaying = document.createElement("img");
                  nowPlaying.src = "${nowPlayingImage}";

                  var _song = document.createElement("p");
                  _song.innerText = t.name;

                  song.appendChild(nowPlaying);
                  song.appendChild(_song);
                } else {
                  song.innerText = t.name;
                }
  
                song.className = "song";

				
				
                
                img.src = t.image;
                img.className = "image";

                span.appendChild(song);
                span.appendChild(artist);

				if (t.tags.length){
					tag1.innerText = t.tags[0];
					tag2.innerText = t.tags[1];
					tag3.innerText = t.tags[2];
					tag1.className = "badge badge-secondary bg-danger";
					tag2.className = "badge badge-secondary bg-danger";
					tag3.className = "badge badge-secondary bg-danger";
					span.appendChild(tag1);
					span.appendChild(tag2);
					span.appendChild(tag3);
				}
				
                
                
                li.appendChild(img);
                li.appendChild(span);

                ul.appendChild(li);
              });
            });
          </script>
      </body>
			</html>`;
	}
}

export async function getUsernameBox(): Promise<string | undefined> {
	const result = await vscode.window.showInputBox({
		value: '',
		placeHolder: 'Your Last.fm username...'
	});

	if (result) {
		return result;
	} else {
		vscode.window.showErrorMessage("No username provided");
	}
}

export async function getAPIKeyBox(): Promise<string | undefined> {
	const result = await vscode.window.showInputBox({
		value: 'fa58fabed20b22085956cf1f644d89ad',
		placeHolder: 'Last.fm API Key...'
	});

	if (result) {
		return result;
	} else {
		vscode.window.showErrorMessage("No api key provided");
	}
}
