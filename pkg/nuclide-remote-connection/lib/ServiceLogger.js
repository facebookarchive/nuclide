Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeCircularBuffer2;

function _commonsNodeCircularBuffer() {
  return _commonsNodeCircularBuffer2 = _interopRequireDefault(require('../../commons-node/CircularBuffer'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var NEW_ITEM_EVENT = 'NEW_ITEM_EVENT';

var ServiceLogger = (function () {
  function ServiceLogger() {
    _classCallCheck(this, ServiceLogger);

    this._buffer = new (_commonsNodeCircularBuffer2 || _commonsNodeCircularBuffer()).default(10000);
    this._emitter = new (_atom2 || _atom()).Emitter();
  }

  /**
   * THIS IS A HACK.
   *
   * Takes the info for a service call and returns a string description of the relevant arguments.
   *
   * For now, we centralize some logic about how particular service calls should be formatted for
   * display in log messages and the Nuclide Service Monitor. Rather than annotate which arguments
   * in a service call should be included in the serialized version of the args (that are used for
   * debugging), we take a shortcut and just hardcode the logic for each service call of interest,
   * for now. It's not smart to choose a naive heuristic like "log all string arguments" because
   * services such as Flow take the unsaved file contents as an argument, which would clutter our
   * logs.
   */

  _createClass(ServiceLogger, [{
    key: 'logServiceCall',
    value: function logServiceCall(service, method, isLocal) {
      for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        args[_key - 3] = arguments[_key];
      }

      var item = {
        date: new Date(),
        service: service,
        method: method,
        isLocal: isLocal,
        args: args,
        argInfo: createArgInfo(service, method, args)
      };
      this._buffer.push(item);
      this._emitter.emit(NEW_ITEM_EVENT, item);
    }

    // $FlowIssue: t6187050
  }, {
    key: Symbol.iterator,
    value: function value() {
      return this._buffer[Symbol.iterator]();
    }
  }, {
    key: 'onNewItem',
    value: function onNewItem(callback) {
      return this._emitter.on(NEW_ITEM_EVENT, callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._emitter.dispose();
    }
  }]);

  return ServiceLogger;
})();

exports.default = ServiceLogger;
function createArgInfo(service, method, args) {
  if (service === 'ArcanistBaseService') {
    // All Arcanist services take a file.
    return (/* fileName */args[0]
    );
  } else if (service === 'BuckUtils') {
    if (method === 'getBuckProjectRoot') {
      return (/* fileName */args[0]
      );
    }
  } else if (service === 'FlowService') {
    if (method === 'findDefinition') {
      return (/* fileName */args[0]
      );
    } else if (method === 'findDiagnostics') {
      return (/* fileName */args[0]
      );
    } else if (method === 'getType') {
      return (/* fileName */args[0]
      );
    } else if (method === 'getAutocompleteSuggestions') {
      return (/* fileName */args[0]
      );
    }
  } else if (service === 'HgService') {
    if (method === 'fetchDiffInfo') {
      return (/* fileName */args[0]
      );
    } else if (method === 'fetchStatuses') {
      var filePaths = args[0];
      return filePaths.join(';');
    }
  }
  return null;
}
module.exports = exports.default;