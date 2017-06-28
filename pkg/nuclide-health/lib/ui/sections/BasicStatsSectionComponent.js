'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BasicStatsSectionComponent extends _react.default.Component {

  updateToolbarJewel(value) {
    this.props.updateToolbarJewel(value);
  }

  render() {
    const stats = [{
      name: 'CPU',
      value: `${this.props.cpuPercentage.toFixed(0)}%`
    }, {
      name: 'Heap',
      value: `${this.props.heapPercentage.toFixed(1)}%`
    }, {
      name: 'Memory',
      value: `${Math.floor(this.props.memory / 1024 / 1024)}MB`
    }, {
      name: 'Handles',
      value: `${this.props.activeHandles}`
    }, {
      name: 'Child processes',
      value: `${this.props.activeHandlesByType.childprocess.length}`
    }, {
      name: 'Event loop',
      value: `${this.props.activeRequests}`
    }];

    const updateToolbarJewel = this.updateToolbarJewel;
    return _react.default.createElement(
      'table',
      { className: 'table' },
      _react.default.createElement(
        'thead',
        null,
        _react.default.createElement(
          'tr',
          null,
          _react.default.createElement(
            'th',
            { width: '30%' },
            'Metric'
          ),
          _react.default.createElement(
            'th',
            { width: '50%' },
            'Value'
          ),
          _react.default.createElement(
            'th',
            { width: '20%', className: 'text-right' },
            'Toolbar'
          )
        )
      ),
      _react.default.createElement(
        'tbody',
        null,
        stats.map((stat, s) => {
          const props = {};
          let jewelLabel = 'Show';
          let jewelValue = stat.name;
          if (this.props.toolbarJewel === stat.name) {
            props.className = 'selected';
            jewelLabel = 'Hide';
            jewelValue = 'None';
          }
          return _react.default.createElement(
            'tr',
            Object.assign({}, props, { key: s }),
            _react.default.createElement(
              'th',
              null,
              stat.name
            ),
            _react.default.createElement(
              'td',
              null,
              stat.value
            ),
            _react.default.createElement(
              'td',
              { className: 'text-right' },
              _react.default.createElement(
                (_Button || _load_Button()).Button,
                {
                  size: (_Button || _load_Button()).ButtonSizes.EXTRA_SMALL,
                  onClick: updateToolbarJewel.bind(this, jewelValue) },
                jewelLabel
              )
            )
          );
        })
      )
    );
  }
}
exports.default = BasicStatsSectionComponent; /**
                                               * Copyright (c) 2015-present, Facebook, Inc.
                                               * All rights reserved.
                                               *
                                               * This source code is licensed under the license found in the LICENSE file in
                                               * the root directory of this source tree.
                                               *
                                               * 
                                               * @format
                                               */