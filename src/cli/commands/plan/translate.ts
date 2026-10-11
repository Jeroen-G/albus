import { Command } from 'commander';

import { step } from '@/cli/step';
import { apfel } from '@/tooling/apfel';

export type TranslateInput = {
    path: string;
    instruction?: string;
};

const translationPrompt = 'Translate into English.';

export function definePlanTranslate(program: Command) {
    program
        .command('plan:translate')
        .description('Translate a planning file into English, in place')
        .argument('<path>', 'File to translate')
        .option('--instruction <instruction>', 'Anything else apfel should do in the same pass')
        .action(async (path: string, options: { instruction?: string }) => {
            await runPlanTranslate({ path, instruction: options.instruction });
        });
}

export async function runPlanTranslate({ path, instruction }: TranslateInput): Promise<void> {
    const prompt =
        instruction === undefined ? translationPrompt : `${translationPrompt} ${instruction}`;

    await step('translating into English', async () => {
        const text = await apfel({ files: [path], prompt });

        if (text.trim() === '') {
            throw new Error(`apfel returned an empty translation, ${path} is untouched`);
        }

        await Bun.file(path).write(text);
    });
}
