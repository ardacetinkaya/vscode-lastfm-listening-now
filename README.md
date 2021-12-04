# Last.fm Recent Tracks **VS Code** Extension

<img src="https://user-images.githubusercontent.com/4550197/144708315-1f4392bf-0289-4909-934e-3f3f44242336.gif" align="right" />

This is a simple [Visual Studio Code(a.k.a VS Code)](https://code.visualstudio.com/) extension that displays currently playings songs within Last.fm. Sometimes while listening mixed list a catchy and good song may hit. Whitout leaving VS Code environment, it is easy to see what is currentl playing with help of [Last.fm](https://last.fm)

But the main concept for this plugin is to learn how to create an extension for VS Code. Mainly some other business requierment causes me to develop an extension. Because it is not currently possible to have it as open source; I just wanted to share my learning journey within this simple extension.

- Also check these resources to deep dive into VS Code Extension development
    - https://code.visualstudio.com/api/get-started/your-first-extension
    - https://code.visualstudio.com/api/extension-guides/webview
    - https://github.com/microsoft/vscode-extension-samples

## Features

- Displays currently playing song in Explorer view
- Displays recent listened tracks in Explorer view as WebView

## Requirements

- Idea about [Last.fm](https://last.fm)
    - If you are not integrating your music player(Ex: Spotify) with [Last.fm](https://last.fm) as an user, this extension won't help you for anything, then maybe just helps you to learn how to develop a better **VS Code** extension.
    - So you need [Last.fm](https://last.fm) account and API key, please [check here](https://www.last.fm/api/account/create)


## Extension Settings

This extension has the following settings:

* `lastfm.view.username`: username for Last.fm account
* `lastfm.view.apiKey`: API key to access [Last.fm APIs]()

These settings can be set with **Init** command of the extension

![username](https://user-images.githubusercontent.com/4550197/144709191-c49d2755-6abe-4650-8956-40b1344f7cc0.gif)


## Known Issues

- If [Last.fm](https://last.fm) username is changed for extension **VS Code** instance should be restarted.

## Release Notes

### 1.0.0

- Initial release

-----------------------------------------------------------------------------------------------------------
## Following extension guidelines

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)


**Enjoy!**
