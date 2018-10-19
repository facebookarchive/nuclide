"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DatatipComponent = exports.DATATIP_ACTIONS = void 0;

var React = _interopRequireWildcard(require("react"));

function _string() {
  const data = require("../../../../nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _MarkedStringDatatip() {
  const data = _interopRequireDefault(require("./MarkedStringDatatip"));

  _MarkedStringDatatip = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

const DATATIP_ACTIONS = Object.freeze({
  PIN: 'PIN',
  CLOSE: 'CLOSE'
});
exports.DATATIP_ACTIONS = DATATIP_ACTIONS;
const IconsForAction = {
  [DATATIP_ACTIONS.PIN]: 'pin',
  [DATATIP_ACTIONS.CLOSE]: 'x'
};

class DatatipComponent extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.handleActionClick = event => {
      this.props.onActionClick();
    }, _temp;
  }

  render() {
    const _this$props = this.props,
          {
      className,
      action,
      actionTitle,
      datatip,
      onActionClick
    } = _this$props,
          props = _objectWithoutProperties(_this$props, ["className", "action", "actionTitle", "datatip", "onActionClick"]);

    let content;

    if (datatip.component != null) {
      content = React.createElement(datatip.component, null);
    } else if (datatip.markedStrings != null) {
      content = React.createElement(_MarkedStringDatatip().default, {
        markedStrings: datatip.markedStrings
      });
    }

    let actionButton = null;

    if (action != null && IconsForAction[action] != null) {
      const actionIcon = IconsForAction[action];
      actionButton = React.createElement("div", {
        className: `datatip-pin-button icon-${actionIcon}`,
        onClick: this.handleActionClick,
        title: actionTitle
      });
    }

    return React.createElement("div", Object.assign({
      className: `${(0, _string().maybeToString)(className)} datatip-container`
    }, props), React.createElement("div", {
      className: "datatip-content"
    }, content), actionButton);
  }

}

exports.DatatipComponent = DatatipComponent;