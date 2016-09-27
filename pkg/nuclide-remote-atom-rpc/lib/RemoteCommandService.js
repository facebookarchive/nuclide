Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var _CommandServer2;

function _CommandServer() {
  return _CommandServer2 = require('./CommandServer');
}

// This interface is exposed by the nuclide server process to the client side
// Atom process.

var RemoteCommandService = (function () {
  function RemoteCommandService(port) {
    _classCallCheck(this, RemoteCommandService);

    this._port = port;
    this._disposables = new (_eventKit2 || _eventKit()).CompositeDisposable();
  }

  _createClass(RemoteCommandService, [{
    key: '_registerAtomCommands',
    value: _asyncToGenerator(function* (atomCommands) {
      this._disposables.add((yield (_CommandServer2 || _CommandServer()).CommandServer.create(this._port, atomCommands)));
    })
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }

    // Called by Atom once for each new remote connection.
  }], [{
    key: 'registerAtomCommands',
    value: _asyncToGenerator(function* (port, atomCommands) {
      var result = new RemoteCommandService(port);
      yield result._registerAtomCommands(atomCommands);
      return result;
    })
  }]);

  return RemoteCommandService;
})();

exports.RemoteCommandService = RemoteCommandService;