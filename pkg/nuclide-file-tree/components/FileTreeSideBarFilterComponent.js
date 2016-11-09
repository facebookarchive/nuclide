'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let FileTreeSidebarFilterComponent = class FileTreeSidebarFilterComponent extends _reactForAtom.React.Component {

  render() {
    var _props = this.props;
    const filter = _props.filter,
          found = _props.found;


    const classes = (0, (_classnames || _load_classnames()).default)({
      'nuclide-file-tree-filter': true,
      'show': Boolean(filter && filter.length),
      'not-found': !found
    });
    const text = `search for: ${ filter }`;

    return _reactForAtom.React.createElement(
      'div',
      { className: classes },
      text
    );
  }
};


module.exports = FileTreeSidebarFilterComponent;