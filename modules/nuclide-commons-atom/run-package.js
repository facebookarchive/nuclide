'use strict';var _log4js;















function _load_log4js() {return _log4js = _interopRequireDefault(require('log4js'));}var _ExperimentalMessageRouter;
function _load_ExperimentalMessageRouter() {return _ExperimentalMessageRouter = _interopRequireDefault(require('./ExperimentalMessageRouter'));}var _ExperimentalPackage;
function _load_ExperimentalPackage() {return _ExperimentalPackage = require('./ExperimentalPackage');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}






// Send log4js errors to stderr for visibility from the main process.
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
 */(_log4js || _load_log4js()).default.configure({ appenders: [{ type: 'stderr' }] });const logger = (_log4js || _load_log4js()).default.getLogger('experimental-run-package');process.on('uncaughtException', err => {logger.fatal('Uncaught exception:', err);(_log4js || _load_log4js()).default.shutdown(() => process.abort());});process.on('unhandledRejection', err => {
  logger.warn('Unhandled rejection', err);
});

// Properly terminate if the parent server crashes.
process.on('disconnect', () => {
  process.exit();
});

process.once('message', ({ packages, exposedSockets }) => {
  const messageRouter = new (_ExperimentalMessageRouter || _load_ExperimentalMessageRouter()).default();

  // Route incoming IPC messages into the message router.
  process.on('message', message => {
    messageRouter.send(message);
  });

  // Messages to external sockets need to go over IPC.
  exposedSockets.forEach(socket => {
    messageRouter.
    getMessages(socket).
    mergeMap(
    message =>
    new Promise(resolve => {if (!(
      process.send != null)) {throw new Error('Invariant violation: "process.send != null"');}
      process.send(message, resolve);
    }),
    /* Set concurrency to 1 to avoid blocking IPC. */1).

    subscribe();
  });

  // Create connections for each provided service.
  const activatedPackages = packages.map(pkg => {
    return (0, (_ExperimentalPackage || _load_ExperimentalPackage()).activateExperimentalPackage)(pkg, messageRouter);
    // ??? Maybe there should be an explicit signal or shutdown message via IPC.
  });

  process.on('exit', () => {
    activatedPackages.forEach(pkg => {
      if (pkg.dispose != null) {
        pkg.dispose();
      }
    });
  });
});