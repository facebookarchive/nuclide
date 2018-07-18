"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyntacticSelectionManager = void 0;

function _ProviderRegistry() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/ProviderRegistry"));

  _ProviderRegistry = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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
const logger = (0, _log4js().getLogger)('nuclide-syntactic-selection');

class SyntacticSelectionManager {
  constructor() {
    this._providerRegistry = new (_ProviderRegistry().default)();
    this._textEditorMonitors = new Map();
    this._disposables = new (_UniversalDisposable().default)(this._registerCommands());
  }

  dispose() {
    this._disposables.dispose();
  }

  addProvider(provider) {
    this._disposables.add(this._providerRegistry.addProvider(provider));

    return new (_UniversalDisposable().default)(() => {
      this._providerRegistry.removeProvider(provider);
    });
  }

  _registerCommands() {
    return new (_UniversalDisposable().default)(atom.commands.add('atom-text-editor', 'nuclide-syntactic-selection:expand', () => this._expandSelection()), atom.commands.add('atom-text-editor', 'nuclide-syntactic-selection:collapse', () => this._collapseSelection()));
  }

  _expandSelection() {
    const monitor = this._getTextSelectionMonitor();

    if (monitor == null) {
      return;
    }

    monitor.doExpand();
  }

  _collapseSelection() {
    const monitor = this._getTextSelectionMonitor();

    if (monitor == null) {
      return;
    }

    monitor.doCollapse();
  }

  async _expandRange(editor) {
    try {
      const provider = this._providerRegistry.getProviderForEditor(editor);

      if (provider == null) {
        return null;
      }

      return await provider.getExpandedSelectionRange(editor);
    } catch (e) {
      // Don't let error in one expand/collapse affect the others
      logger.warn('Error processing syntactic selection expand in', editor.getPath(), e);
      return null;
    }
  }

  async _collapseRange(editor, selectionAnchor) {
    try {
      const provider = this._providerRegistry.getProviderForEditor(editor);

      if (provider == null) {
        return null;
      }

      return await provider.getCollapsedSelectionRange(editor, selectionAnchor);
    } catch (e) {
      // Don't let error in one expand/collapse affect the others
      logger.warn('Error processing syntactic selection collapse in', editor.getPath(), e);
      return null;
    }
  }
  /**
   * Either retrieves the monitor object for the currently active text editor
   * from the cache, or creates (and caches) the new one
   *
   * The monitor object hides the complexity of maintaining the last selection
   * explicitly made by user and handles the expand/collapse requests
   *
   * The monitor objects are held in the state only as long as an editor's
   * selection is modified by the syntactic selection feature. I.e. should a
   * user change the selection manually, the editor is removed from the cache
   * and any in-flight collapse/expand requests are abandoned (ignored).
   */


  _getTextSelectionMonitor() {
    const editor = atom.workspace.getActiveTextEditor();

    if (editor == null) {
      return null;
    }

    const cachedMonitor = this._textEditorMonitors.get(editor);

    if (cachedMonitor != null) {
      return cachedMonitor;
    } // The collapse-expand works with a single selection only, although
    // this could be extended to handle multiple selections as well


    const selectedRanges = editor.getSelectedBufferRanges();

    if (selectedRanges.length > 1) {
      return null;
    } // The anchor cursor position.
    // Applying a selection automatically moves the selection to either back
    // of the front of the selected region, so we're storing the original
    // location of the cursor.
    // This information later helps the language service to zoom in (collapse)
    // onto the proper sub-range of current selection when multiple children
    // exist.
    // For example, consider the line below:
    //    foo(arg1, bar('blah'), 100000)
    // If the expand will be iniated when the cursor is on 'blah', this position
    // will be marked as anchor. Let's assume we've expanded the selection
    // to include the entire line, entire call to foo().
    // It means that currently the cursor is at the end, after the ")"
    // When we issue the collapse call, having the anchor stored lets us deduct
    // that the child which is the second argument "bar('bla')" now needs to
    // be selected.


    const selectionAnchor = selectedRanges[0].end; // We will modify the selection in the current document, but we also are
    // subscribed to selection changes. We need to differentiate between
    // the changes made by our code from those made by the user.
    // Prior to making a change we set this variable to later on filter out
    // the notification with matching range

    let expectedSelection = selectedRanges[0]; // Sometimes Atom may reinterpret the range that is provided by the language
    // service. In this case we have one more opportunity to detecting that
    // the selection change is done by us. That is if it is done synchronously
    // it is definitely ours. Unfortunately this relies on an implementation
    // details, and thus is not future-proof. Still, better then terminating
    // the watch too soon

    let changingNow = false; // There are multiple events that cover selection change.

    const selectionChangeSignals = _RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(editor.observeSelections.bind(editor)), (0, _event().observableFromSubscribeFunction)(editor.onDidChangeSelectionRange.bind(editor))); // We want to stop listening (managing) an editor instance when it is
    // either closed or if its selection was manually changed by the user


    const stopMonitorSignal = _RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor)), selectionChangeSignals.filter(() => {
      if (changingNow) {
        return false;
      }

      const currentSelectedRanges = editor.getSelectedBufferRanges();

      if (currentSelectedRanges.length > 1 || expectedSelection != null && !currentSelectedRanges[0].isEqual(expectedSelection)) {
        // Stop monitoring
        return true;
      }

      return false;
    })); // Helps take care of racing requests


    const runningRangeRequests = new _RxMin.Subject();
    const monitor = {
      editor,
      doExpand: () => runningRangeRequests.next(this._expandRange(editor)),
      doCollapse: () => runningRangeRequests.next(this._collapseRange(editor, selectionAnchor))
    };

    this._textEditorMonitors.set(editor, monitor);

    const subscription = runningRangeRequests.switchMap(p => p).takeUntil(stopMonitorSignal).finally(() => {
      // Stop signal received - remove the monitor
      this._textEditorMonitors.delete(editor); // And do not leak the subscription object


      this._disposables.remove(subscription);
    }).subscribe(newExpected => {
      expectedSelection = newExpected;

      if (newExpected != null) {
        changingNow = true;
        editor.setSelectedBufferRange(newExpected);
        changingNow = false;
      }
    }, err => {
      logger.error('Unexpected error in sytnactic selection handling', err);
    });

    this._disposables.add(subscription);

    return monitor;
  }

}

exports.SyntacticSelectionManager = SyntacticSelectionManager;