"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = showActionsMenu;

var _electron = _interopRequireDefault(require("electron"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _collection() {
  const data = require("../../../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const {
  remote
} = _electron.default;

if (!(remote != null)) {
  throw new Error("Invariant violation: \"remote != null\"");
}

const CODE_ACTIONS_TIMEOUT = 2000;

function showActionsMenu(editor, position, messagesAtPosition, diagnosticUpdater) {
  diagnosticUpdater.fetchCodeActions(editor, messagesAtPosition);
  return new (_UniversalDisposable().default)((0, _event().observableFromSubscribeFunction)(cb => diagnosticUpdater.observeCodeActionsForMessage(cb)).filter(codeActionsForMessage => {
    return messagesAtPosition.every(message => codeActionsForMessage.has(message));
  }).take(1).race(_RxMin.Observable.of(new WeakMap()).delay(CODE_ACTIONS_TIMEOUT)).subscribe(codeActionsForMessage => {
    const menu = new remote.Menu();
    const fixes = (0, _collection().arrayCompact)(messagesAtPosition.map(message => {
      const {
        fix
      } = message;

      if (fix == null) {
        return null;
      }

      const fixTitle = fix.title == null ? 'Fix' : fix.title;
      return {
        title: `${fixTitle} (${message.providerName})`,
        apply: () => diagnosticUpdater.applyFix(message)
      };
    }));
    const actions = (0, _collection().arrayFlatten)(messagesAtPosition.map(message => {
      const codeActions = codeActionsForMessage.get(message);

      if (codeActions == null) {
        return [];
      }

      return Array.from(codeActions).map(([title, codeAction]) => ({
        title,
        apply: () => codeAction.apply()
      }));
    }));
    [...fixes, ...actions].forEach(action => {
      menu.append(new remote.MenuItem({
        type: 'normal',
        label: action.title,
        click: () => {
          action.apply();
        }
      }));
    });
    const screenPosition = editor.screenPositionForBufferPosition(position);
    const editorView = atom.views.getView(editor);
    const pixelPosition = editorView.pixelPositionForScreenPosition(screenPosition); // Pixel coordinates are relative to the editor's scroll view.

    const scrollView = editorView.querySelector('.scroll-view');

    if (!(scrollView != null)) {
      throw new Error("Invariant violation: \"scrollView != null\"");
    }

    const boundingRect = scrollView.getBoundingClientRect();
    menu.popup({
      x: Math.round(boundingRect.left + pixelPosition.left - editorView.getScrollLeft()),
      y: Math.round(boundingRect.top + pixelPosition.top - editorView.getScrollTop()),
      positioningItem: 0,
      async: true
    });
  }));
}