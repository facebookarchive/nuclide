function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideHackCommon2;

function _nuclideHackCommon() {
  return _nuclideHackCommon2 = require('../../nuclide-hack-common');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _HackLanguage2;

function _HackLanguage() {
  return _HackLanguage2 = require('./HackLanguage');
}

var _commonsAtomLoadingNotification2;

function _commonsAtomLoadingNotification() {
  return _commonsAtomLoadingNotification2 = _interopRequireDefault(require('../../commons-atom/loading-notification'));
}

var _nuclideOpenFiles2;

function _nuclideOpenFiles() {
  return _nuclideOpenFiles2 = require('../../nuclide-open-files');
}

module.exports = {
  isEditorSupported: _asyncToGenerator(function* (textEditor) {
    var fileUri = textEditor.getPath();
    if (!fileUri || !(_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
      return false;
    }
    return true;
  }),

  findReferences: function findReferences(editor, position) {
    return (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)('hack:findReferences', _asyncToGenerator(function* () {
      var fileVersion = yield (0, (_nuclideOpenFiles2 || _nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      var hackLanguage = yield (0, (_HackLanguage2 || _HackLanguage()).getHackLanguageForUri)(editor.getPath());
      if (hackLanguage == null || fileVersion == null) {
        return null;
      }
      return yield (0, (_commonsAtomLoadingNotification2 || _commonsAtomLoadingNotification()).default)(hackLanguage.findReferences(fileVersion, position), 'Loading references from Hack server...');
    }));
  }
};