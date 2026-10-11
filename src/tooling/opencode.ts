import { $ } from 'bun';

export class OpencodeError extends Error {
    constructor(
        readonly exitCode: number,
        message: string
    ) {
        super(message);
        this.name = 'OpencodeError';
    }
}

export type OpencodeRunOptions = {
    message: string;
    flags?: string[];
};

export function collectFlag(value: string, previous: string[] = []): string[] {
    return [...previous, value];
}

/**
 * Runs `opencode run <message> <flags…>`. Bun escapes every interpolated value, so
 * a message and a flag each stay one argument whatever they contain — these
 * prompts are full of backticks, quotes and `<TICKET>` markers. opencode's own
 * flags are not modelled here; callers pass them, last so they win. Any non-zero
 * exit throws: a failed agent run must not be followed by the command claiming
 * there is a plan to review.
 */
export async function opencodeRun({ message, flags = [] }: OpencodeRunOptions): Promise<void> {
    const result = await $`opencode run ${[message, ...flags]}`.nothrow().quiet();

    if (result.exitCode === 0) {
        return;
    }

    throw new OpencodeError(result.exitCode, describe(result.exitCode, result.stderr.toString()));
}

function describe(exitCode: number, errors: string): string {
    const detail = errors.trim();

    return detail === ''
        ? `exited with code ${exitCode}`
        : `exited with code ${exitCode}: ${detail}`;
}
