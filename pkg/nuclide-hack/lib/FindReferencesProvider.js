var doFindReferences = _asyncToGenerator(function* (textEditor, position) /*FindReferencesReturn*/{
  var result = yield (0, _nuclideAtomHelpers.withLoadingNotification)(findReferences(textEditor, position.row, position.column), 'Loading references from Hack server...');
  if (!result) {
    return { type: 'error', message: 'Only classes/functions/methods are supported.' };
  }

  var baseUri = result.baseUri;
  var symbolName = result.symbolName;
  var references = result.references;

  // Process this into the format nuclide-find-references expects.
  references = references.map(function (ref) {
    return {
      uri: ref.filename,
      name: null, // TODO(hansonw): Get the caller when it's available
      start: {
        line: ref.line,
        column: ref.char_start
      },
      end: {
        line: ref.line,
        column: ref.char_end
      }
    };
  });

  // Strip off the global namespace indicator.
  if (symbolName.startsWith('\\')) {
    symbolName = symbolName.slice(1);
  }

  return {
    type: 'data',
    baseUri: baseUri,
    referencedSymbolName: symbolName,
    references: references
  };
});

var findReferences = _asyncToGenerator(function* (editor, line, column) {
  var filePath = editor.getPath();
  var hackLanguage = yield (0, _HackLanguage.getHackLanguageForUri)(filePath);
  if (!hackLanguage || !filePath) {
    return null;
  }

  var contents = editor.getText();
  return yield hackLanguage.findReferences(filePath, contents, line, column);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// We can't pull in nuclide-find-references as a dependency, unfortunately.
// import type {FindReferencesReturn} from 'nuclide-find-references';

var _nuclideHackCommon = require('../../nuclide-hack-common');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _HackLanguage = require('./HackLanguage');

module.exports = {
  isEditorSupported: _asyncToGenerator(function* (textEditor) {
    var fileUri = textEditor.getPath();
    if (!fileUri || !_nuclideHackCommon.HACK_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
      return false;
    }
    return true;
  }),

  findReferences: function findReferences(editor, position) {
    return (0, _nuclideAnalytics.trackOperationTiming)('hack:findReferences', function () {
      return doFindReferences(editor, position);
    });
  }
};