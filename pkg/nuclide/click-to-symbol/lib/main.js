'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var clickToSymbols: Array<ClickToSymbol> = [];
var delegates: Array<ClickToSymbolDelegate> = [];
var editorViewSubscription: ?Object;
var usesCmdKeyToActivate: boolean;
var cmdKeySettingObserver: ?Object;

function findClickableRangesAndCallback(
    editor: TextEditor,
    row: number,
    column: number,
    shiftKey: boolean): Promise {
  var {asyncFind} = require('nuclide-commons');
  var test = async function(delegate) {
    return await delegate.getClickableRangesAndCallback(editor, row, column, shiftKey);
  };
  return asyncFind(delegates, test);
}

function shouldUseCmdKeyToActivate(): boolean {
  return usesCmdKeyToActivate;
}

module.exports = {
  config: {
    useCmdKey: {
      type: 'boolean',
      default: true,
      description: 'Use cmd key instead of alt to trigger click to symbol.',
    },
  },

  activate: function() {
    var addClickToSymbolToEditorView = function(textEditor: TextEditor) {
      var ClickToSymbol = require('./ClickToSymbol');
      var clickToSymbol = new ClickToSymbol(
          textEditor,
          shouldUseCmdKeyToActivate,
          findClickableRangesAndCallback);
      clickToSymbols.push(clickToSymbol);
    };

    editorViewSubscription = atom.workspace.observeTextEditors(
        addClickToSymbolToEditorView);

    cmdKeySettingObserver = atom.config.observe(
        'nuclide-click-to-symbol.useCmdKey',
        value => { usesCmdKeyToActivate = value; }
    );
  },

  deactivate: function() {
    editorViewSubscription.off();
    editorViewSubscription = null;

    cmdKeySettingObserver.off();
    cmdKeySettingObserver = null;

    clickToSymbols.forEach((clickToSymbol) => {
      clickToSymbol.dispose();
    });
    clickToSymbols = [];
    delegates = [];
  },

  registerDelegate: function(delegate: ClickToSymbolDelegate) {
    // Delegates must be sorted in priority order.
    var priority = delegate.getPriority();
    for (var i = 0, len = delegates.length; i < len; i++) {
      var item = delegates[i];
      if (delegate === item) {
        return;
      }

      if (priority > item.getPriority()) {
        delegates.splice(i, 0, delegate);
        return;
      }
    }

    // If we made it all the way through the loop, delegate must be lower
    // priority than all of the existing delegates, so add it to the end.
    delegates.push(delegate);
  },
};
