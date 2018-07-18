"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HgScm = void 0;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _HgTextDocumentContentProvider() {
  const data = require("./HgTextDocumentContentProvider");

  _HgTextDocumentContentProvider = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('hg-scm');
/**
 * This creates an adapter between a Mercurial repository that backs a
 * RemoteFileSystem and VS Code's SCM API:
 * https://code.visualstudio.com/docs/extensionAPI/api-scm.
 */

class HgScm {
  /**
   * The repoRoot may be an ancestor of a workspace folder.
   */
  constructor(repoRoot, remoteFileSystem, statusObservable) {
    this._repoRoot = repoRoot;
    this._remoteFileSystem = remoteFileSystem;
    const repoUri = remoteFileSystem.pathToUri(repoRoot);
    this._scm = vscode().scm.createSourceControl('hg', 'Hg', repoUri);
    this._scm.quickDiffProvider = new HgQuickDiffProvider();
    this._scmResourceGroup = this._scm.createResourceGroup('workingTree', 'Changes');
    this._scmResourceGroup.hideWhenEmpty = true;
    this._subscription = statusObservable.subscribe(value => this._updateStatus(value), err => logger.error(`Failed running mercurial at ${repoRoot}`, err), () => logger.info(`\`hg status\` observer of ${this._repoRoot} complete.`));
  }

  _updateStatus(data) {
    this._scmResourceGroup.resourceStates = Object.entries(data.status).map(([relativePath, code]) => new Resource(relativePath, code, this));
  }

  resolve(pathRelativeToRepoRoot) {
    const fullPath = _path.default.join(this._repoRoot, pathRelativeToRepoRoot);

    return this._remoteFileSystem.pathToUri(fullPath);
  }

  dispose() {
    this._subscription.unsubscribe();

    this._scm.dispose();
  }

}
/**
 * Implementation of SourceControlResourceState that computes its fields lazily,
 * emulating the pattern of VS Code's own Git extension:
 * https://github.com/Microsoft/vscode/blob/master/extensions/git/src/repository.ts.
 */


exports.HgScm = HgScm;

class Resource {
  constructor(relativePath, code, hgScm) {
    this._relativePath = relativePath;
    this._code = code;
    this._hgScm = hgScm;
  }

  get resourceUri() {
    return this._hgScm.resolve(this._relativePath);
  }
  /**
   * Command to open the file when the user clicks on it in the Source Control
   * pane.
   */


  get command() {
    return {
      command: 'vscode.open',
      title: 'Open',
      arguments: [this.resourceUri]
    };
  }

  get decorations() {
    // We attempt to match the UI treatment of VS Code's own Git extension by
    // using some additional decoration properties (color, letter) that are
    // undocumented at the time of this writing. These are used in favor of the
    // light and dark icons.
    return {
      tooltip: codeToName(this._code),
      strikeThrough: this._code === 'R',
      faded: false,
      letter: this._code,
      color: codeToColor(this._code)
    };
  }

}

function codeToName(code) {
  switch (code) {
    case 'M':
      return 'modified';

    case 'A':
      return 'added';

    case 'R':
      return 'deleted';

    case '!':
      return 'missing';

    case '?':
      return 'untracked';

    default:
      code;
      throw new Error(`Unknown code: ${code}`);
  }
}

function codeToColor(code) {
  // These colors match those of VS Code's built-in Git extension.
  // We might be in trouble if the user has disabled that extension...
  switch (code) {
    case 'M':
      return new (vscode().ThemeColor)('gitDecoration.modifiedResourceForeground');

    case 'A':
      return new (vscode().ThemeColor)('gitDecoration.untrackedResourceForeground');

    case 'R':
      return new (vscode().ThemeColor)('gitDecoration.conflictingResourceForeground');

    case '!':
      return new (vscode().ThemeColor)('gitDecoration.conflictingResourceForeground');

    case '?':
      return new (vscode().ThemeColor)('gitDecoration.untrackedResourceForeground');

    default:
      code;
      throw new Error(`Unknown code: ${code}`);
  }
}

class HgQuickDiffProvider {
  provideOriginalResource(uri, token) {
    return (0, _HgTextDocumentContentProvider().toHgUri)(uri);
  }

}