"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeFormatProvider = void 0;

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFiles() {
  const data = require("../../nuclide-open-files");

  _nuclideOpenFiles = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
class CodeFormatProvider {
  constructor(name, grammarScopes, priority, analyticsEventName, connectionToLanguageService) {
    this.name = name;
    this.grammarScopes = grammarScopes;
    this.priority = priority;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, grammarScopes, config, connectionToLanguageService) {
    const disposable = new (_UniversalDisposable().default)(config.canFormatRanges ? atom.packages.serviceHub.provide('code-format.range', config.version, new RangeFormatProvider(name, grammarScopes, config.priority, config.analyticsEventName, connectionToLanguageService).provide()) : atom.packages.serviceHub.provide('code-format.file', config.version, new FileFormatProvider(name, grammarScopes, config.priority, config.analyticsEventName, connectionToLanguageService).provide()));

    if (config.canFormatAtPosition) {
      disposable.add(atom.packages.serviceHub.provide('code-format.onType', config.version, new PositionFormatProvider(name, grammarScopes, config.priority, config.analyticsEventName, connectionToLanguageService, config.keepCursorPosition).provide()));
    }

    return disposable;
  }

}

exports.CodeFormatProvider = CodeFormatProvider;

class RangeFormatProvider extends CodeFormatProvider {
  constructor(name, grammarScopes, priority, analyticsEventName, connectionToLanguageService) {
    super(name, grammarScopes, priority, analyticsEventName, connectionToLanguageService);
  }

  formatCode(editor, range) {
    return (0, _nuclideAnalytics().trackTiming)(this._analyticsEventName, async () => {
      const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);

      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());

      if (languageService != null && fileVersion != null) {
        const result = await (await languageService).formatSource(fileVersion, range, getFormatOptions(editor));

        if (result != null) {
          return result;
        }
      }

      return [];
    });
  }

  provide() {
    return {
      formatCode: this.formatCode.bind(this),
      grammarScopes: this.grammarScopes,
      priority: this.priority
    };
  }

}

class FileFormatProvider extends CodeFormatProvider {
  constructor(name, grammarScopes, priority, analyticsEventName, connectionToLanguageService) {
    super(name, grammarScopes, priority, analyticsEventName, connectionToLanguageService);
  }

  formatEntireFile(editor, range) {
    return (0, _nuclideAnalytics().trackTiming)(this._analyticsEventName, async () => {
      const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);

      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());

      if (languageService != null && fileVersion != null) {
        const result = await (await languageService).formatEntireFile(fileVersion, range, getFormatOptions(editor));

        if (result != null) {
          return result;
        }
      }

      return {
        formatted: editor.getText()
      };
    });
  }

  provide() {
    return {
      formatEntireFile: this.formatEntireFile.bind(this),
      grammarScopes: this.grammarScopes,
      priority: this.priority
    };
  }

}

class PositionFormatProvider extends CodeFormatProvider {
  constructor(name, grammarScopes, priority, analyticsEventName, connectionToLanguageService, keepCursorPosition = false) {
    super(name, grammarScopes, priority, analyticsEventName, connectionToLanguageService);
    this.keepCursorPosition = keepCursorPosition;
  }

  formatAtPosition(editor, position, character) {
    return (0, _nuclideAnalytics().trackTiming)(this._analyticsEventName, async () => {
      const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);

      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());

      if (languageService != null && fileVersion != null) {
        const result = await (await languageService).formatAtPosition(fileVersion, position, character, getFormatOptions(editor));

        if (result != null) {
          return result;
        }
      }

      return [];
    });
  }

  provide() {
    return {
      formatAtPosition: this.formatAtPosition.bind(this),
      grammarScopes: this.grammarScopes,
      priority: this.priority,
      keepCursorPosition: this.keepCursorPosition
    };
  }

}

function getFormatOptions(editor) {
  return {
    tabSize: editor.getTabLength(),
    insertSpaces: editor.getSoftTabs()
  };
}