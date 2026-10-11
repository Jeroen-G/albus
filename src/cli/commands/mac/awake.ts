import { Command } from 'commander';

export function defineMacAwake(program: Command): void {
    program
        .command('mac:awake [minutes]')
        .description('Keep the Mac and display awake, optionally for a set number of minutes')
        .action(runMacAwake);
}

export async function runMacAwake(minutes?: string): Promise<void> {
    const durationSeconds = parseDuration(minutes);
    const args = ['-di'];

    if (durationSeconds !== undefined) {
        args.push('-t', String(durationSeconds));
    }

    const caffeinate = Bun.spawn(['caffeinate', ...args], {
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
    });

    const forwardSigint = () => caffeinate.kill('SIGINT');
    const forwardSigterm = () => caffeinate.kill('SIGTERM');

    process.on('SIGINT', forwardSigint);
    process.on('SIGTERM', forwardSigterm);

    const durationMessage =
        minutes === undefined ? '' : ` for ${minutes} minute${minutes === '1' ? '' : 's'}`;
    console.log(`Keeping the Mac awake${durationMessage}. Press Ctrl-C to stop.`);

    try {
        const exitCode = await caffeinate.exited;
        if (exitCode !== 0) {
            process.exitCode = exitCode;
        }
    } finally {
        process.off('SIGINT', forwardSigint);
        process.off('SIGTERM', forwardSigterm);
    }
}

function parseDuration(minutes?: string): number | undefined {
    if (minutes === undefined) {
        return undefined;
    }

    const value = Number(minutes);
    const seconds = value * 60;

    if (!Number.isSafeInteger(value) || value <= 0 || !Number.isSafeInteger(seconds)) {
        throw new Error('duration must be a positive whole number of minutes');
    }

    return seconds;
}
