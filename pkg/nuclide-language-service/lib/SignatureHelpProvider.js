"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SignatureHelpProvider = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
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

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
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
class SignatureHelpProvider {
  constructor(grammarScopes, config, connectionToLanguageService) {
    this.grammarScopes = grammarScopes;
    this.triggerCharacters = config.triggerCharacters;
    this.showDocBlock = config.showDocBlock != null ? config.showDocBlock : true;
    this._analyticsEventName = config.analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(grammarScopes, config, connectionToLanguageService) {
    const disposables = new (_UniversalDisposable().default)();
    disposables.add(atom.packages.serviceHub.consume('signature-help', config.version, registry => {
      disposables.add(registry(new SignatureHelpProvider(grammarScopes, config, connectionToLanguageService)));
    }));
    return disposables;
  }

  getSignatureHelp(editor, position) {
    return (0, _nuclideAnalytics().trackTiming)(this._analyticsEventName, async () => {
      const languageService = await this._connectionToLanguageService.getForUri(editor.getPath());

      if (languageService == null) {
        return null;
      }

      const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);

      if (fileVersion == null) {
        return null;
      }

      const signatureHelp = await languageService.signatureHelp(fileVersion, position);

      if (!this.showDocBlock && signatureHelp != null && signatureHelp.signatures != null) {
        for (const signature of signatureHelp.signatures) {
          delete signature.documentation;
        }
      }

      return signatureHelp;
    });
  }

}

exports.SignatureHelpProvider = SignatureHelpProvider;