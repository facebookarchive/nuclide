"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _Icon() {
  const data = require("../../../modules/nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _addTooltip() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/addTooltip"));

  _addTooltip = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _humanizeKeystroke() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/humanizeKeystroke"));

  _humanizeKeystroke = function () {
    return data;
  };

  return data;
}

function _humanizeEventName() {
  const data = _interopRequireDefault(require("../../commons-node/humanizeEventName"));

  _humanizeEventName = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/* global KeyboardEvent */
// Given a command name, return an array of human readable key bindings.
function keyBindingsFromCommand(commandName) {
  const keyBindings = atom.keymaps.findKeyBindings({
    command: commandName,
    // Adding the target allows us to filter out keymaps for other OSs.
    target: window.document.activeElement
  });
  const humanizedKeyBindings = keyBindings.map(binding => {
    return (0, _humanizeKeystroke().default)(binding.keystrokes);
  });
  return humanizedKeyBindings;
}

class KeyBindingHint extends React.Component {
  constructor(props) {
    super(props);

    this._handleWillDispatch = event => {
      // We don't care about events dispatched by other events.
      if (!this._areProcessingUserEvent) {
        this._areProcessingUserEvent = true; // If they are already using the keyboard, they don't need our advice.
        // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)

        if (event.originalEvent instanceof KeyboardEvent) {
          this.setState({
            event: null
          });
        } else {
          this.setState({
            event
          });
        } // Nested events are handled within a single event loop. By handling only
        // the first event of a given loop, we approximate only responding to user
        // instigated events.


        setImmediate(this._userEventComplete);
      }
    };

    this._userEventComplete = () => {
      this._areProcessingUserEvent = false;
    };

    this._areProcessingUserEvent = false;
    this.state = {
      event: null
    };
    this._disposables = new (_UniversalDisposable().default)(atom.commands.onWillDispatch(this._handleWillDispatch));
  }

  render() {
    const {
      event
    } = this.state;

    if (event == null) {
      return React.createElement("div", null);
    }

    const keyBindings = keyBindingsFromCommand(event.type);

    if (!keyBindings.length) {
      // TODO: Consider indicating that this command lacks a binding.
      // TODO: Consider allowing the user to create a binding via a context menu.
      return React.createElement("div", null);
    }

    const firstBinding = keyBindings.length ? keyBindings[0] : '';
    const tooltip = (0, _addTooltip().default)({
      title: (0, _humanizeEventName().default)(event.type),
      keyBindingCommand: event.type,
      placement: 'top',
      keyBindingTarget: window.document.activeElement
    });
    return (// eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      React.createElement("div", {
        ref: tooltip
      }, React.createElement(_Icon().Icon, {
        icon: "keyboard"
      }, React.createElement("span", {
        style: {
          paddingLeft: '5px'
        }
      }, firstBinding)))
    );
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

}

exports.default = KeyBindingHint;