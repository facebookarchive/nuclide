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
exports.DatatipComponent = exports.DATATIP_ACTIONS = undefined;

var _reactForAtom = require('react-for-atom');

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const DATATIP_ACTIONS = exports.DATATIP_ACTIONS = Object.freeze({
  PIN: 'PIN',
  CLOSE: 'CLOSE'
});

const IconsForAction = {
  [DATATIP_ACTIONS.PIN]: 'pin',
  [DATATIP_ACTIONS.CLOSE]: 'x'
};

let DatatipComponent = exports.DatatipComponent = class DatatipComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.handleActionClick = this.handleActionClick.bind(this);
  }

  handleActionClick(event) {
    this.props.onActionClick();
  }

  render() {
    var _props = this.props;

    const className = _props.className,
          children = _props.children,
          action = _props.action,
          actionTitle = _props.actionTitle,
          props = _objectWithoutProperties(_props, ['className', 'children', 'action', 'actionTitle']);

    delete props.onActionClick;
    let actionButton;
    if (action != null && IconsForAction[action] != null) {
      const actionIcon = IconsForAction[action];
      actionButton = _reactForAtom.React.createElement('div', {
        className: `nuclide-datatip-pin-button icon-${ actionIcon }`,
        onClick: this.handleActionClick,
        title: actionTitle
      });
    }
    return _reactForAtom.React.createElement(
      'div',
      Object.assign({
        className: `${ (0, (_string || _load_string()).maybeToString)(className) } nuclide-datatip-container`
      }, props),
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-datatip-content' },
        children
      ),
      actionButton
    );
  }
};