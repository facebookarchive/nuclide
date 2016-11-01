'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileCache = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

let createFileData = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (url) {
    // Handle the bundle file.
    log(`FileCache got url: ${ url.toString() }`);
    const fileResponse = yield (0, (_xfetch || _load_xfetch()).default)(url.toString(), {});
    const basename = (_nuclideUri || _load_nuclideUri()).default.basename(url.pathname);

    var _ref2 = yield Promise.all([fileResponse.text(), (_fsPromise || _load_fsPromise()).default.tempfile({ prefix: basename, suffix: '.js' })]),
        _ref3 = _slicedToArray(_ref2, 2);

    const fileText = _ref3[0],
          filePath = _ref3[1];

    yield (_fsPromise || _load_fsPromise()).default.writeFile(filePath, fileText);
    const fileSystemUrl = `file://${ filePath }`;

    const matches = SOURCE_MAP_REGEX.exec(fileText);
    if (matches == null) {
      return {
        filePath: fileSystemUrl,
        url: url.toString()
      };
    }

    // Handle source maps for the bundle.
    const sourceMapUrl = `${ url.origin }${ matches[1] }`;
    const sourceMapResponse = yield (0, (_xfetch || _load_xfetch()).default)(sourceMapUrl, {});
    const sourceMap = yield sourceMapResponse.text();
    const base64SourceMap = new Buffer(sourceMap).toString('base64');
    return {
      filePath: fileSystemUrl,
      url: url.toString(),
      sourceMapUrl: `${ SOURCE_MAP_PREFIX }${ base64SourceMap }`
    };
  });

  return function createFileData(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _xfetch;

function _load_xfetch() {
  return _xfetch = _interopRequireDefault(require('../../commons-node/xfetch'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _logger;

function _load_logger() {
  return _logger = require('./logger');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (_logger || _load_logger()).logger.log;

const SOURCE_MAP_REGEX = /\/\/# sourceMappingURL=(.+)$/;
const SOURCE_MAP_PREFIX = 'data:application/json;base64,';

let FileCache = exports.FileCache = class FileCache {

  constructor() {
    this._filePathToFileData = new Map();
    this._urlToFileData = new Map();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => this._filePathToFileData.clear(), () => this._urlToFileData.clear());
  }

  scriptParsed(obj) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const params = obj.params;

      if (params == null) {
        return obj;
      }
      const urlString = params.url;

      if (urlString == null || urlString === '') {
        return obj;
      }
      if (!urlString.startsWith('http:')) {
        return obj;
      }
      const url = new URL(urlString);
      const fileData = _this._urlToFileData.get(urlString);
      if (fileData != null) {
        updateMessageObjWithFileData(obj, fileData);
        return obj;
      }
      const newFileData = yield createFileData(url);
      _this._urlToFileData.set(newFileData.url, newFileData);
      _this._filePathToFileData.set(newFileData.filePath, newFileData);
      updateMessageObjWithFileData(obj, newFileData);
      return obj;
    })();
  }

  getUrlFromFilePath(filePath) {
    const fileData = this._filePathToFileData.get(filePath);
    if (fileData == null) {
      return filePath;
    }
    return fileData.url;
  }

  dispose() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this2._disposables.dispose();
    })();
  }
};


function updateMessageObjWithFileData(obj, fileData) {
  obj.params.url = fileData.filePath;
  obj.params.sourceMapURL = fileData.sourceMapUrl;
}