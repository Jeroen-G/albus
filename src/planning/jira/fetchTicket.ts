import { $ } from 'bun';

export type JiraKey = string;

export type JiraIssue = string;

export type TicketReference = {
    key: JiraKey;
    /**
     * Subdomain of the Atlassian site when the reference is a full URL.
     */
    site?: string;
};

type AtlassianProfile = {
    name: string;
    base_url: string;
};

const issueUrl = /^https?:\/\/([^./]+)\.atlassian\.net\/(?:[^?#]*\/)?browse\/([^/?#]+)/iu;

export function parseTicketReference(reference: string): TicketReference {
    const value = reference.trim();
    const url = value.match(issueUrl);

    if (url) {
        return { key: url[2].toUpperCase(), site: url[1] };
    }

    return { key: value.toUpperCase() };
}

export async function fetchTicket(
    reference: string,
    profile?: string
): Promise<JiraIssue | undefined> {
    const parsed = parseTicketReference(reference);
    const selectedProfile =
        profile ?? (parsed.site ? await resolveProfile(parsed.site) : undefined);

    try {
        const asText = selectedProfile
            ? await $`atlassian-cli --profile ${selectedProfile} jira issue get ${parsed.key} -f markdown`.text()
            : await $`atlassian-cli jira issue get ${parsed.key} -f markdown`.text();
        return asText satisfies JiraIssue;
    } catch (error) {
        if (error instanceof $.ShellError) {
            console.error(error.stderr.toString());
            return;
        }

        throw error;
    }
}

async function resolveProfile(site: string): Promise<string> {
    const profiles = await listProfiles();
    const match = profiles.find(profile => subdomain(profile.base_url) === site);

    return match?.name ?? site;
}

async function listProfiles(): Promise<AtlassianProfile[]> {
    const result = await $`atlassian-cli auth list -f json`.nothrow().quiet();

    if (result.exitCode !== 0) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(result.stdout.toString());

        return Array.isArray(parsed) ? (parsed as AtlassianProfile[]) : [];
    } catch {
        return [];
    }
}

function subdomain(baseUrl: string): string | undefined {
    try {
        return new URL(baseUrl).hostname.split('.')[0];
    } catch {
        return undefined;
    }
}
