import { $ } from 'bun';

export type JiraKey = string;

export type JiraIssue = string;

export async function fetchTicket(jiraKey: JiraKey): Promise<JiraIssue | undefined> {
    try {
        const asText = await $`atlassian-cli jira issue get ${jiraKey} -f markdown`.text();
        return asText satisfies JiraIssue;
    } catch (error) {
        if (error instanceof $.ShellError) {
            console.error(error.stderr.toString());
            return;
        }

        throw error;
    }
}
