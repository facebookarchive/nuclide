"use strict";

function _ActiveEditorRegistry() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/ActiveEditorRegistry"));

  _ActiveEditorRegistry = function () {
    return data;
  };

  return data;
}

function _debounced() {
  const data = require("../../../../nuclide-commons-atom/debounced");

  _debounced = function () {
    return data;
  };

  return data;
}

function _textEditor() {
  const data = require("../../../../nuclide-commons-atom/text-editor");

  _textEditor = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
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

function _analytics() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _destroyItemWhere() {
  const data = require("../../../../nuclide-commons-atom/destroyItemWhere");

  _destroyItemWhere = function () {
    return data;
  };

  return data;
}

function _OutlineViewPanel() {
  const data = require("./OutlineViewPanel");

  _OutlineViewPanel = function () {
    return data;
  };

  return data;
}

function _createOutlines() {
  const data = require("./createOutlines");

  _createOutlines = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    this._disposables = new (_UniversalDisposable().default)(this.registerOpenerAndCommand());
    this._editorService = new (_ActiveEditorRegistry().default)((provider, editor) => provider.getOutline(editor), {}, getActiveEditorRegistryEventSources());
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeOutlineProvider(provider) {
    return this._editorService.consumeProvider(provider);
  }

  _createOutlineViewPanelState() {
    _analytics().default.track('outline-view-show');

    return new (_OutlineViewPanel().OutlineViewPanelState)((0, _createOutlines().createOutlines)(this._editorService));
  }

  registerOpenerAndCommand() {
    const commandDisposable = atom.commands.add('atom-workspace', 'outline-view:toggle', () => {
      atom.workspace.toggle(_OutlineViewPanel().WORKSPACE_VIEW_URI);
    });
    return new (_UniversalDisposable().default)(atom.workspace.addOpener(uri => {
      if (uri === _OutlineViewPanel().WORKSPACE_VIEW_URI) {
        return this._createOutlineViewPanelState();
      }
    }), () => {
      (0, _destroyItemWhere().destroyItemWhere)(item => item instanceof _OutlineViewPanel().OutlineViewPanelState);
    }, commandDisposable);
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

(0, _createPackage().default)(module.exports, Activation); // TODO this can be removed once we no longer want to support versions of Atom less than 1.17.0
// (D4973408)

function getActiveEditorRegistryEventSources() {
  return {
    activeEditors: (0, _debounced().observeActivePaneItemDebounced)().switchMap(item => {
      if ((0, _textEditor().isValidTextEditor)(item)) {
        return _RxMin.Observable.of(item);
      } else if (item instanceof _OutlineViewPanel().OutlineViewPanelState) {
        // Ignore switching to the outline view.
        return _RxMin.Observable.empty();
      }

      return _RxMin.Observable.of(null);
    }).distinctUntilChanged()
  };
}