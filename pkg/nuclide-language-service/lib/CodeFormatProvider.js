'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeFormatProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class CodeFormatProvider {

  constructor(name, selector, priority, analyticsEventName, connectionToLanguageService, busySignalProvider) {
    this.name = name;
    this.selector = selector;
    this.inclusionPriority = priority;
    this._connectionToLanguageService = connectionToLanguageService;
    this._busySignalProvider = busySignalProvider;
  }

  static register(name, selector, config, connectionToLanguageService, busySignalProvider) {
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.packages.serviceHub.provide('nuclide-code-format.provider', config.version, config.canFormatRanges ? new RangeFormatProvider(name, selector, config.priority, config.analyticsEventName, connectionToLanguageService, busySignalProvider) : new FileFormatProvider(name, selector, config.priority, config.analyticsEventName, connectionToLanguageService, busySignalProvider)));

    if (config.canFormatAtPosition) {
      disposable.add(atom.packages.serviceHub.provide('nuclide-code-format.provider', config.version, new PositionFormatProvider(name, selector, config.priority, config.analyticsEventName, connectionToLanguageService, busySignalProvider)));
    }

    return disposable;
  }
}

exports.CodeFormatProvider = CodeFormatProvider;
class RangeFormatProvider extends CodeFormatProvider {
  constructor(name, selector, priority, analyticsEventName, connectionToLanguageService, busySignalProvider) {
    super(name, selector, priority, analyticsEventName, connectionToLanguageService, busySignalProvider);
  }

  formatCode(editor, range) {
    var _this = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._analyticsEventName, (0, _asyncToGenerator.default)(function* () {
      const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = _this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService != null && fileVersion != null) {
        const result = yield _this._busySignalProvider.reportBusyWhile(`${_this.name}: Formatting ${fileVersion.filePath}`, (0, _asyncToGenerator.default)(function* () {
          return (yield languageService).formatSource(fileVersion, range);
        }));
        if (result != null) {
          return result;
        }
      }

      return [];
    }));
  }
}

class FileFormatProvider extends CodeFormatProvider {
  constructor(name, selector, priority, analyticsEventName, connectionToLanguageService, busySignalProvider) {
    super(name, selector, priority, analyticsEventName, connectionToLanguageService, busySignalProvider);
  }

  formatEntireFile(editor, range) {
    var _this2 = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._analyticsEventName, (0, _asyncToGenerator.default)(function* () {
      const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = _this2._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService != null && fileVersion != null) {
        const result = yield _this2._busySignalProvider.reportBusyWhile(`${_this2.name}: Formatting ${fileVersion.filePath}`, (0, _asyncToGenerator.default)(function* () {
          return (yield languageService).formatEntireFile(fileVersion, range);
        }));
        if (result != null) {
          return result;
        }
      }

      return { formatted: editor.getText() };
    }));
  }
}

class PositionFormatProvider extends CodeFormatProvider {
  formatAtPosition(editor, position, character) {
    var _this3 = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._analyticsEventName, (0, _asyncToGenerator.default)(function* () {
      const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = _this3._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService != null && fileVersion != null) {
        const result = yield _this3._busySignalProvider.reportBusyWhile(`${_this3.name}: Formatting ${fileVersion.filePath}`, (0, _asyncToGenerator.default)(function* () {
          return (yield languageService).formatAtPosition(fileVersion, position, character);
        }));
        if (result != null) {
          return result;
        }
      }

      return [];
    }));
  }
}