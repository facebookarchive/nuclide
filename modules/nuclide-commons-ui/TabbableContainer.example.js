'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TabbableContainerExamples = undefined;

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('./AtomInput');
}

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _Button;

function _load_Button() {
  return _Button = require('./Button');
}

var _RadioGroup;

function _load_RadioGroup() {
  return _RadioGroup = _interopRequireDefault(require('./RadioGroup'));
}

var _TabbableContainer;

function _load_TabbableContainer() {
  return _TabbableContainer = _interopRequireDefault(require('./TabbableContainer'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const labels = ['radio 1', 'radio 2', 'radio 3'];

class FormExample extends _react.Component {
  constructor(props) {
    super(props);

    this.onSelectedChange = selectedIndex => {
      this.setState({
        selectedIndex
      });
    };

    this.state = {
      selectedIndex: 0
    };
  }

  render() {
    return _react.createElement(
      'div',
      null,
      _react.createElement(
        (_Block || _load_Block()).Block,
        null,
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          disabled: false,
          initialValue: 'input field 1',
          placeholderText: 'placeholder text'
        })
      ),
      _react.createElement(
        (_Block || _load_Block()).Block,
        null,
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          disabled: false,
          initialValue: 'input field 2',
          placeholderText: 'placeholder text'
        })
      ),
      _react.createElement(
        (_Block || _load_Block()).Block,
        null,
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          disabled: false,
          initialValue: 'input field 3',
          placeholderText: 'placeholder text'
        })
      ),
      _react.createElement(
        (_Block || _load_Block()).Block,
        null,
        _react.createElement((_RadioGroup || _load_RadioGroup()).default, {
          selectedIndex: this.state.selectedIndex,
          optionLabels: labels,
          onSelectedChange: this.onSelectedChange
        })
      ),
      _react.createElement(
        (_Block || _load_Block()).Block,
        null,
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          disabled: false,
          initialValue: 'input field 4',
          placeholderText: 'placeholder text'
        })
      ),
      _react.createElement(
        (_Block || _load_Block()).Block,
        null,
        _react.createElement(
          (_Button || _load_Button()).Button,
          { className: 'inline-block', size: 'SMALL' },
          'button 1'
        ),
        _react.createElement(
          (_Button || _load_Button()).Button,
          { className: 'inline-block', size: 'SMALL' },
          'button 2'
        ),
        _react.createElement(
          (_Button || _load_Button()).Button,
          { className: 'inline-block', size: 'SMALL' },
          'button 3'
        )
      )
    );
  }
}

const ContainedTabbableContainerExample = () => _react.createElement(
  (_TabbableContainer || _load_TabbableContainer()).default,
  { contained: true },
  _react.createElement(FormExample, null)
);

const UncontainedTabbableContainerExample = () => _react.createElement(
  (_TabbableContainer || _load_TabbableContainer()).default,
  { contained: false },
  _react.createElement(FormExample, null)
);

const TabbableContainerExamples = exports.TabbableContainerExamples = {
  sectionName: 'TabbableContainer',
  description: 'Allows tabbing and shift-tabbing to change the focus of the inputs.',
  examples: [{
    title: 'Contained (focus will be contained in this section)',
    component: ContainedTabbableContainerExample
  }, {
    title: 'Uncontained',
    component: UncontainedTabbableContainerExample
  }]
};