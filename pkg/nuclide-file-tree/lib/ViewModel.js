"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _observePaneItemVisibility() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/observePaneItemVisibility"));

  _observePaneItemVisibility = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _renderReactRoot() {
  const data = require("../../../modules/nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
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

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _observableFromReduxStore() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/observableFromReduxStore"));

  _observableFromReduxStore = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _FileTreeSidebarComponent() {
  const data = _interopRequireDefault(require("../components/FileTreeSidebarComponent"));

  _FileTreeSidebarComponent = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("./redux/Selectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _Constants() {
  const data = require("./Constants");

  _Constants = function () {
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
 *  strict-local
 * @format
 */
class ViewModel {
  constructor(store) {
    this._disposed = new _rxjsCompatUmdMin.ReplaySubject(1);
    this._store = store;
    this._element = (0, _renderReactRoot().renderReactRoot)(React.createElement(_FileTreeSidebarComponent().default, {
      store: this._store,
      ref: component => {
        this._component = component;
      }
    }), 'FileTreeRoot');
    this._disposable = new (_UniversalDisposable().default)((0, _observePaneItemVisibility().default)(this).filter(Boolean).subscribe(() => {
      // If "Reveal File on Switch" is enabled, ensure the scroll position is synced to where the
      // user expects when the side bar shows the file tree.
      if (_featureConfig().default.get(_Constants().REVEAL_FILE_ON_SWITCH_SETTING)) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'tree-view:reveal-active-file');
      }

      this._store.dispatch(Actions().clearFilter());
    }), () => {
      this._disposed.next();

      _reactDom.default.unmountComponentAtNode(this._element);
    });
  }

  destroy() {
    this._disposable.dispose();
  }

  getElement() {
    return this._element;
  }

  isFocused() {
    return this._component != null && this._component.isFocused();
  }

  focus() {
    this._component != null && this._component.focus();
  }

  getTitle() {
    return Selectors().getSidebarTitle(this._store.getState());
  } // This is unfortunate, but Atom uses getTitle() to get the text in the tab and getPath() to get
  // the text in the tool-tip.


  getPath() {
    return Selectors().getSidebarPath(this._store.getState());
  }

  getDefaultLocation() {
    return 'left';
  }

  getAllowedLocations() {
    return ['left', 'right'];
  }

  getPreferredWidth() {
    return _Constants().PREFERRED_WIDTH;
  }

  getIconName() {
    return 'file-directory';
  }

  getURI() {
    return _Constants().WORKSPACE_VIEW_URI;
  }

  serialize() {
    return {
      deserializer: 'nuclide.FileTreeSidebarComponent'
    };
  }

  copy() {
    // The file tree store wasn't written to support multiple instances, so try to prevent it.
    return false;
  }

  isPermanentDockItem() {
    return true;
  }

  onDidChangeTitle(callback) {
    return new (_UniversalDisposable().default)((0, _observableFromReduxStore().default)(this._store).map(Selectors().getSidebarTitle).distinctUntilChanged().takeUntil(this._disposed).subscribe(callback));
  }

  onDidChangePath(callback) {
    return new (_UniversalDisposable().default)((0, _observableFromReduxStore().default)(this._store).map(Selectors().getSidebarPath).distinctUntilChanged().takeUntil(this._disposed).subscribe(callback));
  }

}

exports.default = ViewModel;