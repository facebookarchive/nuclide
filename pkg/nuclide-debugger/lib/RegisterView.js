'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RegisterView = undefined;

var _react = _interopRequireWildcard(require('react'));

var _CallstackStore;

function _load_CallstackStore() {
  return _CallstackStore = _interopRequireDefault(require('./CallstackStore'));
}

var _DebuggerModel;

function _load_DebuggerModel() {
  return _DebuggerModel = _interopRequireDefault(require('./DebuggerModel'));
}

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class RegisterView extends _react.Component {

  constructor(props) {
    super(props);

    this._callStackUpdated = this._callStackUpdated.bind(this);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._callstackStore = this.props.model.getCallstackStore();
    this.state = {
      registerInfo: null,
      filter: ''
    };
  }

  componentDidMount() {
    this._disposables.add(this._callstackStore.onChange(() => {
      this._callStackUpdated();
    }));

    this._callStackUpdated();
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _callStackUpdated() {
    const callstack = this._callstackStore.getCallstack();
    if (callstack == null || callstack.length === 0) {
      this.setState({
        registerInfo: null
      });
    } else {
      const selectedFrame = this._callstackStore.getSelectedCallFrameIndex();
      const selectedFrameInfo = callstack[selectedFrame];
      this.setState({
        registerInfo: selectedFrameInfo != null ? selectedFrameInfo.registers : null
      });
    }
  }

  render() {
    const { registerInfo } = this.state;

    if (registerInfo == null) {
      return _react.createElement(
        'div',
        { className: 'nuclide-debugger-registers-empty' },
        'No register info available.'
      );
    }

    const columns = [{
      title: 'Register',
      key: 'register',
      width: 0.2
    }, {
      title: 'Value (hex)',
      key: 'value',
      width: 0.4
    }, {
      title: 'Value (decimal)',
      key: 'decimal',
      width: 0.4
    }];

    const emptyComponent = () => _react.createElement(
      'div',
      { className: 'nuclide-debugger-registers-empty' },
      'registers unavailable.'
    );

    const groups = registerInfo.map(group => {
      const rows = group.registers.filter(r => {
        const filter = this.state.filter.trim();
        if (filter === '') {
          return true;
        }

        try {
          const exp = new RegExp(filter, 'i');
          return r.name.match(exp) != null || r.value.match(exp) != null || parseInt(r.value, 16).toString().match(exp) != null;
        } catch (e) {
          // If the user enters an invalid regular expression, fall back
          // to string contains matching.
          return r.name.includes(filter);
        }
      }).sort((a, b) => a.name.localeCompare(b.name)).map(register => {
        const decimalValue = parseInt(register.value, 16);
        return {
          data: {
            register: register.name,
            value: register.value,
            decimal: Number.isNaN(decimalValue) ? '' : decimalValue
          }
        };
      });
      if (rows.length === 0) {
        return null;
      }
      return _react.createElement(
        'div',
        {
          className: 'nuclide-debugger-registers-view',
          key: `registerGroup_${group.groupName}` },
        _react.createElement(
          'div',
          { className: 'nuclide-debugger-registers-group' },
          group.groupName
        ),
        _react.createElement((_Table || _load_Table()).Table, {
          columns: columns,
          emptyComponent: emptyComponent,
          rows: rows,
          selectable: false,
          resizable: true,
          sortable: false
        })
      );
    });

    return _react.createElement(
      'div',
      { className: 'nuclide-debugger-container-new' },
      _react.createElement(
        'div',
        null,
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          size: 'sm',
          placeholderText: 'Filter registers by regex...',
          value: this.state.filter,
          onDidChange: filter => this.setState({ filter })
        })
      ),
      _react.createElement(
        'div',
        { className: 'nuclide-debugger-pane-content' },
        groups
      )
    );
  }
}
exports.RegisterView = RegisterView; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */