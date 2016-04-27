Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideAnalytics = require('../../nuclide-analytics');

function copyAbsolutePath() {
  trackOperation('copyAbsolutePath', function () {
    var uri = getCurrentNuclideUri();
    if (!uri) {
      return;
    }
    copyToClipboard('Copied absolute path', (0, _nuclideRemoteUri.getPath)(uri));
  });
}

function copyProjectRelativePath() {
  trackOperation('copyProjectRelativePath', function () {
    var uri = getCurrentNuclideUri();
    if (!uri) {
      return;
    }

    var projectRelativePath = getAtomProjectRelativePath(uri);
    if (projectRelativePath) {
      copyToClipboard('Copied project relative path', projectRelativePath);
    } else {
      copyToClipboard('Path not contained in any open project.\nCopied absolute path', (0, _nuclideRemoteUri.getPath)(uri));
    }
  });
}

function copyRepositoryRelativePath() {
  trackOperation('copyRepositoryRelativePath', _asyncToGenerator(function* () {

    var uri = getCurrentNuclideUri();
    if (!uri) {
      return;
    }

    // First source control relative.
    var repoRelativePath = getRepositoryRelativePath(uri);
    if (repoRelativePath) {
      copyToClipboard('Copied repository relative path', repoRelativePath);
      return;
    }

    // Next try arcanist relative.
    var arcRelativePath = yield getArcanistRelativePath(uri);
    if (arcRelativePath) {
      copyToClipboard('Copied arc project relative path', arcRelativePath);
      return;
    }

    // Lastly, project and absolute.
    var projectRelativePath = getAtomProjectRelativePath(uri);
    if (projectRelativePath) {
      copyToClipboard('Copied project relative path', projectRelativePath);
    } else {
      copyToClipboard('Path not contained in any repository.\nCopied absolute path', (0, _nuclideRemoteUri.getPath)(uri));
    }
  }));
}

function getAtomProjectRelativePath(path) {
  var _atom$project$relativizePath = atom.project.relativizePath(path);

  var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 2);

  var projectPath = _atom$project$relativizePath2[0];
  var relativePath = _atom$project$relativizePath2[1];

  if (!projectPath) {
    return null;
  }
  return relativePath;
}

function getRepositoryRelativePath(path) {
  // TODO(peterhal): repositoryForPath is the same as projectRelativePath
  // only less robust. We'll need a version of findHgRepository which is
  // aware of remote paths.
  return null;
}

function getArcanistRelativePath(path) {
  var _require = require('../../nuclide-arcanist-client');

  var getProjectRelativePath = _require.getProjectRelativePath;

  return getProjectRelativePath(path);
}

function copyToClipboard(messagePrefix, value) {
  atom.clipboard.write(value);
  notify(messagePrefix + ': ```' + value + '```');
}

function getCurrentNuclideUri() {
  var editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    notify('Nothing copied. No active text editor.');
    return null;
  }

  var path = editor.getPath();
  if (!path) {
    notify('Nothing copied. Current text editor is unnamed.');
    return null;
  }

  return path;
}

function trackOperation(eventName, operation) {
  (0, _nuclideAnalytics.trackOperationTiming)('nuclide-clipboard-path:' + eventName, operation);
}

function notify(message) {
  atom.notifications.addInfo(message);
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-absolute-path', copyAbsolutePath));
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-repository-relative-path', copyRepositoryRelativePath));
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clipboard-path:copy-project-relative-path', copyProjectRelativePath));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

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