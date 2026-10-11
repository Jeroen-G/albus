#!/usr/bin/env node

import { defineCli } from '@/cli/commands/main';
import { fail } from '@/cli/step';

// A command's action is a promise commander never awaits, so a rejected command
// arrives here. Without this the spinner stops and the process still exits 0.
process.on('unhandledRejection', error => {
    fail('command failed', error);
    process.exitCode = 1;
});

const cli = defineCli();

cli.parse();
