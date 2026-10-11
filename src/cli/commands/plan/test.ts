import { Command } from 'commander';

import { describe, step } from '@/cli/step';
import { JiraKey } from '@/planning/jira/fetchTicket';
import { fileExists, fileHasContent } from '@/tooling/exists';
import { collectFlag, opencodeRun } from '@/tooling/opencode';

const instructionsPath = 'src/cli/commands/plan/write-test-plan.md';

export type PlanTestOptions = {
    prompt?: string;
    flag?: string[];
};

export type PlanTestInput = PlanTestOptions & {
    ticket: JiraKey;
};

export function definePlanTest(program: Command) {
    program
        .command('plan:test')
        .description('Write a test plan for an already saved Jira ticket')
        .argument('ticket', 'Ticket number')
        .option('--prompt <text>', 'Replaces the default prompt entirely')
        .option('--flag <token>', 'Extra opencode run flag, repeatable', collectFlag)
        .action(async (ticket: JiraKey, options: PlanTestOptions) => {
            await runPlanTest({ ticket, ...options });
        });
}

export async function runPlanTest({
    ticket,
    prompt,
    flag: callerFlags = [],
}: PlanTestInput): Promise<void> {
    const ticketPath = `.spec/${ticket}/ticket.md`;
    const testPlanPath = `.spec/${ticket}/test-plan.md`;

    await describe(`Test planning from ${ticket}`, async () => {
        await step('opening ticket', async () => {
            if (!(await fileHasContent(ticketPath))) {
                throw new Error(
                    `${ticketPath} is missing or empty, run "jira:ticket ${ticket}" first`
                );
            }

            return true;
        });

        await step('running opencode', async () => {
            await opencodeRun({
                message: prompt ?? defaultPrompt(testPlanPath),
                flags: [
                    '--agent=architect',
                    '--auto',
                    `--file=${ticketPath}`,
                    `--title=Test planning from ${ticket}`,
                    ...callerFlags, // last, so they win
                ],
            });
        });

        await step('checking test plan', async () => {
            return await fileExists(testPlanPath);
        });

        console.info(`You should now review ${testPlanPath}`);
    });
}

function defaultPrompt(testPlanPath: string): string {
    return `Read ${instructionsPath} and follow its instructions to write a test plan for this ticket, then save it to ${testPlanPath}. Do not ask questions, make assumptions and continue.`;
}
