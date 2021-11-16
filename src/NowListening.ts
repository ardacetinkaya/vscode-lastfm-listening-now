import 'isomorphic-fetch';
import * as vscode from "vscode";
import { getNonce } from "./Utilities";

class Track {
  artist: string;
  name: string;
  image: string;
  nowPlaying: boolean;
  url: string;
  constructor(artist: string, name: string, image: string, nowPlaying: boolean = false, url: string = "") {
    this.artist = artist;
    this.name = name;
    this.image = image;
    this.nowPlaying = nowPlaying;
    this.url = url;
  }
}



export class NowListeningView implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;
  _tracks: Track[] = [];

  constructor(private readonly _extensionUri: vscode.Uri, private readonly _username:string|unknown, private readonly _apiKey:string|unknown) {

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

  private _autoCheckCurrentPlayInterval = setInterval(() => {
    if (this._username && this._apiKey) {
      fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${this._username}&api_key=${this._apiKey}&format=json&limit=15`, {
        method: 'GET',
      }).then(async response => {
        if (response.ok) {
          const result = await response.json();
          
          //Clear array for every time
          this._tracks.length = 0;

          result.recenttracks.track.map((t: any) => {
            this._tracks.push({
              artist: t.artist["#text"],
              name: t.name,
              image: t.image[2]["#text"],
              nowPlaying: (t["@attr"] && t["@attr"].nowplaying === "true"),
              url: t.url
            });
          });

          this._view?.webview.postMessage(this._tracks);
        }
      });
    } else {
      console.log("No username or api key");
    }
  }, 5000);


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
			
				<link href="${styleVSCodeUri}" rel="stylesheet">
			</head>
      <body>
          <ul id="tracks" class="tracks">
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

export async function getUsernameBox():Promise<string | undefined>{
	const result = await vscode.window.showInputBox({
		value: '',
		placeHolder: 'Your Last.fm username...'
	});
	
  if(result) {
    return result;
  }else {
    vscode.window.showErrorMessage("No username provided");
  }
}

export async function getAPIKeyBox():Promise<string | undefined>{
	const result = await vscode.window.showInputBox({
		value: 'fa58fabed20b22085956cf1f644d89ad',
		placeHolder: 'Last.fm API Key...'
	});
	
  if(result) {
    return result;
  }else {
    vscode.window.showErrorMessage("No api key provided");
  }
}