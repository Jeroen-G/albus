import { Command } from 'commander';

import { defineEnvCheck } from '@/cli/commands/env/check';
import { defineSetUp } from '@/cli/commands/env/setup';
import { defineJiraTicket } from '@/cli/commands/jira/ticket';
import { defineMacAwake } from '@/cli/commands/mac/awake';
import { defineMacNotify } from '@/cli/commands/mac/notify';

import packageJson from '../../../package.json';

import { definePlanTest } from './plan/test';
import { definePlanTicket } from './plan/ticket';
import { definePlanTranslate } from './plan/translate';

export function defineCli() {
    const program = new Command()
        .name('albus')
        .description('Albus agent')
        .version(packageJson.version);

    defineJiraTicket(program);
    defineEnvCheck(program);
    defineSetUp(program);
    definePlanTicket(program);
    definePlanTest(program);
    definePlanTranslate(program);
    defineMacAwake(program);
    defineMacNotify(program);

    return program;
}
