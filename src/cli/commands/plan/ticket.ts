import { Command } from 'commander';

import { describe, step } from '@/cli/step';
import { JiraKey } from '@/planning/jira/fetchTicket';
import { fileHasContent } from '@/tooling/exists';
import { collectFlag, opencodeRun } from '@/tooling/opencode';

export type PlanTicketOptions = {
    prompt?: string;
    flag?: string[];
};

export type PlanTicketInput = PlanTicketOptions & {
    ticket: JiraKey;
};

export function definePlanTicket(program: Command) {
    program
        .command('plan:ticket')
        .description('Write a feature plan for an already fetched Jira ticket')
        .argument('ticket', 'Ticket number')
        .option('--prompt <text>', 'Replaces the default prompt entirely')
        .option('--flag <token>', 'Extra opencode run flag, repeatable', collectFlag)
        .action(async (ticket: JiraKey, options: PlanTicketOptions) => {
            await runPlanTicket({ ticket, ...options });
        });
}

export async function runPlanTicket({
    ticket,
    prompt,
    flag: callerFlags = [],
}: PlanTicketInput): Promise<void> {
    const ticketPath = `.spec/${ticket}/ticket.md`;
    const planPath = `.spec/${ticket}/plan.md`;

    await describe(`Planning from ${ticket}`, async () => {
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
                message: prompt ?? defaultPrompt(planPath),
                flags: [
                    '--agent=po',
                    '--auto',
                    `--file=${ticketPath}`,
                    `--title=Planning from ${ticket}`,
                    ...callerFlags, // last, so they win
                ],
            });
        });

        console.info(`You should now review ${planPath}`);
    });
}

function defaultPrompt(planPath: string): string {
    return `@request-refactor-plan save it to ${planPath}, do not ask questions at this stage, make assumptions and continue.`;
}
