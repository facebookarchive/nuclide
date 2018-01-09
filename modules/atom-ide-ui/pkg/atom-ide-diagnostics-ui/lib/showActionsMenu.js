'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = showActionsMenu;

var _electron = _interopRequireDefault(require('electron'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { remote } = _electron.default; /**
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

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

const CODE_ACTIONS_TIMEOUT = 2000;

function showActionsMenu(editor, position, messagesAtPosition, diagnosticUpdater) {
  diagnosticUpdater.fetchCodeActions(editor, messagesAtPosition);

  return new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_event || _load_event()).observableFromSubscribeFunction)(cb => diagnosticUpdater.observeCodeActionsForMessage(cb)).filter(codeActionsForMessage => {
    return messagesAtPosition.every(message => codeActionsForMessage.has(message));
  }).take(1).race(_rxjsBundlesRxMinJs.Observable.of(new WeakMap()).delay(CODE_ACTIONS_TIMEOUT)).subscribe(codeActionsForMessage => {
    const currentWindow = remote.getCurrentWindow();
    const menu = new remote.Menu();
    const fixes = (0, (_collection || _load_collection()).arrayCompact)(messagesAtPosition.map(message => {
      const { fix } = message;
      if (fix == null) {
        return null;
      }
      const fixTitle = fix.title == null ? 'Fix' : fix.title;
      return {
        title: `${fixTitle} (${message.providerName})`,
        apply: () => diagnosticUpdater.applyFix(message)
      };
    }));
    const actions = (0, (_collection || _load_collection()).arrayFlatten)(messagesAtPosition.map(message => {
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
    const pixelPosition = editorView.pixelPositionForScreenPosition(screenPosition);
    // Pixel coordinates are relative to the editor's scroll view.
    const scrollView = editorView.querySelector('.scroll-view');

    if (!(scrollView != null)) {
      throw new Error('Invariant violation: "scrollView != null"');
    }

    const boundingRect = scrollView.getBoundingClientRect();
    menu.popup(currentWindow, Math.round(boundingRect.left + pixelPosition.left - editorView.getScrollLeft()), Math.round(boundingRect.top + pixelPosition.top - editorView.getScrollTop()), 0);
  }));
}