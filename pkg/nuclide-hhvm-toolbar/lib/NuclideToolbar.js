var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _ProjectStore2;

function _ProjectStore() {
  return _ProjectStore2 = _interopRequireDefault(require('./ProjectStore'));
}

var NuclideToolbar = (function (_React$Component) {
  _inherits(NuclideToolbar, _React$Component);

  _createClass(NuclideToolbar, null, [{
    key: 'propTypes',
    value: {
      projectStore: (_reactForAtom2 || _reactForAtom()).React.PropTypes.instanceOf((_ProjectStore2 || _ProjectStore()).default).isRequired
    },
    enumerable: true
  }]);

  function NuclideToolbar(props) {
    _classCallCheck(this, NuclideToolbar);

    _get(Object.getPrototypeOf(NuclideToolbar.prototype), 'constructor', this).call(this, props);
    this.state = {
      currentFilePath: '',
      projectType: 'Other'
    };
    this._disposable = null;
    this._updateStateFromStore = this._updateStateFromStore.bind(this);
  }

  _createClass(NuclideToolbar, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this._disposable = this.props.projectStore.onChange(this._updateStateFromStore);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._disposable) {
        this._disposable.dispose();
        this._disposable = null;
      }
    }
  }, {
    key: '_updateStateFromStore',
    value: function _updateStateFromStore() {
      this.setState({
        currentFilePath: this.props.projectStore.getCurrentFilePath(),
        projectType: this.props.projectStore.getProjectType()
      });
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state.projectType === 'Hhvm') {
        var HhvmToolbar = require('./HhvmToolbar');
        return (_reactForAtom2 || _reactForAtom()).React.createElement(HhvmToolbar, {
          ref: 'hhvmToolbar',
          targetFilePath: this.state.currentFilePath,
          projectStore: this.props.projectStore
        });
      } else {
        // Hide toolbar.
        return null;
      }
    }
  }]);

  return NuclideToolbar;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = NuclideToolbar;