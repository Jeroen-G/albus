# Albus

Albus is a CLI to help with agentic development in a more deterministic way. 
In terms of [harness engineering](https://martinfowler.com/articles/harness-engineering.html) it is a (work in progress) tool of convenience focused on providing computational controls that assist in the steering loop.
Currently only built for macOS.

## Install

With npm:

```shell
npm install -g @jeroeng/albus
npx @jeroeng/albus --help
```

## Requirements

Albus reaches out to other tools for the work it does.
`albus env:check` verifies that these additional tools are installed only, it does not install them.

## Commands

| Command                       | Description                                                  |
|-------------------------------|--------------------------------------------------------------|
| `albus jira:ticket <ticket>`  | Fetch a Jira ticket and save it to `.spec/<ticket>/ticket.md` |
| `albus jira:ticket <url>`     | Fetch a ticket from the Atlassian profile that owns the URL     |
| `albus plan:ticket <ticket>`* | Write an implementation plan for a saved ticket              |
| `albus plan:test <ticket>`*   | Write a test plan for a saved ticket                         |
| `albus plan:translate <path>` | Translate a planning file into English                       |
| `albus env:check`             | Check that the required CLI tools are installed              |
| `albus env:setup`             | Create the `.spec/` and `.agents/` folders                   |
| `albus mac:awake [minutes]`   | Keep the Mac and display awake, optionally with a duration   |
| `albus mac:notify`            | Show a macOS notification when work is done                  |

Commands with an asterisk use OpenCode, you may override the default prompt with the `--prompt "<text>"` flag or add extra OpenCode run flags with `--flag "<flags>"`.

Artifacts are written under `.spec/<ticket>/`.

`jira:ticket` accepts a ticket key (`ABC-123`) or a full Atlassian URL (`https://abc.atlassian.net/browse/ABC-123`). A URL selects the matching profile from `atlassian-cli` automatically; use `--profile <profile>` to override it. The plan commands accept the same references and use the ticket key for the `.spec/` path.

## Skills

An Albus skill is included at [`./skills/albus/SKILL.md`](.opencode/skills/albus/SKILL.md).
You could copy-paste the skill or install it with:

```shell
npx skills add git@github.com:Jeroen-G/albus.git
```

## Development

```sh
bun install
bun run lint     # eslint + tsc --noEmit
bun run build    # produces dist/albus (macOS arm64)
```

<img src="albus.png" alt="Albus" width="200"/>
