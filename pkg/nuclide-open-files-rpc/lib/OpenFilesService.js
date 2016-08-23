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

var initialize = _asyncToGenerator(function* () {
  fileCache.dispose();
  return new FileNotifier();
});

exports.initialize = initialize;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _FileCache2;

function _FileCache() {
  return _FileCache2 = require('./FileCache');
}

var fileCache = new (_FileCache2 || _FileCache()).FileCache();

exports.fileCache = fileCache;

var FileNotifier = (function () {
  function FileNotifier() {
    _classCallCheck(this, FileNotifier);
  }

  _createClass(FileNotifier, [{
    key: 'onEvent',
    value: _asyncToGenerator(function* (event) {
      fileCache.onEvent(event);
    })
  }, {
    key: 'dispose',
    value: function dispose() {
      fileCache.dispose();
    }
  }]);

  return FileNotifier;
})();

exports.FileNotifier = FileNotifier;