import { Command } from 'commander';

import { describe, step } from '@/cli/step';
import { cliExists, cliExistsWithVersion } from '@/tooling/exists';

export function defineEnvCheck(program: Command) {
    program
        .command('env:check')
        .description('Check if all required CLI tools are installed')
        .action(runEnvCheck);
}

export async function runEnvCheck(): Promise<void> {
    await describe('Checking if necessary CLIs are installed', async () => {
        console.info(
            'If any fail, please install and configure them by following their respective documentation'
        );

        await step('bun', async () => {
            return cliExists('bun');
        });

        await step('atlassian-cli', async () => {
            return cliExists('atlassian-cli');
        });

        await step('opencode v2', async () => {
            return cliExistsWithVersion('opencode', 'v2');
        });

        await step('apfel', async () => {
            return cliExists('apfel');
        });
    });

    // Disabled: config.json is neither shipped nor documented, so this check is
    // misleading on a fresh install. Re-enable once a config file is documented.
    // await describe('Checking environment', async () => {
    //     await step('config.json', async () => {
    //         return fileExists('config.json');
    //     });
    // });
}
