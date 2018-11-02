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

var _electron = _interopRequireDefault(require("electron"));

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
class Activation {
  constructor(state) {
    this._disposables = new (_UniversalDisposable().default)(_electron.default.remote.require('scrollbar-style').onDidChangePreferredScrollbarStyle(style => {
      // Copied from https://github.com/atom/atom/blob/v1.32.0/src/workspace-element.js#L36
      // Once we upstream a fix
      const workspaceEl = atom.views.getView(atom.workspace);

      switch (style) {
        case 'legacy':
          workspaceEl.classList.remove('scrollbars-visible-when-scrolling');
          workspaceEl.classList.add('scrollbars-visible-always');
          break;

        case 'overlay':
          workspaceEl.classList.remove('scrollbars-visible-always');
          workspaceEl.classList.add('scrollbars-visible-when-scrolling');
          break;

        default:
          style;
          throw new Error(`Invalid scrollbar style: ${style}`);
      } // Force the scrollbars to be redrawn. This is necessary because of Chromium bug 454346,
      // which causes Chrome not to update scrollbar styles correctly. We should be able to
      // remove it when Atom upgrades to a version of electron with a Chromium >= 62
      // (electron 3). (Verfiy before removing by trying the repo in the README.)
      //
      // This method was chosen because (1) it worked and (2) it didn't mess with the file tree.
      // (Removing and re-adding the node, for example, would cause an empty tree to be drawn
      // until you interacted with it, at which point React Virtualized would redraw the
      // contents).


      for (const el of document.getElementsByClassName('nuclide-scrollbar-style-fix')) {
        const originalDisplayStyle = window.getComputedStyle(el).display;
        el.style.display = 'none';
        window.requestAnimationFrame(() => {
          el.style.display = originalDisplayStyle;
        });
      }
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

}

(0, _createPackage().default)(module.exports, Activation);