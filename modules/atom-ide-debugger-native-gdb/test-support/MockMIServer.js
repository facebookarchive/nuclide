"use strict";

var _readline = _interopRequireDefault(require("readline"));

function _yargs() {
  const data = _interopRequireDefault(require("yargs"));

  _yargs = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/**
 * A simple app that pretends to be an MI server for tests
 */
const rl = _readline.default.createInterface({
  input: process.stdin,
  output: process.stdout
});

function writeResult(token, resultClass, result) {
  process.stdout.write(`${token}^${resultClass},${result}\n`);
}

const handlers = new Map([['list-features', listFeatures]]);

function listFeatures(positionals, args, token) {
  writeResult(token, 'done', 'features=["argle", "bargle", "blab"]');
}

function respondTo(line) {
  process.stderr.write(`got line ${line}`);

  const args = _yargs().default.parse(line.split(/\s+/));

  const positionals = args._;

  if (positionals.length === 0) {
    return;
  }

  const first = positionals[0].toString(); // is it an MI command with a token?

  const commandPattern = /^(\d+)-(.*)$/;
  const match = first.match(commandPattern);

  if (match == null) {
    // Untokenized commands come back as an error on the log stream
    process.stdout.write(`&"${first}\\n"\n`);
    process.stdout.write(`&"Undefined command: \\"${first}\\". Try \\"help\\"."\n`); // ... as well as returning a real error

    process.stdout.write(`^error,msg="Undefined command: \\"${first}\\". Try \\"help\\"."\n`);
    return;
  }

  const [, token, command] = match;
  const handler = handlers.get(command);

  if (handler == null) {
    writeResult(token, 'error', 'msg="Undefined command: \\"${command}\\". Try \\"help\\"."');
    return;
  }

  handler(positionals, args, token);
}

process.stderr.write('mock server running\n');
rl.on('line', line => respondTo(line)).on('close', _ => process.exit(0));