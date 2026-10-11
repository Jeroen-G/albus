import { Command } from 'commander';

import { describe, step } from '@/cli/step';

import { createFolder } from '../../../tooling/filesystem';

export function defineSetUp(program: Command) {
    program
        .command('env:setup')
        .description('Setup the configuration')
        .action(async () => {
            await runSetUp();
        });
}

export async function runSetUp(): Promise<void> {
    await describe('Setting everything up', async () => {
        await step('Creating specs folder', async () => {
            await createFolder('./.spec/');
        });

        await step('Creating agents folder', async () => {
            await createFolder('./.agents/');
        });
    });
}
