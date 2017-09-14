'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BreakpointConfigComponent = undefined;

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _DebuggerActions;

function _load_DebuggerActions() {
  return _DebuggerActions = _interopRequireDefault(require('./DebuggerActions'));
}

var _react = _interopRequireWildcard(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _BreakpointStore;

function _load_BreakpointStore() {
  return _BreakpointStore = _interopRequireDefault(require('./BreakpointStore'));
}

var _Modal;

function _load_Modal() {
  return _Modal = require('../../nuclide-ui/Modal');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class BreakpointConfigComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._updateBreakpoint = () => {
      const condition = this.refs.condition.getText().trim();
      this.props.actions.updateBreakpointCondition(this.state.breakpoint.id, condition);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-debugger-breakpoint-condition-saved', {
        path: this.props.breakpoint.path,
        line: this.props.breakpoint.line,
        condition,
        fileExtension: (_nuclideUri || _load_nuclideUri()).default.extname(this.props.breakpoint.path)
      });
      this.props.onDismiss();
    };

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      breakpoint: this.props.breakpoint
    };

    this._disposables.add(this.props.breakpointStore.onNeedUIUpdate(() => {
      const breakpoint = this.props.breakpointStore.getBreakpointAtLine(this.state.breakpoint.path, this.state.breakpoint.line);
      if (breakpoint == null) {
        // Breakpoint no longer exists.
        this.props.onDismiss();
      }

      if (!(breakpoint != null)) {
        throw new Error('Invariant violation: "breakpoint != null"');
      }

      this.setState({ breakpoint });
    }));
  }

  componentDidMount() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-debugger-breakpoint-condition-shown', {
      fileExtension: (_nuclideUri || _load_nuclideUri()).default.extname(this.props.breakpoint.path)
    });
    this._disposables.add(atom.commands.add(window, 'core:cancel', this.props.onDismiss), atom.commands.add(window, 'core:confirm', this._updateBreakpoint));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    return _react.createElement(
      (_Modal || _load_Modal()).Modal,
      { onDismiss: () => this.props.onDismiss() },
      _react.createElement(
        'div',
        { className: 'padded nuclide-debugger-bp-dialog' },
        _react.createElement(
          'h1',
          { className: 'nuclide-debugger-bp-config-header' },
          'Edit breakpoint'
        ),
        _react.createElement(
          'div',
          { className: 'block' },
          _react.createElement(
            'label',
            null,
            'Breakpoint at ',
            (_nuclideUri || _load_nuclideUri()).default.basename(this.state.breakpoint.path),
            ':',
            this.state.breakpoint.line
          )
        ),
        _react.createElement(
          'div',
          { className: 'block' },
          _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
            onChange: isChecked => this.props.actions.updateBreakpointEnabled(this.state.breakpoint.id, isChecked),
            checked: this.state.breakpoint.enabled,
            label: 'Enable breakpoint'
          })
        ),
        _react.createElement(
          'div',
          { className: 'block' },
          _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            placeholderText: 'Breakpoint hit condition...',
            value: this.state.breakpoint.condition,
            size: 'sm',
            ref: 'condition',
            autofocus: true
          })
        ),
        _react.createElement(
          'label',
          null,
          'This expression will be evaluated each time the corresponding line is hit, but the debugger will only break execution if the expression evaluates to true.'
        ),
        _react.createElement(
          'div',
          { className: 'nuclide-debugger-bp-config-actions' },
          _react.createElement(
            (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
            null,
            _react.createElement(
              (_Button || _load_Button()).Button,
              { onClick: this.props.onDismiss },
              'Cancel'
            ),
            _react.createElement(
              (_Button || _load_Button()).Button,
              {
                buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
                onClick: this._updateBreakpoint },
              'Update'
            )
          )
        )
      )
    );
  }
}
exports.BreakpointConfigComponent = BreakpointConfigComponent;