Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _CwdApi;

function _load_CwdApi() {
  return _CwdApi = require('./CwdApi');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsAtomProjects;

function _load_commonsAtomProjects() {
  return _commonsAtomProjects = require('../../commons-atom/projects');
}

var Activation = (function () {
  function Activation(rawState) {
    _classCallCheck(this, Activation);

    var state = rawState || {};
    var initialCwdPath = state.initialCwdPath;

    this._cwdApi = new (_CwdApi || _load_CwdApi()).CwdApi(initialCwdPath);
    this._disposables = new (_atom || _load_atom()).CompositeDisposable(this._cwdApi, atom.commands.add('atom-workspace', 'nuclide-current-working-root:set-from-active-file', this._setFromActiveFile.bind(this)));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'provideApi',
    value: function provideApi() {
      return this._cwdApi;
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      var cwd = this._cwdApi.getCwd();
      return {
        initialCwdPath: cwd == null ? null : cwd.getPath()
      };
    }
  }, {
    key: '_setFromActiveFile',
    value: function _setFromActiveFile() {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        atom.notifications.addError('No file is currently active.');
        return;
      }

      var path = editor.getPath();
      if (path == null) {
        atom.notifications.addError('Active file does not have a path.');
        return;
      }

      var projectRoot = (0, (_commonsAtomProjects || _load_commonsAtomProjects()).getAtomProjectRootPath)(path);
      if (projectRoot == null) {
        atom.notifications.addError('Active file does not belong to a project.');
        return;
      }

      this._cwdApi.setCwd(projectRoot);
    }
  }]);

  return Activation;
})();

exports.Activation = Activation;