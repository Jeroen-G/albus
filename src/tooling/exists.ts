import { $ } from 'bun';

export async function cliExists(cli: string): Promise<boolean> {
    const { exitCode } = await $`hash ${cli} 2>/dev/null || exit 1;`.nothrow().quiet();
    return exitCode === 0;
}

export async function cliExistsWithVersion(cli: string, version: string): Promise<boolean> {
    return (await cliExists(cli)) && (await $`${cli} --version`.text()).includes(version);
}

export async function fileExists(filename: string): Promise<boolean> {
    const file = Bun.file(filename);
    return file.exists();
}

export async function fileHasContent(filename: string): Promise<boolean> {
    const file = Bun.file(filename);
    return (await file.exists()) && file.size > 0;
}
