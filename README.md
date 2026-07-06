# Toy Strike: Lone Arena — Setup Guide

## Files in this zip
- `index.html` → the game itself. Upload this to GitHub Pages (must be named `index.html`).
- `server/` → the online multiplayer relay server (Node.js). This needs separate hosting.

## 1. Host the game (GitHub Pages) — for solo vs bots, this is all you need
1. Create a GitHub repo, upload `index.html`.
2. Settings → Pages → Deploy from branch `main` / root.
3. You'll get a link like `https://yourname.github.io/yourrepo/` — that's your playable game.

## 2. Host the multiplayer server (needed ONLY for "Play Online / Room Code")
The room-code online mode needs a small server running 24/7. GitHub Pages can't run this
(it only serves static files) — you need a separate free host:

1. Go to **render.com** → sign up (free) → "New Web Service"
2. Connect it to a GitHub repo containing the `server/` folder (upload `server.js` +
   `package.json` to a new repo, e.g. `toy-strike-server`)
3. Build command: `npm install`
4. Start command: `npm start`
5. Deploy — Render gives you a URL like `https://toy-strike-server.onrender.com`

## 3. Connect the game to your server
1. Open your game (GitHub Pages link)
2. Lobby → "🌐 PLAY ONLINE (ROOM CODE)"
3. Paste your Render server URL into the "Server URL" box
4. One player taps **Create Room** → gets a 4-letter code → shares it with a friend
5. Friend pastes the same Server URL, types the code, taps **Join Room**
6. Either player taps **Start Online Match**

## Notes / current limits of the online mode
- This is a lightweight relay (each browser runs its own game and shares position/shoot/hit
  events) — good for 2 players (1v1) testing. It is NOT a fully authoritative anti-cheat
  server like a commercial game would use.
- Render's free tier can "sleep" after inactivity — the first connection after idle time
  may take ~30-50 seconds to wake up.
- 2v2/team scoring, matchmaking queues, and persistent ranked stats are not implemented yet —
  this covers direct room-code play only.
