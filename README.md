# DevFlow Server

## Run the API locally

1. Install the dependencies:

   ```powershell
   npm ci
   ```

2. Create a local `.env` file with the server's required settings, including `DB_USER`, `DB_PASS`, `JWT_SECRET`, and `SITE_DOMAIN`. Never commit `.env` or share its contents.
3. Make sure MongoDB is reachable and Ollama is running with the model used by the app:

   ```powershell
   ollama pull qwen2.5:3b
   ```

4. Start the server:

   ```powershell
   npm start
   ```

When `OLLAMA_URL` is not configured, AI generation uses local Ollama at `http://localhost:11434/api/generate`.

## Use local Ollama from the deployed Render service

This setup sends AI requests from Render to Ollama on your Windows computer through an authenticated local relay and a Cloudflare Quick Tunnel. It is intended for testing, not reliable production use.

### Requirements and limitations

- Keep your computer, Ollama, the relay, and the tunnel running and connected to the internet. AI generation is unavailable when any of them stop or your computer sleeps.
- Cloudflare Quick Tunnels are temporary, have no uptime guarantee, and issue a new hostname after restart. Update Render's `OLLAMA_URL` whenever the hostname changes.
- The model runs on your computer, so generation speed depends on your computer and network connection.
- Do not expose Ollama's port `11434` directly to the internet. The tunnel must point to the authenticated relay on port `11435`.
- Never commit, screenshot, or share `OLLAMA_AUTH_TOKEN`. If it is exposed, replace it in both the relay and Render.

### 1. Start Ollama

Make sure Ollama is installed and running, and that the Qwen model is available:

```powershell
ollama pull qwen2.5:3b
ollama list
```

### 2. Start the authenticated relay

Open a PowerShell terminal in the backend repository directory. Generate a fresh token, copy it to the clipboard for adding to Render, and start the relay in the same terminal:

```powershell
$env:OLLAMA_AUTH_TOKEN = [guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
Set-Clipboard -Value $env:OLLAMA_AUTH_TOKEN
npm run tunnel:ollama
```

The relay must print `Authenticated Ollama proxy listening on 127.0.0.1:11435`. Leave this terminal open. The token is not displayed; paste it into Render's `OLLAMA_AUTH_TOKEN` value field with **Ctrl+V**. Do not put the token in source control or a committed file.

### 3. Start the Cloudflare Quick Tunnel

Open a second PowerShell terminal and run:

```powershell
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:11435
```

If `cloudflared` is on your PATH, this shorter command also works:

```powershell
cloudflared tunnel --url http://127.0.0.1:11435
```

Wait for `Registered tunnel connection`. Copy the HTTPS hostname printed after `Your quick Tunnel has been created!`, for example `https://example.trycloudflare.com`. Leave this terminal open.

### 4. Verify the tunnel

In another terminal, send an unauthenticated request to the relay endpoint using the current hostname:

```powershell
curl.exe -i -X POST "https://example.trycloudflare.com/api/generate" -H "Content-Type: application/json" -d "{}"
```

An HTTP `401 Unauthorized` response is expected: it confirms the request reached the authenticated relay. Do not add a token to this test.

### 5. Configure Render

In the Render dashboard, open the backend web service and go to **Environment**. Set:

| Key | Value |
| --- | --- |
| `OLLAMA_URL` | `https://example.trycloudflare.com/api/generate` using the current tunnel hostname |
| `OLLAMA_AUTH_TOKEN` | Paste the token copied in step 2 |

Keep the existing server variables configured in Render (`DB_USER`, `DB_PASS`, `JWT_SECRET`, and `SITE_DOMAIN`). Save the changes and wait for Render to finish deploying.

### 6. Try AI task generation

With Ollama, the relay, and the tunnel still running, use **Generate Tasks** in the frontend. No frontend API URL changes are needed for this Ollama tunnel setup; the frontend continues calling the backend API.

If generation fails:

- **Render reports 530:** the tunnel hostname is unavailable or stale. Start a new Quick Tunnel, verify its current URL, update Render's `OLLAMA_URL`, and wait for redeployment.
- **Render reports 401 from the AI provider:** the relay token and Render's `OLLAMA_AUTH_TOKEN` do not match. Generate a new token, update Render, and restart the relay using that same token.
- **Relay reports local Ollama unavailable:** verify Ollama is running and `qwen2.5:3b` is installed.

Do not confuse an AI-provider error with the frontend's own authentication response. The AI request goes from the backend to the relay; the frontend should continue using its existing backend route.

## Render deployment

Deploy this repository as a Node.js Web Service with:

- Build command: `npm ci`
- Start command: `npm start`

Configure required server environment variables in Render rather than committing secrets. The service uses a persistent Node.js process for Socket.IO and the task reminder job.
