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

let HandlesTableComponent = class HandlesTableComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.previousHandleSummaries = {};
  }

  getHandleSummaries(handles) {
    const handleSummaries = {};
    handles.forEach((handle, h) => {
      const summarizedHandle = {};
      this.props.columns.forEach((column, c) => {
        summarizedHandle[c] = column.value(handle, h);
      });
      handleSummaries[this.props.keyed(handle, h)] = summarizedHandle;
    });
    return handleSummaries;
  }

  render() {
    if (this.props.handles.length === 0) {
      return _reactForAtom.React.createElement('div', null);
    }

    const handleSummaries = this.getHandleSummaries(this.props.handles);
    const component = _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement(
        'h3',
        null,
        this.props.title
      ),
      _reactForAtom.React.createElement(
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
              { width: '10%' },
              'ID'
            ),
            this.props.columns.map((column, c) => _reactForAtom.React.createElement(
              'th',
              { key: c, width: `${ column.widthPercentage }%` },
              column.title
            ))
          )
        ),
        _reactForAtom.React.createElement(
          'tbody',
          null,
          Object.keys(handleSummaries).map(key => {
            const handleSummary = handleSummaries[key];
            const previousHandle = this.previousHandleSummaries[key];
            return _reactForAtom.React.createElement(
              'tr',
              { key: key, className: previousHandle ? '' : 'nuclide-health-handle-new' },
              _reactForAtom.React.createElement(
                'th',
                null,
                key
              ),
              this.props.columns.map((column, c) => {
                let className = '';
                if (previousHandle && previousHandle[c] !== handleSummary[c]) {
                  className = 'nuclide-health-handle-updated';
                }
                return _reactForAtom.React.createElement(
                  'td',
                  { key: c, className: className },
                  handleSummary[c]
                );
              })
            );
          })
        )
      )
    );
    this.previousHandleSummaries = handleSummaries;
    return component;
  }

};
exports.default = HandlesTableComponent;
module.exports = exports['default'];