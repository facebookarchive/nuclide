"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _projects() {
  const data = require("../../../modules/nuclide-commons-atom/projects");

  _projects = function () {
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
 * 
 * @format
 */
function copyAbsolutePath() {
  trackOperation('copyAbsolutePath', () => {
    const uri = getCurrentNuclideUri(); // flowlint-next-line sketchy-null-string:off

    if (!uri) {
      return;
    }

    copyToClipboard('Copied absolute path', _nuclideUri().default.getPath(uri));
  });
}

function copyProjectRelativePath() {
  trackOperation('copyProjectRelativePath', () => {
    const uri = getCurrentNuclideUri(); // flowlint-next-line sketchy-null-string:off

    if (!uri) {
      return;
    }

    const projectRelativePath = (0, _projects().getAtomProjectRelativePath)(uri); // flowlint-next-line sketchy-null-string:off

    if (projectRelativePath) {
      copyToClipboard('Copied project relative path', projectRelativePath);
    } else {
      copyToClipboard('Path not contained in any open project.\nCopied absolute path', _nuclideUri().default.getPath(uri));
    }
  });
}

function copyRepositoryRelativePath() {
  trackOperation('copyRepositoryRelativePath', async () => {
    const uri = getCurrentNuclideUri(); // flowlint-next-line sketchy-null-string:off

    if (!uri) {
      return;
    } // First source control relative.


    const repoRelativePath = getRepositoryRelativePath(uri); // flowlint-next-line sketchy-null-string:off

    if (repoRelativePath) {
      copyToClipboard('Copied repository relative path', repoRelativePath);
      return;
    } // Next try arcanist relative.


    const arcRelativePath = await getArcanistRelativePath(uri); // flowlint-next-line sketchy-null-string:off

    if (arcRelativePath) {
      copyToClipboard('Copied arc project relative path', arcRelativePath);
      return;
    } // Lastly, project and absolute.


    const projectRelativePath = (0, _projects().getAtomProjectRelativePath)(uri); // flowlint-next-line sketchy-null-string:off

    if (projectRelativePath) {
      copyToClipboard('Copied project relative path', projectRelativePath);
    } else {
      copyToClipboard('Path not contained in any repository.\nCopied absolute path', _nuclideUri().default.getPath(uri));
    }
  });
}

function copyBasename() {
  trackOperation('copyBasename', async () => {
    const uri = getCurrentNuclideUri();

    if (uri == null) {
      return;
    }

    copyToClipboard('Copied basename', _nuclideUri().default.basename(uri, _nuclideUri().default.extname(uri)));
  });
}

function copyHostname() {
  trackOperation('copyHostname', async () => {
    const uri = getCurrentNuclideUri();

    if (uri == null) {
      return;
    }

    const {
      hostname
    } = _nuclideUri().default.parse(uri);

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
      getArcanistServiceByNuclideUri // $FlowFB

    } = require("../../commons-atom/fb-remote-connection");

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

  const path = editor.getPath(); // flowlint-next-line sketchy-null-string:off

  if (!path) {
    notify('Nothing copied. Current text editor is unnamed.');
    return null;
  }

  return path;
}

function trackOperation(eventName, operation) {
  (0, _nuclideAnalytics().trackTiming)('nuclide-clipboard-path:' + eventName, operation);
}

function notify(message) {
  atom.notifications.addInfo(message);
}

class Activation {
  constructor(state) {
    this._subscriptions = new (_UniversalDisposable().default)(atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-absolute-path', copyAbsolutePath), atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-basename-of-current-path', copyBasename), atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-hostname-of-current-path', copyHostname), atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-repository-relative-path', copyRepositoryRelativePath), atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-project-relative-path', copyProjectRelativePath));
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