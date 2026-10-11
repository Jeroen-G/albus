import { Command } from 'commander';

import { runPlanTranslate } from '@/cli/commands/plan/translate';
import { describe, step } from '@/cli/step';
import { fetchTicket, JiraIssue, JiraKey } from '@/planning/jira/fetchTicket';

const INSTRUCTION = 'Remove the field->value table underneath the title.';

export function defineJiraTicket(program: Command) {
    program
        .command('jira:ticket')
        .description('Get a ticket from Jira')
        .argument('ticket', 'Ticket number')
        .action(runJiraTicket);
}

export async function runJiraTicket(ticketNumber: JiraKey) {
    let item: JiraIssue | undefined = undefined;
    const markdownPath = `.spec/${ticketNumber}/ticket.md`;
    let content: string = '';

    await describe(`Jira ticket ${ticketNumber}`, async () => {
        await step('fetching ticket', async () => {
            item = await fetchTicket(ticketNumber);
            if (!item) {
                return false;
            }
        });

        await step('parsing description', () => {
            if (!item) {
                throw new Error('missing Jira content');
            }

            content = item;
        });

        await step('saving ticket', async () => {
            const file = Bun.file(markdownPath);
            await file.write(content);
        });

        await step('translating ticket into English', async () => {
            await runPlanTranslate({ path: markdownPath, instruction: INSTRUCTION });
        });

        console.info(`You should now review ${markdownPath}`);
    });
}
