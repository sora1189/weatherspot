# WeatherSpot Terminal

天気・時間帯・都市の景色・SpotifyのBGMを組み合わせた、天気アプリです。

選択した都市の現在の天気と時間帯に応じて、窓の外の景色、天候アニメーション、画面テーマ、Spotifyプレイリストが変化します。

![WeatherSpot Terminal](assets/readme-preview.png)

## Features

- Open-Meteo APIによる現在の天気と時間別予報の取得
- 東京、ロンドン、ニューヨーク、北京、テキサスの都市切り替え
- 晴れ、曇り、雨、雪、雷雨に応じた画面演出
- 選択都市の現地時刻に連動した朝・昼・夕方・夜の表現
- 都市ごとに異なるドット絵の窓景色
- 景色を大きく楽しむ窓枠モード
- Spotify Web Playback SDKによる天気別BGM再生
- プレイリストURLや再生設定のブラウザ保存
- キーボード操作とレスポンシブ表示への対応

## Technologies

- HTML
- CSS
- JavaScript
- [Open-Meteo API](https://open-meteo.com/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- Spotify Web Playback SDK

フレームワークやビルドツールを使用せず、静的ファイルだけで動作します。

## Project Structure

```text
.
├─ index.html
├─ assets/
│  ├─ large-window/
│  ├─ scenes/
│  └─ readme-preview.png
├─ scripts/
│  ├─ storage.js   # 設定とlocalStorage
│  ├─ weather.js   # 天気APIと天気表示
│  ├─ spotify.js   # Spotify認証と再生
│  └─ ui.js        # DOM、起動演出、操作イベント
└─ styles/
   ├─ boot.css
   ├─ dashboard.css
   ├─ window.css
   ├─ menu.css
   └─ responsive.css
```

## Spotify Setup

天気表示だけを利用する場合、Spotifyの設定は不要です。

Spotify再生機能を利用する場合は、Spotify Developer Dashboardでアプリを作成し、Redirect URIを登録します。

ローカル実行時：

```text
http://localhost:5500/index.html
```

GitHub Pagesで公開する場合は、公開されたページのURLもRedirect URIへ追加してください。

Spotifyの再生制御にはSpotify Premiumが必要になる場合があります。Client Secretはブラウザ側のコードへ保存しないでください。

## Notes

- Spotify Client IDは公開用の識別子ですが、Client Secretやアクセストークンは公開しないでください。
- プレイリスト設定やSpotifyの認証情報はブラウザのlocalStorageへ保存されます。
- 画像ファイルが比較的大きいため、公開前にWebP変換や圧縮を行うと初回表示を軽量化できます。

