Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.activate = activate;
exports.deactivate = deactivate;

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var subscriptions = null;

function activate(state) {
  if (subscriptions) {
    return;
  }

  var formatCode = require('./formatCode');

  var _require = require('./settings');

  var calculateOptions = _require.calculateOptions;
  var observeSettings = _require.observeSettings;

  var localSubscriptions = new (_atom2 || _atom()).CompositeDisposable();
  localSubscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-format-js:format',
  // Atom prevents in-command modification to text editor content.
  function () {
    return process.nextTick(function () {
      return formatCode(options);
    });
  }));

  // Keep settings up to date with Nuclide config and precalculate options.
  var settings = undefined;
  var options = undefined;
  localSubscriptions.add(observeSettings(function (newSettings) {
    settings = newSettings;
    options = calculateOptions(settings);
  }));

  // Format code on save if settings say so
  localSubscriptions.add(atom.workspace.observeTextEditors(function (editor) {
    localSubscriptions.add(editor.onDidSave(function () {
      if (settings.runOnSave) {
        process.nextTick(function () {
          return formatCode(options, editor);
        });
      }
    }));
  }));

  // Work around flow refinements.
  subscriptions = localSubscriptions;
}

function deactivate() {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }
}