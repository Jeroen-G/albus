import { Command } from 'commander';

import { describe, step } from '@/cli/step';
import { apfel } from '@/tooling/apfel';
import { notify } from '@/tooling/notify';

const PROMPT = `You generate short, creative, one-sentence completion notification messages announcing that work or a task is finished. Return ONLY the message text without quotes, prefixes, markdown, or commentary.

Generate a creative, short "I am done" notification message.`;

export function defineMacNotify(program: Command) {
    program
        .command('mac:notify')
        .description('Show a macOS notification when work is done')
        .action(runMacNotify);
}

export async function runMacNotify(): Promise<void> {
    await describe('Notifying when done', async () => {
        await step('composing message', async () => {
            const message = clean(await apfel({ prompt: PROMPT }));

            if (message === '') {
                throw new Error('apfel returned an empty message, nothing to show');
            }

            await notify(message);

            return message;
        });
    });
}

// The model is asked for bare text, but strip any stray wrapping the way the
// original tool did so quotes or backticks never reach the notification.
function clean(text: string): string {
    return text
        .trim()
        .replace(/^["'`]+|["'`]+$/g, '')
        .trim();
}
