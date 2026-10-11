import { $ } from 'bun';

export class NotifyError extends Error {
    constructor(
        readonly exitCode: number,
        message: string
    ) {
        super(message);
        this.name = 'NotifyError';
    }
}

/**
 * Shows a macOS notification. Bun escapes every interpolated value, so the
 * script with the message inside it stays one argument whatever it contains.
 * Any non-zero exit throws: a failed notification must not be reported as shown.
 */
export async function notify(message: string): Promise<void> {
    const script = `display notification "${escape(message)}"`;

    const result = await $`osascript -e ${script}`.nothrow().quiet();

    if (result.exitCode === 0) {
        return;
    }

    throw new NotifyError(result.exitCode, describe(result.exitCode, result.stderr.toString()));
}

// AppleScript strings are quoted and backslash is an escape character, so both
// must be escaped before the message is embedded in `display notification "…"`.
function escape(message: string): string {
    return message.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function describe(exitCode: number, errors: string): string {
    const detail = errors.trim();

    return detail === ''
        ? `exited with code ${exitCode}`
        : `exited with code ${exitCode}: ${detail}`;
}
