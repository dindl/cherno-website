# CHERNO GAMING

Early-internet React site for CHERNO GAMING.

## Edit The Site

Most content lives in:

```txt
src/config/siteConfig.js
```

Use that file to change:

- horizontal logo path
- dancer PNG head path
- merch image, text, and button URL
- partner cards and social links
- embedded YouTube videos
- team accomplishments
- theme song title and loop setting
- footer links and visitor counter text

## Asset Slots

Current placeholder assets live in:

```txt
public/assets/placeholders/
```

Recommended real asset paths:

```txt
public/assets/logo/cherno-gaming-logo.png
public/assets/dancer/cherno-head.png
public/assets/merch/merch-preview.png
public/assets/partners/example-partner.png
public/assets/audio/theme-song.mp3
```

After adding files, update their matching paths in `src/config/siteConfig.js`.

The theme song is an owner/deploy-time asset. Visitors only get one mute/unmute
toggle; they should never get play/stop controls, an upload, a picker, or a URL
field for changing the MP3.

## YouTube Embeds

Use YouTube embed URLs in config:

```txt
https://www.youtube.com/embed/VIDEO_ID
```

## Run Locally

```bash
npm install
npm run dev
```
