'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _reactForAtom = require('react-for-atom');

var _Button;

function _load_Button() {
  return _Button = require('../../../../nuclide-ui/Button');
}

let BasicStatsSectionComponent = class BasicStatsSectionComponent extends _reactForAtom.React.Component {

  updateToolbarJewel(value) {
    this.props.updateToolbarJewel(value);
  }

  render() {
    const stats = [{
      name: 'CPU',
      value: `${ this.props.cpuPercentage.toFixed(0) }%`
    }, {
      name: 'Heap',
      value: `${ this.props.heapPercentage.toFixed(1) }%`
    }, {
      name: 'Memory',
      value: `${ Math.floor(this.props.memory / 1024 / 1024) }MB`
    }, {
      name: 'Handles',
      value: `${ this.props.activeHandles }`
    }, {
      name: 'Child processes',
      value: `${ this.props.activeHandlesByType.childprocess.length }`
    }, {
      name: 'Event loop',
      value: `${ this.props.activeRequests }`
    }];

    const updateToolbarJewel = this.updateToolbarJewel;
    return _reactForAtom.React.createElement(
      'table',
      { className: 'table' },
      _reactForAtom.React.createElement(
        'thead',
        null,
        _reactForAtom.React.createElement(
          'tr',
          null,
          _reactForAtom.React.createElement(
            'th',
            { width: '30%' },
            'Metric'
          ),
          _reactForAtom.React.createElement(
            'th',
            { width: '50%' },
            'Value'
          ),
          _reactForAtom.React.createElement(
            'th',
            { width: '20%', className: 'text-right' },
            'Toolbar'
          )
        )
      ),
      _reactForAtom.React.createElement(
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
          return _reactForAtom.React.createElement(
            'tr',
            Object.assign({}, props, { key: s }),
            _reactForAtom.React.createElement(
              'th',
              null,
              stat.name
            ),
            _reactForAtom.React.createElement(
              'td',
              null,
              stat.value
            ),
            _reactForAtom.React.createElement(
              'td',
              { className: 'text-right' },
              _reactForAtom.React.createElement(
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
};
exports.default = BasicStatsSectionComponent;
module.exports = exports['default'];