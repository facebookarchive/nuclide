'use strict';

var _yargs;

function _load_yargs() {
  return _yargs = _interopRequireDefault(require('yargs'));
}

var _client;

function _load_client() {
  return _client = _interopRequireDefault(require('./client'));
}

var _startServer;

function _load_startServer() {
  return _startServer = _interopRequireDefault(require('./server/startServer'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { argv } = (_yargs || _load_yargs()).default.usage('Usage: $0 <command> <file>\n\n' + '    [-h | --help]\n' + '    [-c | --config] {configPath}\n' + '    [-t | --text] {textBuffer}\n' + '    [-f | --file] {filePath}\n' + '    [-s | --schema] {schemaPath}').help('h').alias('h', 'help').demand(1, 'At least one command is required.\n' + 'Commands: "server, lint, autocomplete, outline"\n').option('c', {
  alias: 'config',
  describe: 'GraphQL Config file path (.graphqlrc).\n' + 'Will look for the nearest .graphqlrc file if omitted.\n',
  type: 'string'
}).option('t', {
  alias: 'text',
  describe: 'Text buffer to perform GraphQL lint on.\n' + 'Will defer to --file option if omitted.\n' + 'This option is always honored over --file option.\n',
  type: 'string'
}).option('f', {
  alias: 'file',
  describe: 'File path to perform GraphQL lint on.\n' + 'Will be ignored if --text option is supplied.\n',
  type: 'string'
}).option('s', {
  alias: 'schema',
  describe: 'a path to schema DSL file\n',
  type: 'string'
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     */

const command = argv._.pop();

switch (command) {
  case 'server':
    (0, (_startServer || _load_startServer()).default)(argv.config.trim());
    break;
  default:
    (0, (_client || _load_client()).default)(command, argv);
    break;
}

// Exit the process when stream closes from remote end.
process.stdin.on('close', () => {
  process.exit(0);
});