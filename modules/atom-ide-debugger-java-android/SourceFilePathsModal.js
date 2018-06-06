'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SourceFilePathsModal = undefined;

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../nuclide-commons-ui/AtomInput');
}

var _ListView;

function _load_ListView() {
  return _ListView = require('../nuclide-commons-ui/ListView');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../nuclide-commons-ui/ButtonGroup');
}

var _Button;

function _load_Button() {
  return _Button = require('../nuclide-commons-ui/Button');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _analytics;

function _load_analytics() {
  return _analytics = require('../nuclide-commons/analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class SourceFilePathsModal extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._savedSourcePaths = [], this.state = {
      currentPaths: this.props.initialSourcePaths.slice(0)
    }, this._addItem = () => {
      const text = (0, (_nullthrows || _load_nullthrows()).default)(this._newSourcePath).getText().trim().replace(/;/g, ''); // Do not allow semicolons since we are using them
      // to delimit paths. TODO: handle paths that actually contain ;'s?

      if (text !== '') {
        this.state.currentPaths.push(text);
        (0, (_nullthrows || _load_nullthrows()).default)(this._newSourcePath).setText('');
        this.setState({
          currentPaths: this.state.currentPaths
        });
      }
    }, this._cancelClick = () => {
      this.setState({
        currentPaths: this._savedSourcePaths
      });
      this.props.onClosed();
      (0, (_analytics || _load_analytics()).track)('fb-java-debugger-source-dialog-cancel', {});
    }, this._handleSaveClick = () => {
      this._addItem();
      this._savedSourcePaths = this.state.currentPaths.slice(0);
      this.props.sourcePathsChanged(this._savedSourcePaths);
      this.props.onClosed();
      (0, (_analytics || _load_analytics()).track)('fb-java-debugger-source-dialog-saved', {});
    }, _temp;
  }

  _getSourcePathControls() {
    const items = [];
    const paths = Array.from(new Set(this.state.currentPaths));

    if (paths.length === 0) {
      return [_react.createElement(
        (_ListView || _load_ListView()).ListViewItem,
        { key: 0, index: 0 },
        _react.createElement(
          'div',
          null,
          _react.createElement(
            'i',
            null,
            '(No custom source file paths have been specified)'
          )
        )
      )];
    }

    paths.forEach((path, idx) => {
      items.push(_react.createElement(
        (_ListView || _load_ListView()).ListViewItem,
        { key: idx, index: idx },
        _react.createElement(
          'div',
          { className: 'block' },
          _react.createElement('i', {
            className: 'icon icon-x nuclide-source-content-x',
            title: 'Remove path',
            onClick: () => {
              this.state.currentPaths.splice(idx, 1);
              this.setState({
                currentPaths: this.state.currentPaths
              });
            }
          }),
          _react.createElement(
            'span',
            null,
            path
          )
        )
      ));
    });
    return items;
  }

  render() {
    const sourcePaths = this._getSourcePathControls();
    return _react.createElement(
      'div',
      { className: 'sourcepath-modal' },
      _react.createElement(
        'div',
        { className: 'select-list' },
        _react.createElement(
          'h2',
          null,
          'Configure source file paths:'
        ),
        _react.createElement(
          'div',
          { className: 'nuclide-source-add-content' },
          _react.createElement(
            'span',
            null,
            'Nuclide will automatically search for source in your project root paths. You can add additional search paths here.'
          )
        ),
        _react.createElement(
          'div',
          { className: 'sourcepath-add-bar' },
          _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            className: 'sourcepath-pane',
            ref: input => {
              this._newSourcePath = input;
            },
            initialValue: '',
            autofocus: true,
            placeholderText: 'Add a source file path...'
          }),
          _react.createElement(
            (_Button || _load_Button()).Button,
            {
              onClick: this._addItem,
              title: 'Add Path',
              className: 'sourcepath-add-button' },
            _react.createElement('i', { className: 'icon icon-plus' })
          )
        ),
        _react.createElement(
          'div',
          { className: 'sourcepath-sources' },
          _react.createElement(
            (_ListView || _load_ListView()).ListView,
            { alternateBackground: true },
            sourcePaths
          )
        )
      ),
      _react.createElement(
        'div',
        {
          className: 'sourcepath-buttons',
          style: { display: 'flex', flexDirection: 'row-reverse' } },
        _react.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _react.createElement(
            (_Button || _load_Button()).Button,
            { tabIndex: '17', onClick: this._cancelClick },
            'Cancel'
          ),
          _react.createElement(
            (_Button || _load_Button()).Button,
            {
              buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
              tabIndex: '16',
              onClick: this._handleSaveClick },
            'Save'
          )
        )
      )
    );
  }

}
exports.SourceFilePathsModal = SourceFilePathsModal; /**
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