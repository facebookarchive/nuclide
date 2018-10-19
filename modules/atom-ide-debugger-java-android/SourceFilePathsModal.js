"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SourceFilePathsModal = void 0;

var React = _interopRequireWildcard(require("react"));

function _AtomInput() {
  const data = require("../nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _ListView() {
  const data = require("../nuclide-commons-ui/ListView");

  _ListView = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../nuclide-commons-ui/Button");

  _Button = function () {
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

function _analytics() {
  const data = require("../nuclide-commons/analytics");

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
class SourceFilePathsModal extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._savedSourcePaths = [], this.state = {
      currentPaths: this.props.initialSourcePaths.slice(0)
    }, this._addItem = () => {
      const text = (0, _nullthrows().default)(this._newSourcePath).getText().trim().replace(/;/g, ''); // Do not allow semicolons since we are using them
      // to delimit paths. TODO: handle paths that actually contain ;'s?

      if (text !== '') {
        this.state.currentPaths.push(text);
        (0, _nullthrows().default)(this._newSourcePath).setText('');
        this.setState({
          // TODO: (wbinnssmith) T30771435 this setState depends on current state
          // and should use an updater function rather than an object
          // eslint-disable-next-line react/no-access-state-in-setstate
          currentPaths: this.state.currentPaths
        });
      }
    }, this._cancelClick = () => {
      this.setState({
        currentPaths: this._savedSourcePaths
      });
      this.props.onClosed();
      (0, _analytics().track)('fb-java-debugger-source-dialog-cancel', {});
    }, this._handleSaveClick = () => {
      this._addItem();

      this._savedSourcePaths = this.state.currentPaths.slice(0);
      this.props.sourcePathsChanged(this._savedSourcePaths);
      this.props.onClosed();
      (0, _analytics().track)('fb-java-debugger-source-dialog-saved', {});
    }, _temp;
  }

  _getSourcePathControls() {
    const items = [];
    const paths = Array.from(new Set(this.state.currentPaths));

    if (paths.length === 0) {
      return [React.createElement(_ListView().ListViewItem, {
        key: 0,
        index: 0
      }, React.createElement("div", null, React.createElement("i", null, "(No custom source file paths have been specified)")))];
    }

    paths.forEach((path, idx) => {
      items.push(React.createElement(_ListView().ListViewItem, {
        key: idx,
        index: idx
      }, React.createElement("div", {
        className: "block"
      }, React.createElement("i", {
        className: "icon icon-x nuclide-source-content-x",
        title: "Remove path",
        onClick: () => {
          this.state.currentPaths.splice(idx, 1);
          this.setState({
            // TODO: (wbinnssmith) T30771435 this setState depends on current state
            // and should use an updater function rather than an object
            // eslint-disable-next-line react/no-access-state-in-setstate
            currentPaths: this.state.currentPaths
          });
        }
      }), React.createElement("span", null, path))));
    });
    return items;
  }

  render() {
    const sourcePaths = this._getSourcePathControls();

    return React.createElement("div", {
      className: "sourcepath-modal"
    }, React.createElement("div", {
      className: "select-list"
    }, React.createElement("h2", null, "Configure source file paths:"), React.createElement("div", {
      className: "nuclide-source-add-content"
    }, React.createElement("span", null, "Nuclide will automatically search for source in your project root paths. You can add additional search paths here.")), React.createElement("div", {
      className: "sourcepath-add-bar"
    }, React.createElement(_AtomInput().AtomInput, {
      className: "sourcepath-pane",
      ref: input => {
        this._newSourcePath = input;
      },
      initialValue: "",
      autofocus: true,
      placeholderText: "Add a source file path..."
    }), React.createElement(_Button().Button, {
      onClick: this._addItem,
      title: "Add Path",
      className: "sourcepath-add-button"
    }, React.createElement("i", {
      className: "icon icon-plus"
    }))), React.createElement("div", {
      className: "sourcepath-sources"
    }, React.createElement(_ListView().ListView, {
      alternateBackground: true
    }, sourcePaths))), React.createElement("div", {
      className: "sourcepath-buttons",
      style: {
        display: 'flex',
        flexDirection: 'row-reverse'
      }
    }, React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
      tabIndex: "17",
      onClick: this._cancelClick
    }, "Cancel"), React.createElement(_Button().Button, {
      buttonType: _Button().ButtonTypes.PRIMARY,
      tabIndex: "16",
      onClick: this._handleSaveClick
    }, "Save"))));
  }

}

exports.SourceFilePathsModal = SourceFilePathsModal;