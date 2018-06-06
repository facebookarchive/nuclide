'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _projects;

function _load_projects() {
  return _projects = require('../../../modules/nuclide-commons-atom/projects');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
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

function copyAbsolutePath() {
  trackOperation('copyAbsolutePath', () => {
    const uri = getCurrentNuclideUri();
    // flowlint-next-line sketchy-null-string:off
    if (!uri) {
      return;
    }
    copyToClipboard('Copied absolute path', (_nuclideUri || _load_nuclideUri()).default.getPath(uri));
  });
}

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
  trackOperation('copyRepositoryRelativePath', async () => {
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
    const arcRelativePath = await getArcanistRelativePath(uri);
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
  });
}

function copyHostname() {
  trackOperation('copyRepositoryRelativePath', async () => {
    const uri = getCurrentNuclideUri();
    if (uri == null) {
      return;
    }
    const { hostname } = (_nuclideUri || _load_nuclideUri()).default.parse(uri);
    if (hostname == null) {
      notify('Nothing copied - the path is a local path.');
      return;
    }
    copyToClipboard('Copied hostname', hostname);
  });
}

function getRepositoryRelativePath(path) {
  // TODO(peterhal): repositoryForPath is the same as projectRelativePath
  // only less robust. We'll need a version of findHgRepository which is
  // aware of remote paths.
  return null;
}

async function getArcanistRelativePath(path) {
  try {
    const {
      getArcanistServiceByNuclideUri
      // $FlowFB
    } = require('../../commons-atom/fb-remote-connection');
    const arcService = getArcanistServiceByNuclideUri(path);
    return await arcService.getProjectRelativePath(path);
  } catch (err) {
    return null;
  }
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
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-absolute-path', copyAbsolutePath));
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-hostname-of-current-path', copyHostname));
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