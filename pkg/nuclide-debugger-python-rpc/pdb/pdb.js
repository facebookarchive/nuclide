'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rxjs';
import type {DebuggerEvent} from '../debugger/types';

import {DebuggerCommander} from '../debugger/DebuggerCommander';
import {launchDebugger} from '../debugger/debugger';
import readline from 'readline';
import yargs from 'yargs';

export default function main(args: Array<string>) {
  const argv = yargs
    .usage('Python command-line debugger in JavaScript.\nUsage: $0 <file-to-run.py> <arg1> <arg2>')
    .help('help')
    .alias('h', 'help')
    .demand(1, 'Must specify a Python file')
    .parse(args);

  const commander = new DebuggerCommander();
  const observable = launchDebugger(
    commander.asObservable(),
    /* initialBreakpoints */ [],
    /* pathToPythonExecutable */ 'python',
    /* pythonArgs */ argv._,
  );

  interact(observable, commander);
}

/* eslint-disable no-console */
function interact(observable: Observable<DebuggerEvent>, commander: DebuggerCommander) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function ask() {
    rl.question('> ', answer => {
      // See https://docs.python.org/2/library/pdb.html for the full set of pdb commands.
      // TODO(mbolin): Support break, clear, and jump, all of which take arguments.
      switch (answer) {
        case 'c':
        case 'cont':
        case 'continue':
          commander.continue();
          break;
        case 'h':
        case 'help':
          console.error('Available commands: c h n q r s');
          ask();
          break;
        case 'n':
        case 'next':
          commander.next();
          break;
        case 'q':
        case 'quit':
          commander.quit();
          break;
        case 'r':
        case 'return':
          commander.return();
          break;
        case 's':
        case 'step':
          commander.step();
          break;
        default:
          console.error(`Unrecognized command: ${answer}`);
          ask();
      }
    });
  }

  observable.subscribe({
    next(message) {
      if (message.event === 'start') {
        // Give the user a chance to set breakpoints before starting the program.
        console.log('Program started. Type \'c\' to continue or \'s\' to start stepping.');
        ask();
      } else if (message.event === 'stop') {
        const {file, line} = message;
        console.log(`Stopped at: ${file}:${line}`);
        ask();
      }
    },
    error(error) {
      console.error('ERROR:', error);
    },
    complete() {
      rl.close();
    },
  });
}
/* eslint-enable no-console */
