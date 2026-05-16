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
- YouTube content cards
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

## YouTube Content

Use normal YouTube watch or share URLs in config. The site renders scrollable
thumbnail cards instead of iframes so browser embed blockers do not blank the
content section.

```txt
https://youtu.be/VIDEO_ID
https://www.youtube.com/watch?v=VIDEO_ID
```

## Run Locally

```bash
npm install
npm run dev
```
