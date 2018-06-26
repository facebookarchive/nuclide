'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../../nuclide-commons/process');
}

var _os = _interopRequireDefault(require('os'));

var _fs2;

function _load_fs() {
  return _fs2 = _interopRequireDefault(require('../common/fs'));
}

var _BigDigServer;

function _load_BigDigServer() {
  return _BigDigServer = require('./BigDigServer');
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
 *  strict-local
 * @format
 */

function main() {
  // launchServer should only be spawned from ./main.js.
  if (process.send == null) {
    // eslint-disable-next-line no-console
    console.error('Error: launchServer should only be spawned via parseArgsAndRunMain.');
    process.exit(1);
  }

  process.on('message', params => {
    handleLaunchParams(params).catch(error => {
      (_log4js || _load_log4js()).default.getLogger().fatal('launchServer failed:', error);
      (_log4js || _load_log4js()).default.shutdown(() => process.exit(1));
    });
  });
}

async function handleLaunchParams(params) {
  if (params.exclusive != null) {
    await enforceExclusive(params.exclusive);
  }

  const server = await (_BigDigServer || _load_BigDigServer()).BigDigServer.createServer({
    ports: params.ports,
    webServer: {
      key: params.key,
      cert: params.cert,
      ca: params.ca
    },
    absolutePathToServerMain: params.absolutePathToServerMain,
    serverParams: params.serverParams
  });

  const port = server.getPort();

  if (!(process.send != null)) {
    throw new Error('Invariant violation: "process.send != null"');
  }

  process.send({ port }, () => {
    if (!process.disconnect) {
      throw new Error('Invariant violation: "process.disconnect"');
    }

    process.disconnect();
  });

  // Exit once the certificates expire, as no clients will be able to connect at this point.
  setTimeout(() => {
    (_log4js || _load_log4js()).default.getLogger().info(`Certificates expired after ${params.expirationDays} days, shutting down.`);
    process.exit(2);
  }, params.expirationDays * 24 * 60 * 60 * 1000);
}

// When an 'exclusive' parameter is provided, we'll ensure that only one server
// with a given "exclusive" tag is alive at any given time (per user).
// We do this by storing a .bigdig.exclusive.pid file in sharedCertsDir:
// if the file already exists, we'll try to kill the PID in that file.
async function enforceExclusive(exclusive) {
  const bigDigPath = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.homedir(), '.big-dig');
  try {
    await (_fs2 || _load_fs()).default.mkdir(bigDigPath);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  const pidFile = (_nuclideUri || _load_nuclideUri()).default.join(bigDigPath, `.big-dig.${exclusive}.pid`);

  while (true) {
    try {
      const c = _fs.default.constants;
      // O_CREAT / O_EXCL atomically creates the PID file.
      // Ideally we'd use fcntl/flock to hold onto the PID file until exit,
      // but sadly there's no easy flock API in Node.
      const handle = _fs.default.openSync(pidFile,
      // eslint-disable-next-line no-bitwise
      c.O_WRONLY | c.O_CREAT | c.O_EXCL,
      // Readable only for the current user.
      0o600);
      (_log4js || _load_log4js()).default.getLogger().info(`Writing pid=${process.pid} to ${pidFile}`);
      // $FlowFixMe: writeFileSync takes handles too.
      _fs.default.writeFileSync(handle, process.pid);
      _fs.default.closeSync(handle);
      break;
    } catch (error) {
      if (error.code === 'EEXIST') {
        // Note: the read, kill, and unlink steps could all throw.
        // However, an exception at any of those steps probably indicates a race,
        // in which case we should probably bail out anyway.
        const pidContents = _fs.default.readFileSync(pidFile, 'utf8');
        const pid = parseInt(pidContents, 10);
        if (pid > 0) {
          (_log4js || _load_log4js()).default.getLogger().info(`Killing existing server with pid=${pid}`);
          // Node doesn't have any flock() style primitives, so we can't be certain
          // that this pid still corresponds to the process.
          // As a quick sanity check, we'll inspect the pstree to see that it's consistent.
          // eslint-disable-next-line no-await-in-loop
          const processTree = await (0, (_process || _load_process()).psTree)();
          const processInfo = processTree.find(proc => proc.pid === pid);
          if (processInfo != null && processInfo.commandWithArgs.includes('launchServer')) {
            process.kill(pid);
          }
        }
        _fs.default.unlinkSync(pidFile);
      } else {
        throw error;
      }
    }
  }

  // Attempt to clean up the pid file on graceful exits.
  process.on('exit', () => {
    _fs.default.unlinkSync(pidFile);
  });
}

(_log4js || _load_log4js()).default.configure({
  appenders: [{
    type: 'file',
    filename: (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), 'big-dig.log')
  }, {
    type: 'stderr'
  }]
});

process.on('unhandledRejection', error => {
  (_log4js || _load_log4js()).default.getLogger().error('Unhandled rejection:', error);
});

process.on('uncaughtException', error => {
  (_log4js || _load_log4js()).default.getLogger().fatal('Uncaught exception:', error);
  (_log4js || _load_log4js()).default.shutdown(() => process.abort());
});

main();