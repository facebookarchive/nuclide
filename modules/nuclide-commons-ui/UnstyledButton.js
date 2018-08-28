"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

class UnstyledButton extends _react.default.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._setRef = node => this._node = node, _temp;
  }

  focus() {
    (0, _nullthrows().default)(this._node).focus();
  }

  render() {
    const _this$props = this.props,
          {
      className
    } = _this$props,
          props = _objectWithoutProperties(_this$props, ["className"]);

    const classes = (0, _classnames().default)('nuclide-ui-unstyled-button', className); // eslint-disable-next-line nuclide-internal/use-nuclide-ui-components

    return _react.default.createElement("button", Object.assign({
      className: classes,
      ref: this._setRef
    }, props));
  }

}

exports.default = UnstyledButton;