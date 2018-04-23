'use strict';var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));























/*
                                                                                             * CLI for printing information about the Atom clients connected to the Nuclide
                                                                                             * server running on this machine. By default, it lists the remote root folders
                                                                                             * in the Atom clients that correspond to this host. The list is written to
                                                                                             * stdout as JSON.
                                                                                             */ /**
                                                                                                 * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                 * All rights reserved.
                                                                                                 *
                                                                                                 * This source code is licensed under the license found in the LICENSE file in
                                                                                                 * the root directory of this source tree.
                                                                                                 *
                                                                                                 * 
                                                                                                 * @format
                                                                                                 */let main = (() => {var _ref = (0, _asyncToGenerator.default)(function* (argv) {(0, (_errors || _load_errors()).setupLogging)();(0, (_errors || _load_errors()).setupErrorHandling)(); // Connect to the Nuclide server running on this host, if it exists.
    let commands = null;try {commands = argv.port != null ?
      yield (0, (_CommandClient || _load_CommandClient()).startCommands)(argv.port, argv.family) :
      yield (0, (_CommandClient || _load_CommandClient()).getCommands)();
    } catch (e) {
      // Only a FailedConnectionError is expected.
      if (!(e instanceof (_errors || _load_errors()).FailedConnectionError)) {
        return (_errors || _load_errors()).EXIT_CODE_CONNECTION_ERROR;
      }
    }

    let foldersArray;
    if (commands == null) {
      // If commands is null, then there is no Nuclide server running.
      // We should print an empty array without any ceremony in this case.
      foldersArray = [];
    } else {
      const hostname = _os.default.hostname();
      const isAliasForHostname = (() => {var _ref2 = (0, _asyncToGenerator.default)(function* (alias) {
          if (hostname === alias) {
            return true;
          } else {
            return (yield resolveAlias(alias)) === hostname;
          }
        });return function isAliasForHostname(_x2) {return _ref2.apply(this, arguments);};})();

      // Note that each ClientConnection represents an Atom window, so
      // the rootFolders across windows may overlap. Add all of them to
      // a Set to de-dupe.
      const connections = yield commands.getClientConnections();
      const rootFolders = new Set();
      for (const connection of connections) {
        for (const rootFolder of connection.rootFolders) {
          if ((_nuclideUri || _load_nuclideUri()).default.isRemote(rootFolder)) {
            const alias = (_nuclideUri || _load_nuclideUri()).default.getHostname(rootFolder);
            // eslint-disable-next-line no-await-in-loop
            if (yield isAliasForHostname(alias)) {
              const path = (_nuclideUri || _load_nuclideUri()).default.getPath(rootFolder);
              rootFolders.add(path);
            }
          }
        }
      }
      foldersArray = Array.from(rootFolders);
    }

    foldersArray.sort();
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(foldersArray, null, 2));
    return (_errors || _load_errors()).EXIT_CODE_SUCCESS;
  });return function main(_x) {return _ref.apply(this, arguments);};})();let resolveAlias = (() => {var _ref3 = (0, _asyncToGenerator.default)(

  function* (alias) {
    let stdout;
    try {
      stdout = yield (0, (_process || _load_process()).runCommand)('dig', ['+short', 'cname', alias]).toPromise();
    } catch (e) {
      // Defend against the case where `dig` is not installed.
      return null;
    }

    // Strip trailing newline. It is possible there was no output
    // if there was nothing to resolve, e.g.: dig +short cname `hostname`.
    stdout = stdout.trim();
    if (stdout === '') {
      return null;
    }

    // The result likely includes '.' at the end to indicate the
    // result is a fully-qualified domain name. If so, we strip it
    // so it can be compared directly with hostname(1).
    if (stdout.endsWith('.')) {
      stdout = stdout.slice(0, -1);
    }

    return stdout;
  });return function resolveAlias(_x3) {return _ref3.apply(this, arguments);};})();let run = (() => {var _ref4 = (0, _asyncToGenerator.default)(

  function* () {
    const { argv } = (_yargs || _load_yargs()).default.
    usage('Usage: nuclide-connections').
    help('h').
    alias('h', 'help').
    option('p', {
      alias: 'port',
      describe: 'Port for connecting to nuclide',
      type: 'number' }).

    option('f', {
      alias: 'family',
      describe:
      'Address family for connecting to nuclide. Either "IPv4" or "IPv6".',
      type: 'string' });


    const exitCode = yield main(argv);
    process.exit(exitCode);
  });return function run() {return _ref4.apply(this, arguments);};})();var _nuclideUri;function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));}var _process;function _load_process() {return _process = require('nuclide-commons/process');}var _os = _interopRequireDefault(require('os'));var _yargs;function _load_yargs() {return _yargs = _interopRequireDefault(require('yargs'));}var _CommandClient;function _load_CommandClient() {return _CommandClient = require('./CommandClient');}var _errors;function _load_errors() {return _errors = require('./errors');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

run();