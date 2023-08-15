# Orchis-Lite, A (minimal) Dragalia Lost Server Emulator
This is a reduced version of the server hosted at https://orchis.cherrymint.live, with a lot of code removed.
It may not even function right now because a lot of untested changes have been made to enable the minimized nature of it, including the legacy login code.

This server only allows one user (one account, one save file, one session record). It's designed for self-hosting, and can run on anything that NodeJS can (mostly).

To use:
- Extract the Quest.zip file into a `Quest` folder.
- `npm install`
- From here, run with `node ./Orchis-Lite.js`

## This may not be fully functional as a lot of code has changed. Please feel free to open issues for non-functional code if any is found.

---

What doesn't work in this version:
- Kaleidoscape
- Suggestions
- Guilds
- Co-Op

Additionally:
- All of my admin utilities are removed
- All of the code pertaining to the removed functions listed above are also removed.
