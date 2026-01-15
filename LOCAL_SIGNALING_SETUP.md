# Setting Up Your Own Signaling Server

If the public signaling servers are down or blocked, you can run your own signaling server.

## Quick Setup (Local Development)

### Option 1: Use the Built-in Signaling Server

1. **Install y-webrtc globally** (if you want to run the server separately):

   ```bash
   npm install -g y-webrtc
   ```

2. **Run the signaling server**:

   ```bash
   # Default port 4444
   node node_modules/y-webrtc/bin/server.js

   # Or with custom port
   PORT=4444 node node_modules/y-webrtc/bin/server.js
   ```

3. **Update your code** to use local signaling:
   Edit `src/core/crdt/document.ts` and change:
   ```typescript
   signaling: ["ws://localhost:4444"];
   ```

### Option 2: Run Signaling Server in Package Script

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "signaling": "node node_modules/y-webrtc/bin/server.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run signaling\""
  }
}
```

Then run:

```bash
npm run dev:all
```

## Production Setup

For production, you'll need to:

1. **Deploy signaling server** to a public server (AWS, DigitalOcean, etc.)
2. **Use WSS (secure WebSocket)** with SSL certificate
3. **Update signaling URL** in your code

### Example: Deploy to Railway/Render

1. Create a simple server file `signaling-server.js`:

   ```javascript
   require("y-webrtc/bin/server.js");
   ```

2. Deploy with environment variables:

   - `PORT=4444`
   - `HOST=0.0.0.0`

3. Update your app to use:
   ```typescript
   signaling: ["wss://your-signaling-server.railway.app"];
   ```

## Current Status

The app now uses **multiple fallback signaling servers**:

- `wss://signaling.yjs.dev` (primary)
- `wss://y-webrtc-signaling-eu.herokuapp.com` (fallback)
- `wss://y-webrtc-signaling-us.herokuapp.com` (fallback)

If all fail, the app still works **offline** - changes are saved locally and will sync when connection is restored.
