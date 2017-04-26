'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileCache = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getSourceMapFromDisk = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (bundle) {
    const matches = SOURCE_MAP_REGEX.exec(bundle);
    if (matches == null) {
      return undefined;
    }
    // Handle source maps for the bundle.
    const sourceMapPath = matches[1];
    const sourceMap = yield (_fsPromise || _load_fsPromise()).default.readFile(sourceMapPath);
    const base64SourceMap = new Buffer(sourceMap).toString('base64');
    return `${SOURCE_MAP_PREFIX}${base64SourceMap}`;
  });

  return function getSourceMapFromDisk(_x) {
    return _ref.apply(this, arguments);
  };
})();

let getSourceMapFromUrl = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (url, bundle) {
    const matches = SOURCE_MAP_REGEX.exec(bundle);
    if (matches == null) {
      return undefined;
    }

    // Handle source maps for the bundle.
    const sourceMapUrl = `${url.origin}${matches[1]}`;
    const sourceMapResponse = yield (0, (_xfetch || _load_xfetch()).default)(sourceMapUrl.replace(EMULATOR_LOCALHOST_ADDR, 'localhost'), {});
    const sourceMap = yield sourceMapResponse.text();
    const base64SourceMap = new Buffer(sourceMap).toString('base64');
    return `${SOURCE_MAP_PREFIX}${base64SourceMap}`;
  });

  return function getSourceMapFromUrl(_x2, _x3) {
    return _ref2.apply(this, arguments);
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

const { log } = (_logger || _load_logger()).logger;
// Android's stock emulator and other emulators such as genymotion use a standard localhost alias.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const EMULATOR_LOCALHOST_ADDR = /10\.0\.2\.2|10\.0\.3\.2/;

const SOURCE_MAP_REGEX = /\/\/# sourceMappingURL=(.+)$/;
const SOURCE_MAP_PREFIX = 'data:application/json;base64,';

class FileCache {

  constructor(getScriptSource) {
    this._getScriptSource = getScriptSource;
    this._nuclidePathToFileData = new Map();
    this._targetPathToFileData = new Map();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => this._nuclidePathToFileData.clear(), () => this._targetPathToFileData.clear());
  }

  scriptParsed(obj) {
    const { params } = obj;
    if (params == null) {
      return Promise.resolve(obj);
    }
    const { url: urlString } = params;
    if (urlString == null) {
      return Promise.resolve(obj);
    }
    if (urlString.startsWith('http:')) {
      return this._processScriptParsedWithDownloadableUrl(obj, urlString);
    }
    const { sourceMapURL } = params;
    if (sourceMapURL != null && sourceMapURL !== '') {
      return this._processScriptParsedWithoutDownloadableUrl(obj, urlString);
    }
    return Promise.resolve(obj);
  }

  // Used to process `Debugger.scriptParsed` messages that have reported a `sourceMapURL` without
  // a corresponding `url`.
  _processScriptParsedWithoutDownloadableUrl(obj, urlString) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { params } = obj;
      const { scriptId } = params;
      const { result } = yield _this._getScriptSource(scriptId);
      const { scriptSource } = result;

      const filePath = yield (_fsPromise || _load_fsPromise()).default.tempfile({ suffix: '.js' });
      yield (_fsPromise || _load_fsPromise()).default.writeFile(filePath, scriptSource);
      const nuclidePath = `file://${filePath}`;

      const newFileData = {
        nuclidePath,
        targetPath: urlString,
        sourceMapUrl: yield getSourceMapFromDisk(scriptSource)
      };
      _this._targetPathToFileData.set(newFileData.targetPath, newFileData);
      _this._nuclidePathToFileData.set(newFileData.nuclidePath, newFileData);
      updateMessageObjWithFileData(obj, newFileData);
      return obj;
    })();
  }

  // Used to process `Debugger.scriptParsed` messages that have reported a `url` with an http:
  // prefix, indicating that we need to download our resources.
  _processScriptParsedWithDownloadableUrl(obj, urlString) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const url = new URL(urlString);
      const fileData = _this2._targetPathToFileData.get(urlString);
      if (fileData != null) {
        updateMessageObjWithFileData(obj, fileData);
        return obj;
      }

      log(`FileCache got url: ${urlString}`);
      const localhostedUrl = urlString.replace(EMULATOR_LOCALHOST_ADDR, 'localhost');
      log(`Converted to: ${localhostedUrl}`);
      const fileResponse = yield (0, (_xfetch || _load_xfetch()).default)(localhostedUrl, {});
      const basename = (_nuclideUri || _load_nuclideUri()).default.basename(url.pathname);
      const [contents, filePath] = yield Promise.all([fileResponse.text(), (_fsPromise || _load_fsPromise()).default.tempfile({ prefix: basename, suffix: '.js' })]);
      yield (_fsPromise || _load_fsPromise()).default.writeFile(filePath, contents);
      const nuclidePath = `file://${filePath}`;

      const newFileData = {
        nuclidePath,
        targetPath: urlString,
        sourceMapUrl: yield getSourceMapFromUrl(url, contents)
      };
      _this2._targetPathToFileData.set(newFileData.targetPath, newFileData);
      _this2._nuclidePathToFileData.set(newFileData.nuclidePath, newFileData);
      updateMessageObjWithFileData(obj, newFileData);
      return obj;
    })();
  }

  getUrlFromFilePath(filePath) {
    const fileData = this._nuclidePathToFileData.get(filePath);
    if (fileData == null) {
      return filePath;
    }
    return fileData.targetPath;
  }

  dispose() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this3._disposables.dispose();
    })();
  }
}

exports.FileCache = FileCache;


function updateMessageObjWithFileData(obj, fileData) {
  obj.params.url = fileData.nuclidePath;
  obj.params.sourceMapURL = fileData.sourceMapUrl;
}