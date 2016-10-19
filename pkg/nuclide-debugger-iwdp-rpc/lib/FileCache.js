Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var createFileData = _asyncToGenerator(function* (url) {
  // Handle the bundle file.
  log('FileCache got url: ' + url.toString());
  var fileResponse = yield (0, (_commonsNodeXfetch || _load_commonsNodeXfetch()).default)(url.toString(), {});
  var basename = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(url.pathname);

  var _ref = yield Promise.all([fileResponse.text(), (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.tempfile({ prefix: basename, suffix: '.js' })]);

  var _ref2 = _slicedToArray(_ref, 2);

  var fileText = _ref2[0];
  var filePath = _ref2[1];

  yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.writeFile(filePath, fileText);
  var fileSystemUrl = 'file://' + filePath;

  var matches = SOURCE_MAP_REGEX.exec(fileText);
  if (matches == null) {
    return {
      filePath: fileSystemUrl,
      url: url.toString()
    };
  }

  // Handle source maps for the bundle.
  var sourceMapUrl = '' + url.origin + matches[1];
  var sourceMapResponse = yield (0, (_commonsNodeXfetch || _load_commonsNodeXfetch()).default)(sourceMapUrl, {});
  var sourceMap = yield sourceMapResponse.text();
  var base64SourceMap = new Buffer(sourceMap).toString('base64');
  return {
    filePath: fileSystemUrl,
    url: url.toString(),
    sourceMapUrl: '' + SOURCE_MAP_PREFIX + base64SourceMap
  };
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeXfetch;

function _load_commonsNodeXfetch() {
  return _commonsNodeXfetch = _interopRequireDefault(require('../../commons-node/xfetch'));
}

var _commonsNodeFsPromise;

function _load_commonsNodeFsPromise() {
  return _commonsNodeFsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _logger;

function _load_logger() {
  return _logger = require('./logger');
}

var log = (_logger || _load_logger()).logger.log;

// Url that chrome devtools understands and can decode to get source maps.

var SOURCE_MAP_REGEX = /\/\/# sourceMappingURL=(.+)$/;
var SOURCE_MAP_PREFIX = 'data:application/json;base64,';

var FileCache = (function () {
  function FileCache() {
    var _this = this;

    _classCallCheck(this, FileCache);

    this._filePathToFileData = new Map();
    this._urlToFileData = new Map();
    this._disposables = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(function () {
      return _this._filePathToFileData.clear();
    }, function () {
      return _this._urlToFileData.clear();
    });
  }

  _createClass(FileCache, [{
    key: 'handleScriptParsed',
    value: _asyncToGenerator(function* (obj) {
      var params = obj.params;

      if (params == null) {
        return obj;
      }
      var urlString = params.url;

      if (urlString == null || urlString === '') {
        return obj;
      }
      var url = new URL(urlString);
      if (url.protocol !== 'http:') {
        return obj;
      }
      var fileData = this._urlToFileData.get(urlString);
      if (fileData != null) {
        updateMessageObjWithFileData(obj, fileData);
        return obj;
      }
      var newFileData = yield createFileData(url);
      this._urlToFileData.set(newFileData.url, newFileData);
      this._filePathToFileData.set(newFileData.filePath, newFileData);
      updateMessageObjWithFileData(obj, newFileData);
      return obj;
    })
  }, {
    key: 'handleSetBreakpointByUrl',
    value: function handleSetBreakpointByUrl(obj) {
      var filePath = obj.params.url;
      var fileData = this._filePathToFileData.get(filePath);
      if (fileData == null) {
        return obj;
      }
      obj.params.url = fileData.url;
      return obj;
    }
  }, {
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      this._disposables.dispose();
    })
  }]);

  return FileCache;
})();

exports.FileCache = FileCache;

function updateMessageObjWithFileData(obj, fileData) {
  obj.params.url = fileData.filePath;
  obj.params.sourceMapURL = fileData.sourceMapUrl;
}
// Path to file on disk.
// Url bundle is served from.