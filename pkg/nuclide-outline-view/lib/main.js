'use strict';

var _ActiveEditorRegistry;

function _load_ActiveEditorRegistry() {
  return _ActiveEditorRegistry = _interopRequireDefault(require('../../commons-atom/ActiveEditorRegistry'));
}

var _debounced;

function _load_debounced() {
  return _debounced = require('../../commons-atom/debounced');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../commons-atom/text-editor');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
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

const NUX_OUTLINE_VIEW_TOUR = 'nuclide_outline_view_nux'; /**
                                                           * Copyright (c) 2015-present, Facebook, Inc.
                                                           * All rights reserved.
                                                           *
                                                           * This source code is licensed under the license found in the LICENSE file in
                                                           * the root directory of this source tree.
                                                           *
                                                           * 
                                                           */

const NUX_OUTLINE_VIEW_ID = 4342;
const GK_NUX_OUTLINE_VIEW = 'mp_nuclide_outline_view_nux';

/**
 * Includes additional information that is useful to the UI, but redundant or nonsensical for
 * providers to include in their responses.
 */


class Activation {

  _createOutlineViewNuxTourModel() {
    const outlineViewToolbarIconNux = {
      content: 'Check out the new Outline View!',
      selector: '.nuclide-outline-view-toolbar-button',
      position: 'auto',
      completionPredicate: () => document.querySelector('div.nuclide-outline-view') != null
    };

    const outlineViewPanelNux = {
      content: 'Click on a symbol to jump to its definition.',
      selector: 'div.pane-item.nuclide-outline-view',
      position: 'left'
    };

    const isValidFileTypeForNux = editor => {
      if (editor == null) {
        return false;
      }
      const path = editor.getPath();
      if (path == null) {
        return false;
      }
      return path.endsWith('.js') || path.endsWith('.php');
    };

    const isOutlineViewClosed = () => document.querySelector('.nuclide-outline-view') == null;
    const triggerCallback = editor => isOutlineViewClosed() && isValidFileTypeForNux(editor);

    const nuxTriggerModel = {
      triggerType: 'editor',
      triggerCallback
    };

    const outlineViewNuxTour = {
      id: NUX_OUTLINE_VIEW_ID,
      name: NUX_OUTLINE_VIEW_TOUR,
      nuxList: [outlineViewToolbarIconNux, outlineViewPanelNux],
      trigger: nuxTriggerModel,
      gatekeeperID: GK_NUX_OUTLINE_VIEW
    };

    return outlineViewNuxTour;
  }

  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    this._editorService = new (_ActiveEditorRegistry || _load_ActiveEditorRegistry()).default((provider, editor) => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-outline-view-getoutline');
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
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-outline-view-show');
    return new (_OutlineViewPanel || _load_OutlineViewPanel()).OutlineViewPanelState((0, (_createOutlines || _load_createOutlines()).createOutlines)(this._editorService));
  }

  consumeWorkspaceViewsService(api) {
    this._disposables.add(api.addOpener(uri => {
      if (uri === (_OutlineViewPanel || _load_OutlineViewPanel()).WORKSPACE_VIEW_URI) {
        return this._createOutlineViewPanelState();
      }
    }), () => api.destroyWhere(item => item instanceof (_OutlineViewPanel || _load_OutlineViewPanel()).OutlineViewPanelState), atom.commands.add('atom-workspace', 'nuclide-outline-view:toggle', event => {
      api.toggle((_OutlineViewPanel || _load_OutlineViewPanel()).WORKSPACE_VIEW_URI, event.detail);
    }));
  }

  deserializeOutlineViewPanelState() {
    return this._createOutlineViewPanelState();
  }

  getOutlineViewResultsStream() {
    return {
      getResultsStream: () => this._editorService.getResultsStream()
    };
  }

  consumeRegisterNuxService(addNewNux) {
    const disposable = addNewNux(this._createOutlineViewNuxTourModel());
    this._disposables.add(disposable);
    return disposable;
  }

  getHomeFragments() {
    return {
      feature: {
        title: 'Outline View',
        icon: 'list-unordered',
        description: 'Displays major components of the current file (classes, methods, etc.)',
        command: () => {
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-outline-view:toggle', { visible: true });
        }
      },
      priority: 2.5 };
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);

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