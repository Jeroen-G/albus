import ora from 'ora';

const bright = '\x1b[1m';
const dim = '\x1b[2m';
const cyan = '\x1b[36m';
const red = '\x1b[31m';
const reset = '\x1b[0m';

export async function describe(text: string, handle: () => Promise<void>): Promise<void> {
    console.log(`  ${bright}${cyan}%s${reset}`, text);

    await handle();

    console.log('');
}

type StepResult = boolean | string | void;
type Progress = (progress: string) => void;

export async function step(
    text: string,
    handle: (arg: Progress) => StepResult | Promise<StepResult>
): Promise<StepResult> {
    const spinner = ora();
    spinner.text = text;
    spinner.start();

    // Fake some delay to show the spinner
    await delay(100);

    const start = new Date();
    let succeeded: StepResult;

    try {
        succeeded = await handle(progress => {
            spinner.text = text + ': ' + progress;
        });
    } catch (error) {
        spinner.fail(`${text} ${dim}[${duration(start)}]${reset}`);
        throw error;
    }

    if (typeof succeeded === 'string') {
        spinner.succeed(`${text}: ${dim}${succeeded} in [${duration(start)}]${reset}`);
    } else if (typeof succeeded !== 'boolean' || succeeded) {
        spinner.succeed(`${text} ${dim}[${duration(start)}]${reset}`);
    } else {
        spinner.fail();
    }

    return succeeded;
}

export function fail(text: string, error?: unknown): void {
    const detail = error === undefined ? '' : `: ${dim}${reason(error)}${reset}`;

    console.error(`  ${bright}${red}%s${reset} ${text}${detail}`);
}

export function duration(start: Date): string {
    const milliseconds = new Date().getTime() - start.getTime();

    return formatDuration(milliseconds);
}

export function formatDuration(milliseconds: number): string {
    if (milliseconds < 500) {
        return `${milliseconds}ms`;
    }

    if (milliseconds < 60000) {
        return `${Math.round((milliseconds / 1000) * 10) / 10}s`;
    }

    if (milliseconds % 60000 === 0) {
        return `${Math.round(milliseconds / 60000)}m`;
    }

    return `${Math.round(milliseconds / 60000)}m ${Math.round((milliseconds % 60000) / 1000)}s`;
}

function reason(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
