'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.activate = activate;
exports.deactivate = deactivate;

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _projects;

function _load_projects() {
  return _projects = require('nuclide-commons-atom/projects');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function copyAbsolutePath() {
  trackOperation('copyAbsolutePath', () => {
    const uri = getCurrentNuclideUri();
    // flowlint-next-line sketchy-null-string:off
    if (!uri) {
      return;
    }
    copyToClipboard('Copied absolute path', (_nuclideUri || _load_nuclideUri()).default.getPath(uri));
  });
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function copyProjectRelativePath() {
  trackOperation('copyProjectRelativePath', () => {
    const uri = getCurrentNuclideUri();
    // flowlint-next-line sketchy-null-string:off
    if (!uri) {
      return;
    }

    const projectRelativePath = (0, (_projects || _load_projects()).getAtomProjectRelativePath)(uri);
    // flowlint-next-line sketchy-null-string:off
    if (projectRelativePath) {
      copyToClipboard('Copied project relative path', projectRelativePath);
    } else {
      copyToClipboard('Path not contained in any open project.\nCopied absolute path', (_nuclideUri || _load_nuclideUri()).default.getPath(uri));
    }
  });
}

function copyRepositoryRelativePath() {
  trackOperation('copyRepositoryRelativePath', (0, _asyncToGenerator.default)(function* () {
    const uri = getCurrentNuclideUri();
    // flowlint-next-line sketchy-null-string:off
    if (!uri) {
      return;
    }

    // First source control relative.
    const repoRelativePath = getRepositoryRelativePath(uri);
    // flowlint-next-line sketchy-null-string:off
    if (repoRelativePath) {
      copyToClipboard('Copied repository relative path', repoRelativePath);
      return;
    }

    // Next try arcanist relative.
    const arcRelativePath = yield getArcanistRelativePath(uri);
    // flowlint-next-line sketchy-null-string:off
    if (arcRelativePath) {
      copyToClipboard('Copied arc project relative path', arcRelativePath);
      return;
    }

    // Lastly, project and absolute.
    const projectRelativePath = (0, (_projects || _load_projects()).getAtomProjectRelativePath)(uri);
    // flowlint-next-line sketchy-null-string:off
    if (projectRelativePath) {
      copyToClipboard('Copied project relative path', projectRelativePath);
    } else {
      copyToClipboard('Path not contained in any repository.\nCopied absolute path', (_nuclideUri || _load_nuclideUri()).default.getPath(uri));
    }
  }));
}

function getRepositoryRelativePath(path) {
  // TODO(peterhal): repositoryForPath is the same as projectRelativePath
  // only less robust. We'll need a version of findHgRepository which is
  // aware of remote paths.
  return null;
}

function getArcanistRelativePath(path) {
  const arcService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getArcanistServiceByNuclideUri)(path);
  return arcService.getProjectRelativePath(path);
}

function copyToClipboard(messagePrefix, value) {
  atom.clipboard.write(value);
  notify(`${messagePrefix}: \`\`\`${value}\`\`\``);
}

function getCurrentNuclideUri() {
  const editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    notify('Nothing copied. No active text editor.');
    return null;
  }

  const path = editor.getPath();
  // flowlint-next-line sketchy-null-string:off
  if (!path) {
    notify('Nothing copied. Current text editor is unnamed.');
    return null;
  }

  return path;
}

function trackOperation(eventName, operation) {
  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clipboard-path:' + eventName, operation);
}

function notify(message) {
  atom.notifications.addInfo(message);
}

class Activation {

  constructor(state) {
    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-absolute-path', copyAbsolutePath));
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-repository-relative-path', copyRepositoryRelativePath));
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-project-relative-path', copyProjectRelativePath));
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

let activation = null;

function activate(state) {
  if (!activation) {
    activation = new Activation();
  }
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}