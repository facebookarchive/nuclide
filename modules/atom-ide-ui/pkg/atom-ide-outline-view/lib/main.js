'use strict';

var _ActiveEditorRegistry;

function _load_ActiveEditorRegistry() {
  return _ActiveEditorRegistry = _interopRequireDefault(require('nuclide-commons-atom/ActiveEditorRegistry'));
}

var _debounced;

function _load_debounced() {
  return _debounced = require('nuclide-commons-atom/debounced');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('nuclide-commons-atom/analytics'));
}

var _workspaceViewsCompat;

function _load_workspaceViewsCompat() {
  return _workspaceViewsCompat = require('nuclide-commons-atom/workspace-views-compat');
}

var _OutlineViewPanel;

function _load_OutlineViewPanel() {
  return _OutlineViewPanel = require('./OutlineViewPanel');
}

var _createOutlines;

function _load_createOutlines() {
  return _createOutlines = require('./createOutlines');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Includes additional information that is useful to the UI, but redundant or nonsensical for
 * providers to include in their responses.
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

class Activation {

  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._disposables.add((0, (_workspaceViewsCompat || _load_workspaceViewsCompat()).consumeWorkspaceViewsCompat)(service => this.consumeWorkspaceViewsService(service)));

    this._editorService = new (_ActiveEditorRegistry || _load_ActiveEditorRegistry()).default((provider, editor) => {
      (_analytics || _load_analytics()).default.track('nuclide-outline-view-getoutline');
      return provider.getOutline(editor);
    }, {}, getActiveEditorRegistryEventSources());
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeOutlineProvider(provider) {
    return this._editorService.consumeProvider(provider);
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-outline-view');
    const { element } = toolBar.addButton({
      icon: 'list-unordered',
      callback: 'nuclide-outline-view:toggle',
      tooltip: 'Toggle Outline View',
      priority: 200
    });
    // Class added is not defined elsewhere, and is just used to mark the toolbar button
    element.classList.add('nuclide-outline-view-toolbar-button');
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      toolBar.removeItems();
    });
    this._disposables.add(disposable);
    return disposable;
  }

  _createOutlineViewPanelState() {
    (_analytics || _load_analytics()).default.track('nuclide-outline-view-show');
    return new (_OutlineViewPanel || _load_OutlineViewPanel()).OutlineViewPanelState((0, (_createOutlines || _load_createOutlines()).createOutlines)(this._editorService));
  }

  consumeWorkspaceViewsService(api) {
    const commandDisposable = atom.commands.add('atom-workspace', 'nuclide-outline-view:toggle', event => {
      api.toggle((_OutlineViewPanel || _load_OutlineViewPanel()).WORKSPACE_VIEW_URI, event.detail);
    });
    this._disposables.add(api.addOpener(uri => {
      if (uri === (_OutlineViewPanel || _load_OutlineViewPanel()).WORKSPACE_VIEW_URI) {
        return this._createOutlineViewPanelState();
      }
    }), () => api.destroyWhere(item => item instanceof (_OutlineViewPanel || _load_OutlineViewPanel()).OutlineViewPanelState), commandDisposable);
    return commandDisposable;
  }

  deserializeOutlineViewPanelState() {
    return this._createOutlineViewPanelState();
  }

  getOutlineViewResultsStream() {
    return {
      getResultsStream: () => this._editorService.getResultsStream()
    };
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);

// TODO this can be removed once we no longer want to support versions of Atom less than 1.17.0
// (D4973408)
function getActiveEditorRegistryEventSources() {
  return {
    activeEditors: (0, (_debounced || _load_debounced()).observeActivePaneItemDebounced)().switchMap(item => {
      if ((0, (_textEditor || _load_textEditor()).isValidTextEditor)(item)) {
        // Flow cannot understand the type refinement provided by the isValidTextEditor function,
        // so we have to cast.
        return _rxjsBundlesRxMinJs.Observable.of(item);
      } else if (item instanceof (_OutlineViewPanel || _load_OutlineViewPanel()).OutlineViewPanelState) {
        // Ignore switching to the outline view.
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      return _rxjsBundlesRxMinJs.Observable.of(null);
    }).distinctUntilChanged()
  };
}