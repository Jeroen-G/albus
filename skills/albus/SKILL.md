---
name: Albus CLI
description: Use the Albus CLI to show a macOS completion notification, keep the Mac awake, fetch Jira tickets, write or translate plans.
---

# When to use Albus

Use this skill when the user asks Albus to perform one of these tasks.
If they are asking how to use Albus rather than asking you to do something, explain the command without running it.
Run the installed `albus` executable and report the result; if it is unavailable, say so rather than substituting another tool.

# Route the request

| User intent                                         | Command                       |
|-----------------------------------------------------|-------------------------------|
| Show a completion notification                      | `albus mac:notify`            |
| Keep the Mac and display awake for a duration       | `albus mac:awake <minutes>`   |
| Keep the Mac and display awake without a time limit | `albus mac:awake`             |
| Fetch a Jira ticket                                 | `albus jira:ticket <ticket>`  |
| Write an implementation plan*                       | `albus plan:ticket <ticket>`  |
| Write a test plan*                                  | `albus plan:test <ticket>`    |
| Translate a planning file (in place)                | `albus plan:translate <path>` |
| Check the project environment                       | `albus env:check`             |
| Set up the project environment                      | `albus env:setup`             |

Use `albus --help` or `albus <command> --help` if command syntax or options are unclear.
Quote paths containing spaces.
Commands with an asterisk use OpenCode, you may override the default prompt with the `--prompt "<text>"` flag or add extra OpenCode run flags with `--flag "<flags>"` if requested by the user.
Artifacts are written under `.spec/<ticket>/`.

## Keep the Mac awake

The optional duration is a positive whole number of minutes: convert requests such as “30 minutes” to `albus mac:awake 30` and “2 hours” to `albus mac:awake 120`. Ask for clarification for durations that cannot be represented as whole minutes. Without a duration, Albus keeps the Mac awake until stopped.

`mac:awake` is long-running. When starting it from OpenCode, detach it so the session remains usable, capture its PID, and report the PID and how to stop it. For example:

```sh
nohup albus mac:awake 30 >/dev/null 2>&1 </dev/null &
pid=$!
sleep 1
if kill -0 "$pid" 2>/dev/null; then
    printf '%s\n' "$pid"
else
    exit 1
fi
```

Check the final command's status: if it succeeds, report the PID; if it fails, do not claim the Mac is being kept awake. Use the same pattern without `30` for an indefinite run. To stop a run, inspect `ps -p <pid> -o command=` and verify it is the `albus mac:awake` process before sending it `SIGTERM` with `kill <pid>`. Never use a broad process match.
