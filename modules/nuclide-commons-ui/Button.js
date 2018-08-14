"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Button = exports.ButtonTypes = exports.ButtonSizes = void 0;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _string() {
  const data = require("../nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _addTooltip() {
  const data = _interopRequireDefault(require("./addTooltip"));

  _addTooltip = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

const ButtonSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  LARGE: 'LARGE'
});
exports.ButtonSizes = ButtonSizes;
const ButtonTypes = Object.freeze({
  PRIMARY: 'PRIMARY',
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
});
exports.ButtonTypes = ButtonTypes;
const ButtonSizeClassnames = Object.freeze({
  EXTRA_SMALL: 'btn-xs',
  SMALL: 'btn-sm',
  LARGE: 'btn-lg'
});
const ButtonTypeClassnames = Object.freeze({
  PRIMARY: 'btn-primary',
  INFO: 'btn-info',
  SUCCESS: 'btn-success',
  WARNING: 'btn-warning',
  ERROR: 'btn-error'
});
/**
 * Generic Button wrapper.
 */

class Button extends React.Component {
  focus() {
    const node = _reactDom.default.findDOMNode(this);

    if (node == null) {
      return;
    } // $FlowFixMe


    node.focus();
  }

  render() {
    const _this$props = this.props,
          {
      icon,
      buttonType,
      selected,
      size,
      children,
      className,
      wrapperElement,
      tooltip
    } = _this$props,
          remainingProps = _objectWithoutProperties(_this$props, ["icon", "buttonType", "selected", "size", "children", "className", "wrapperElement", "tooltip"]);

    const sizeClassname = size == null ? '' : ButtonSizeClassnames[size] || '';
    const buttonTypeClassname = buttonType == null ? '' : ButtonTypeClassnames[buttonType] || '';
    const ref = tooltip && !this.props.disabled ? (0, _addTooltip().default)(tooltip) : null;
    const titleToolTip = tooltip && this.props.disabled ? tooltip.title : null;
    const newClassName = (0, _classnames().default)(className, 'btn', {
      [`icon icon-${(0, _string().maybeToString)(icon)}`]: icon != null,
      [sizeClassname]: size != null,
      selected,
      [buttonTypeClassname]: buttonType != null
    });
    const Wrapper = wrapperElement == null ? 'button' : wrapperElement;
    return (// $FlowFixMe(>=0.53.0) Flow suppress
      React.createElement(Wrapper, Object.assign({
        className: newClassName // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
        ,
        ref: ref
      }, remainingProps, {
        title: titleToolTip
      }), children)
    );
  }

}

exports.Button = Button;