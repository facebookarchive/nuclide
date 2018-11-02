"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "scrollbarMarkTypes", {
  enumerable: true,
  get: function () {
    return _constants().scrollbarMarkTypes;
  }
});

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _observePaneItemVisibility() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/observePaneItemVisibility"));

  _observePaneItemVisibility = function () {
    return data;
  };

  return data;
}

function _bindObservableAsProps() {
  const data = require("../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _renderReactRoot() {
  const data = require("../../../modules/nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
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

function _Model() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/Model"));

  _Model = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _immutable() {
  const data = _interopRequireDefault(require("immutable"));

  _immutable = function () {
    return data;
  };

  return data;
}

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

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _ScrollBar() {
  const data = _interopRequireDefault(require("./ScrollBar"));

  _ScrollBar = function () {
    return data;
  };

  return data;
}

function _themeColors() {
  const data = require("./themeColors");

  _themeColors = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
  constructor() {
    this._disposables = new (_UniversalDisposable().default)();
    this._model = new (_Model().default)({
      editorLines: _immutable().default.Map(),
      colors: null
    });

    this._disposables.add((0, _themeColors().getThemeChangeEvents)().subscribe(colors => {
      this._model.setState({
        colors: (0, _themeColors().getThemeColors)()
      });
    }), atom.workspace.observeTextEditors(editor => {
      const props = _rxjsCompatUmdMin.Observable.combineLatest(this._model.toObservable().map(state => ({
        markTypes: state.editorLines.get(editor),
        colors: state.colors
      })), (0, _observePaneItemVisibility().default)(editor), (0, _event().observableFromSubscribeFunction)(cb => // Take note: This is called every time a character is added/removed`.
      // $FlowFixMe - `editor.displayLayer is not a public API
      editor.displayLayer.onDidChange(cb)).startWith(null) // `editor.getScreenLineCount()` should be fast, since the
      // displayLayer keeps this data cached. However, it does force a
      // quick check to see if the cache needs to be recomputed.
      .map(() => editor.getScreenLineCount()).distinctUntilChanged()).map(([{
        markTypes,
        markers,
        colors
      }, editorIsVisible, screenLineCount]) => ({
        editorIsVisible,
        colors,
        markTypes,
        editor,
        screenLineCount
      }));

      const Component = (0, _bindObservableAsProps().bindObservableAsProps)(props, _ScrollBar().default);
      const node = (0, _renderReactRoot().renderReactRoot)(React.createElement(Component, null));
      const editorView = atom.views.getView(editor);
      const scrollBarView = editorView.getElementsByClassName('vertical-scrollbar')[0];
      (0, _nullthrows().default)(scrollBarView.parentNode).insertBefore(node, scrollBarView.nextSibling);

      this._disposables.addUntilDestroyed(editor, () => {
        node.remove();
      });
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeScrollbarIndicators(provider) {
    const disposable = new (_UniversalDisposable().default)((0, _event().observableFromSubscribeFunction)(cb => provider.onUpdate(cb)).subscribe(update => {
      const newEditorLines = Object.values(_constants().scrollbarMarkTypes).reduce((editorLines, _type) => {
        // Object.values returns mixed, so we have to tell Flow that we
        const type = _type;
        const typeMarks = update.markTypes.get(type) || new Set();
        return editorLines.updateIn([update.editor, type, provider], marks => typeMarks);
      }, this._model.state.editorLines);

      this._model.setState({
        editorLines: newEditorLines
      });
    }));

    this._disposables.add(disposable);

    return disposable;
  }

}

(0, _createPackage().default)(module.exports, Activation);