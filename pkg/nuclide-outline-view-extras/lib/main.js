"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
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

function _OutlineViewPanel() {
  const data = require("../../../modules/atom-ide-ui/pkg/atom-ide-outline-view/lib/OutlineViewPanel");

  _OutlineViewPanel = function () {
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
 *  strict-local
 * @format
 */
const NUX_OUTLINE_VIEW_TOUR = 'nuclide_outline_view_nux';
const NUX_OUTLINE_VIEW_ID = 4342;
const GK_NUX_OUTLINE_VIEW = 'mp_nuclide_outline_view_nux';

class Activation {
  constructor() {
    this._disposables = new (_UniversalDisposable().default)();
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('outline-view');
    const {
      element
    } = toolBar.addButton({
      icon: 'list-unordered',
      callback: 'outline-view:toggle',
      tooltip: 'Toggle Outline',
      priority: 200
    }); // Class added is not defined elsewhere, and is just used to mark the toolbar button

    element.classList.add('outline-view-toolbar-button');
    const disposable = new (_UniversalDisposable().default)(() => {
      toolBar.removeItems();
    });

    this._disposables.add(disposable);

    return disposable;
  }

  _createOutlineViewNuxTourModel() {
    const outlineViewToolbarIconNux = {
      content: 'Check out the new Outline!',
      selector: '.outline-view-toolbar-button',
      position: 'auto',
      completionPredicate: () => document.querySelector('div.outline-view') != null
    };
    const outlineViewPanelNux = {
      content: 'Click on a symbol to jump to its definition.',
      selector: 'div.outline-view',
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

    const isOutlineViewClosed = () => document.querySelector('div.outline-view') == null;

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

  consumeRegisterNuxService(addNewNux) {
    const disposable = addNewNux(this._createOutlineViewNuxTourModel());

    this._disposables.add(disposable);

    return disposable;
  }

  getHomeFragments() {
    return {
      feature: {
        title: 'Outline',
        icon: 'list-unordered',
        description: 'Displays major components of the current file (classes, methods, etc.)',
        command: () => {
          // eslint-disable-next-line nuclide-internal/atom-apis
          atom.workspace.open(_OutlineViewPanel().WORKSPACE_VIEW_URI, {
            searchAllPanes: true
          });
        }
      },
      priority: 2.5 // Between diff view and test runner

    };
  }

}

(0, _createPackage().default)(module.exports, Activation);