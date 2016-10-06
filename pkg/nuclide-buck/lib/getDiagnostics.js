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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var DIAGNOSTIC_REGEX = /^([^\s:]+):([0-9]+):[0-9]+: (.*)$/gm;

/**
 * Consumes Buck console output and emits a set of file-level diagnostic messages.
 * Ideally Buck should do this for us, but let's parse the messages manually for now.
 * This only (officially) handles Clang/g++ output.
 */
exports.default = _asyncToGenerator(function* (message, level, root) {
  // Only fetch the file system service if we need it.
  var fileSystemService = undefined;
  // Global regexps need to be reset before use.
  DIAGNOSTIC_REGEX.lastIndex = 0;
  // Collect promises and check all matches at once.
  var promises = [];
  var match = undefined;

  var _loop = function () {
    var _match = match;

    var _match2 = _slicedToArray(_match, 4);

    var file = _match2[1];
    var strLine = _match2[2];
    var text = _match2[3];

    if (fileSystemService == null) {
      fileSystemService = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(root);
    }
    if (fileSystemService != null) {
      (function () {
        var filePath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(root, file);
        var localPath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.getPath(filePath);
        promises.push(fileSystemService.exists(localPath).then(function (exists) {
          if (!exists) {
            return null;
          }
          var line = parseInt(strLine, 10);
          return !exists ? null : {
            scope: 'file',
            providerName: 'Buck',
            type: level === 'error' ? 'Error' : 'Warning',
            filePath: filePath,
            text: text,
            range: new (_atom2 || _atom()).Range([line - 1, 0], [line, 0])
          };
        },
        // Silently ignore files resulting in an error.
        function () {
          return null;
        }));
      })();
    }
  };

  while (match = DIAGNOSTIC_REGEX.exec(message)) {
    _loop();
  }
  var diagnostics = yield Promise.all(promises);
  return diagnostics.filter(Boolean);
});
module.exports = exports.default;