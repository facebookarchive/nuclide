'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;

var _DebuggerCommander;

function _load_DebuggerCommander() {
  return _DebuggerCommander = require('../debugger/DebuggerCommander');
}

var _debugger;

function _load_debugger() {
  return _debugger = require('../debugger/debugger');
}

var _readline = _interopRequireDefault(require('readline'));

var _yargs;

function _load_yargs() {
  return _yargs = _interopRequireDefault(require('yargs'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function main(args) {
  const argv = (_yargs || _load_yargs()).default.usage('Python command-line debugger in JavaScript.\nUsage: $0 <file-to-run.py> <arg1> <arg2>').help('help').alias('h', 'help').demand(1, 'Must specify a Python file').parse(args);

  const commander = new (_DebuggerCommander || _load_DebuggerCommander()).DebuggerCommander();
  const observable = (0, (_debugger || _load_debugger()).launchDebugger)(commander.asObservable(),
  /* initialBreakpoints */[],
  /* pathToPythonExecutable */'python',
  /* pythonArgs */argv._);

  interact(observable, commander);
}

/* eslint-disable no-console */
function interact(observable, commander) {
  const rl = _readline.default.createInterface({
    input: process.stdin,
    output: process.stdout
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
        const { file, line } = message;
        console.log(`Stopped at: ${file}:${line}`);
        ask();
      }
    },
    error(error) {
      console.error('ERROR:', error);
    },
    complete() {
      rl.close();
    }
  });
}
/* eslint-enable no-console */