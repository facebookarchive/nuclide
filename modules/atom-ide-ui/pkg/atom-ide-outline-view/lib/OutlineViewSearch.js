"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OutlineViewSearchComponent = void 0;

var React = _interopRequireWildcard(require("react"));

function _AtomInput() {
  const data = require("../../../../nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("../../../../nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _debounce() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/debounce"));

  _debounce = function () {
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class OutlineViewSearchComponent extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.SEARCH_PLACEHOLDER = 'Filter', this.DEBOUNCE_TIME = 100, this._handleInputRef = element => {
      this._inputRef = element;
    }, this._onConfirm = () => {
      const firstElement = this._findFirstResult(this.props.searchResults, this.props.outlineTrees);

      if (firstElement == null) {
        return;
      }

      const pane = atom.workspace.paneForItem(this.props.editor);

      if (pane == null) {
        return;
      }

      _analytics().default.track('outline-view:search-enter');

      pane.activate();
      pane.activateItem(this.props.editor);
      const landingPosition = firstElement.landingPosition != null ? firstElement.landingPosition : firstElement.startPosition;
      (0, _goToLocation().goToLocationInEditor)(this.props.editor, {
        line: landingPosition.row,
        column: landingPosition.column
      });
      this.props.onQueryChange('');
    }, this._onDidChange = (0, _debounce().default)(query => {
      _analytics().default.track('outline-view:change-query');

      this.props.onQueryChange(query);
    }, this.DEBOUNCE_TIME), this._onDidClear = () => {
      this.props.onQueryChange('');
    }, _temp;
  }

  focus() {
    if (this._inputRef != null) {
      this._inputRef.focus();
    }
  }

  _findFirstResult(searchResults, tree) {
    for (let i = 0; i < tree.length; i++) {
      const result = searchResults.get(tree[i]);

      if (result && result.matches) {
        return tree[i];
      }

      const child = this._findFirstResult(searchResults, tree[i].children);

      if (child) {
        return child;
      }
    }
  }

  render() {
    return React.createElement("div", {
      className: "outline-view-search-bar"
    }, React.createElement(_AtomInput().AtomInput, {
      className: "outline-view-search-pane",
      onConfirm: this._onConfirm,
      onCancel: this._onDidClear,
      onDidChange: this._onDidChange,
      placeholderText: this.props.query || this.SEARCH_PLACEHOLDER,
      ref: this._handleInputRef,
      value: this.props.query,
      size: "sm"
    }), this.props.query.length > 0 ? React.createElement(_Icon().Icon, {
      icon: "x",
      className: "outline-view-search-clear",
      onClick: this._onDidClear
    }) : null);
  }

}

exports.OutlineViewSearchComponent = OutlineViewSearchComponent;