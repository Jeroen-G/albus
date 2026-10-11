import { $ } from 'bun';

const FAILURES: Record<number, string> = {
    3: 'guardrail blocked the content',
    4: 'context overflow, the input is too long',
    5: 'model unavailable, is Apple Intelligence enabled?',
    6: 'rate limited, try again later',
};

export class ApfelError extends Error {
    constructor(
        readonly exitCode: number,
        message: string
    ) {
        super(message);
        this.name = 'ApfelError';
    }
}

export type ApfelOptions = {
    files?: string[];
    prompt: string;
    schema?: string;
    output?: 'plain' | 'json';
};

/**
 * Runs apfel and returns its response text. Bun escapes every interpolated value,
 * so a prompt or a path stays one argument whatever it contains. Any non-zero exit
 * throws: callers must not treat a failed call as a result.
 */
export async function apfel(options: ApfelOptions): Promise<string> {
    const files = (options.files ?? []).flatMap(file => ['-f', file]);
    const schema = options.schema ? ['--schema', options.schema] : [];
    const output = ['-o', options.output ?? 'plain'];

    const result = await $`apfel ${[...files, ...schema, ...output]} -- ${options.prompt}`
        .nothrow()
        .quiet();

    if (result.exitCode === 0) {
        return result.text();
    }

    throw new ApfelError(result.exitCode, describe(result.exitCode, result.stderr.toString()));
}

function describe(exitCode: number, errors: string): string {
    const cause = FAILURES[exitCode] ?? `exited with code ${exitCode}`;
    const detail = errors.trim();

    return detail === '' ? cause : `${cause}: ${detail}`;
}
