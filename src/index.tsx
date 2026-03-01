#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { App } from './ui/App.js';
import path from 'path';

const program = new Command();

program
  .name('gemini-wizard')
  .description('Interactive Security Policy and Sandbox Wizard')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new security policy in the current directory')
  .argument('[path]', 'Project path to initialize', '.')
  .action((projectPath) => {
    const absolutePath = path.resolve(process.cwd(), projectPath);
    render(<App projectPath={absolutePath} />);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
