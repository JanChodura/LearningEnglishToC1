---
name: start-server
description: Start the local static preview server for this repository by running the root `startServer.bat` file. Use when the user wants to preview the generated `html/` site locally, reopen the local viewer, or explicitly asks to start the repo's preview server.
---

# Start Server

Run the repository's local HTML preview server through the existing batch file in the project root.
Use this skill only for this repository's preview flow based on `startServer.bat`.

## Workflow

1. Confirm that `startServer.bat` exists in the repository root.
2. Start it from the repository root, preferably in a separate window so the server keeps running.
3. Treat `html/` as the served directory and `http://localhost:8000/` as the default URL.
4. If the script prints that `py` is unavailable, allow it to fall back to `python`.
5. If port `8000` is already occupied, inspect whether the existing process is the intended preview server before changing anything.

## Command

Use the project root as the working directory and start the batch file:

```powershell
cmd /c start "startServer" /min startServer.bat
```

This keeps the server alive in its own window instead of blocking the current session.

## Expected Result

The server should serve the repository's `html/` directory at:

`http://localhost:8000/`

The batch file already handles:

- switching into `html/`
- trying `py` first
- falling back to `python`

## Notes

- Do not reimplement the server command if `startServer.bat` already exists and is valid.
- Prefer using the existing fixed port `8000`.
- If the user asks to change port or server behavior, update `startServer.bat` and any related docs rather than bypassing the script.
