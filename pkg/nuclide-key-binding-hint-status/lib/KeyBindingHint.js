'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _humanizeKeystroke;

function _load_humanizeKeystroke() {
  return _humanizeKeystroke = _interopRequireDefault(require('../../commons-node/humanizeKeystroke'));
}

var _humanizeEventName;

function _load_humanizeEventName() {
  return _humanizeEventName = _interopRequireDefault(require('../../commons-node/humanizeEventName'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* global KeyboardEvent */

// Given a command name, return an array of human readable key bindings.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function keyBindingsFromCommand(commandName) {
  const keyBindings = atom.keymaps.findKeyBindings({
    command: commandName,
    // Adding the target allows us to filter out keymaps for other OSs.
    target: window.document.activeElement
  });
  const humanizedKeyBindings = keyBindings.map(binding => {
    return (0, (_humanizeKeystroke || _load_humanizeKeystroke()).default)(binding.keystrokes);
  });

  return humanizedKeyBindings;
}

class KeyBindingHint extends _react.Component {

  constructor(props) {
    super(props);

    this._handleWillDispatch = event => {
      // We don't care about events dispatched by other events.
      if (!this._areProcessingUserEvent) {
        this._areProcessingUserEvent = true;
        // If they are already using the keyboard, they don't need our advice.
        if (event.originalEvent instanceof KeyboardEvent) {
          this.setState({ event: null });
        } else {
          this.setState({ event });
        }
        // Nested events are handled within a single event loop. By handling only
        // the first event of a given loop, we approximate only responding to user
        // instigated events.
        setImmediate(this._userEventComplete);
      }
    };

    this._userEventComplete = () => {
      this._areProcessingUserEvent = false;
    };

    this._areProcessingUserEvent = false;
    this.state = { event: null };

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.onWillDispatch(this._handleWillDispatch));
  }

  render() {
    const { event } = this.state;
    if (event == null) {
      return _react.createElement('div', null);
    }
    const keyBindings = keyBindingsFromCommand(event.type);

    if (!keyBindings.length) {
      // TODO: Consider indicating that this command lacks a binding.
      // TODO: Consider allowing the user to create a binding via a context menu.
      return _react.createElement('div', null);
    }

    const firstBinding = keyBindings.length ? keyBindings[0] : '';
    const tooltip = (0, (_addTooltip || _load_addTooltip()).default)({
      title: (0, (_humanizeEventName || _load_humanizeEventName()).default)(event.type),
      keyBindingCommand: event.type,
      placement: 'top',
      keyBindingTarget: window.document.activeElement
    });

    return (
      // $FlowFixMe(>=0.53.0) Flow suppress
      _react.createElement(
        'div',
        { ref: tooltip },
        _react.createElement(
          (_Icon || _load_Icon()).Icon,
          { icon: 'keyboard' },
          _react.createElement(
            'span',
            { style: { paddingLeft: '5px' } },
            firstBinding
          )
        )
      )
    );
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

}
exports.default = KeyBindingHint;