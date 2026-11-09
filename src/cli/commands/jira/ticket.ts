import { Command } from 'commander';

import { runPlanTranslate } from '@/cli/commands/plan/translate';
import { describe, step } from '@/cli/step';
import { fetchTicket, JiraIssue, parseTicketReference } from '@/planning/jira/fetchTicket';

const INSTRUCTION = 'Remove the field->value table underneath the title.';

type JiraTicketOptions = {
    profile?: string;
};

export function defineJiraTicket(program: Command) {
    program
        .command('jira:ticket')
        .description('Get a ticket from Jira')
        .argument('ticket', 'Ticket number or URL')
        .option('--profile <profile>', 'Atlassian CLI profile to use, overriding the URL')
        .action(async (ticket: string, options: JiraTicketOptions) => {
            await runJiraTicket(ticket, options.profile);
        });
}

export async function runJiraTicket(ticketReference: string, profile?: string) {
    let item: JiraIssue | undefined = undefined;
    const { key: ticketNumber } = parseTicketReference(ticketReference);
    const markdownPath = `.spec/${ticketNumber}/ticket.md`;
    let content: string = '';

    await describe(`Jira ticket ${ticketNumber}`, async () => {
        await step('fetching ticket', async () => {
            item = await fetchTicket(ticketReference, profile);
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
