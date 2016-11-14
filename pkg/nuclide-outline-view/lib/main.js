'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _ActiveEditorRegistry;

function _load_ActiveEditorRegistry() {
  return _ActiveEditorRegistry = _interopRequireDefault(require('../../commons-atom/ActiveEditorRegistry'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NUX_OUTLINE_VIEW_TOUR = 'nuclide_outline_view_nux';
const NUX_OUTLINE_VIEW_ID = 4342;
const GK_NUX_OUTLINE_VIEW = 'mp_nuclide_outline_view_nux';

/**
 * Includes additional information that is useful to the UI, but redundant or nonsensical for
 * providers to include in their responses.
 */
let Activation = class Activation {

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
      triggerCallback: triggerCallback
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
    this._disposables = new _atom.CompositeDisposable();

    this._editorService = new (_ActiveEditorRegistry || _load_ActiveEditorRegistry()).default((provider, editor) => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-outline-view-getoutline');
      return provider.getOutline(editor);
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeOutlineProvider(provider) {
    return this._editorService.consumeProvider(provider);
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-outline-view');

    var _toolBar$addButton = toolBar.addButton({
      icon: 'list-unordered',
      callback: 'nuclide-outline-view:toggle',
      tooltip: 'Toggle Outline View',
      priority: 200
    });

    const element = _toolBar$addButton.element;
    // Class added is not defined elsewhere, and is just used to mark the toolbar button

    element.classList.add('nuclide-outline-view-toolbar-button');
    const disposable = new _atom.Disposable(() => {
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
    this._disposables.add(api.registerFactory({
      id: 'nuclide-outline-view',
      name: 'Outline View',
      iconName: 'list-unordered',
      toggleCommand: 'nuclide-outline-view:toggle',
      defaultLocation: 'right-panel',
      create: () => this._createOutlineViewPanelState(),
      isInstance: item => item instanceof (_OutlineViewPanel || _load_OutlineViewPanel()).OutlineViewPanelState
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

};
exports.default = (0, (_createPackage || _load_createPackage()).default)(Activation);
module.exports = exports['default'];