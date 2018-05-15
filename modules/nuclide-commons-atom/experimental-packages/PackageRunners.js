'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.AtomPackageRunner = exports.ProcessPackageRunner = undefined;var _process;




















function _load_process() {return _process = require('../../nuclide-commons/process');}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../nuclide-commons/UniversalDisposable'));}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _MessageRouter;
function _load_MessageRouter() {return _MessageRouter = _interopRequireDefault(require('./MessageRouter'));}var _activatePackage;
function _load_activatePackage() {return _activatePackage = _interopRequireDefault(require('./activatePackage'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                 * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                 * All rights reserved.
                                                                                                                                                                                                                 *
                                                                                                                                                                                                                 * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                 * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                 * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                 *
                                                                                                                                                                                                                 * 
                                                                                                                                                                                                                 * @format
                                                                                                                                                                                                                 */class ProcessPackageRunner {constructor(packages, messageRouter) {this._disposed = new _rxjsBundlesRxMinJs.ReplaySubject(1);
    this._processStream = (0, (_process || _load_process()).fork)(require.resolve('./run-package-entry.js'), [], {
      silent: true }).

    takeUntil(this._disposed).
    do(proc => {
      proc.on('message', msg => {
        messageRouter.send(msg);
      });
      const exposedSockets = getExposedSockets(packages, messageRouter);
      proc.send({ packages, exposedSockets });
      exposedSockets.forEach(socket => {
        // Intercept incoming messages for each exposed socket.
        messageRouter.
        getMessages(messageRouter.reverseSocket(socket)).
        takeUntil(this._disposed).
        subscribe(msg => proc.send(msg));
      });
    })
    // TODO: Error on early completion.
    .share().
    publishReplay(1);

    // Note: this won't start emitting anything activate() gets called.
    this._outputStream = this._processStream.
    switchMap(proc => (0, (_process || _load_process()).getOutputStream)(proc)).
    publish();
  }

  activate() {
    this._processStream.connect();
  }

  onDidError(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(
    this._outputStream.refCount().subscribe({
      error: err => {
        callback(err);
      } }));


  }

  dispose() {
    this._disposed.next();
  }}exports.ProcessPackageRunner = ProcessPackageRunner;


// Atom packages have to run in the same process.
class AtomPackageRunner {




  constructor(
  packages,
  messageRouter)
  {
    this._packages = packages;
    this._messageRouter = messageRouter;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  activate() {
    this._disposables.add(
    ...this._packages.map(params => {
      const pkg = (0, (_activatePackage || _load_activatePackage()).default)(params, this._messageRouter);
      return () => {
        if (pkg.dispose != null) {
          pkg.dispose();
        }
      };
    }));

  }

  dispose() {
    this._disposables.dispose();
  }

  onDidError(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }}exports.AtomPackageRunner = AtomPackageRunner;


function getExposedSockets(
packages,
messageRouter)
{
  // Exposed sockets are those that are either:
  // 1) provided here but not consumed
  // 2) consumed here but not provided.
  const allSockets = new Set();
  packages.forEach(pkg => {
    Object.keys(pkg.consumedServices).forEach(key => {
      const { socket } = pkg.consumedServices[key];
      allSockets.add(socket);
    });
    Object.keys(pkg.providedServices).forEach(key => {
      pkg.providedServices[key].rawConnections.forEach(({ socket }) => {
        allSockets.add(socket);
      });
    });
  });
  return Array.from(allSockets).filter(
  socket => !allSockets.has(messageRouter.reverseSocket(socket)));

}