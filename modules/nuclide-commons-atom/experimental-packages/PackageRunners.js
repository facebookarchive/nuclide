"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AtomPackageRunner = exports.ProcessPackageRunner = void 0;

function _process() {
  const data = require("../../nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _MessageRouter() {
  const data = _interopRequireDefault(require("./MessageRouter"));

  _MessageRouter = function () {
    return data;
  };

  return data;
}

function _activatePackage() {
  const data = _interopRequireDefault(require("./activatePackage"));

  _activatePackage = function () {
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
class ProcessPackageRunner {
  constructor(packages, messageRouter) {
    this._disposed = new _RxMin.ReplaySubject(1);
    this._processStream = (0, _process().fork)(require.resolve("./run-package-entry.js"), [], {
      silent: true
    }).takeUntil(this._disposed).do(proc => {
      proc.on('message', msg => {
        messageRouter.send(msg);
      });
      const exposedSockets = getExposedSockets(packages, messageRouter);
      proc.send({
        packages,
        exposedSockets
      });
      exposedSockets.forEach(socket => {
        // Intercept incoming messages for each exposed socket.
        messageRouter.getMessages(messageRouter.reverseSocket(socket)).takeUntil(this._disposed).subscribe(msg => proc.send(msg));
      });
    }) // TODO: Error on early completion.
    .share().publishReplay(1); // Note: this won't start emitting anything activate() gets called.

    this._outputStream = this._processStream.switchMap(proc => (0, _process().getOutputStream)(proc)).publish();
  }

  activate() {
    this._processStream.connect();
  }

  onDidError(callback) {
    return new (_UniversalDisposable().default)(this._outputStream.refCount().subscribe({
      error: err => {
        callback(err);
      }
    }));
  }

  dispose() {
    this._disposed.next();
  }

} // Atom packages have to run in the same process.


exports.ProcessPackageRunner = ProcessPackageRunner;

class AtomPackageRunner {
  constructor(packages, messageRouter) {
    this._packages = packages;
    this._messageRouter = messageRouter;
    this._disposables = new (_UniversalDisposable().default)();
  }

  activate() {
    this._disposables.add(...this._packages.map(params => {
      const pkg = (0, _activatePackage().default)(params, this._messageRouter);
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
    return new (_UniversalDisposable().default)();
  }

}

exports.AtomPackageRunner = AtomPackageRunner;

function getExposedSockets(packages, messageRouter) {
  // Exposed sockets are those that are either:
  // 1) provided here but not consumed
  // 2) consumed here but not provided.
  const allSockets = new Set();
  packages.forEach(pkg => {
    Object.keys(pkg.consumedServices).forEach(key => {
      const {
        socket
      } = pkg.consumedServices[key];
      allSockets.add(socket);
    });
    Object.keys(pkg.providedServices).forEach(key => {
      pkg.providedServices[key].rawConnections.forEach(({
        socket
      }) => {
        allSockets.add(socket);
      });
    });
  });
  return Array.from(allSockets).filter(socket => !allSockets.has(messageRouter.reverseSocket(socket)));
}