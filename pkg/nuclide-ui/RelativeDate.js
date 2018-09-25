"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _string() {
  const data = require("../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _addTooltip() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons-ui/addTooltip"));

  _addTooltip = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

const DEFAULT_RERENDER_DELAY = 10000; // ms

/**
 * Renders a relative date that forces a re-render every `delay` ms,
 * in order to properly update the UI.
 *
 * Does not respond to changes to the initial `delay` for simplicity's sake.
 */

class RelativeDate extends React.Component {
  componentDidMount() {
    const {
      delay
    } = this.props;
    this._interval = setInterval(() => this.forceUpdate(), delay);
  }

  componentWillUnmount() {
    if (this._interval != null) {
      clearInterval(this._interval);
    }
  }

  render() {
    const _this$props = this.props,
          {
      date,
      // eslint-disable-next-line no-unused-vars
      delay: _,
      shorten,
      withToolip
    } = _this$props,
          remainingProps = _objectWithoutProperties(_this$props, ["date", "delay", "shorten", "withToolip"]);

    return React.createElement("span", Object.assign({}, remainingProps, {
      // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      ref: withToolip ? (0, _addTooltip().default)({
        title: date.toLocaleString(),
        delay: 200,
        placement: 'top'
      }) : null
    }), (0, _string().relativeDate)(date, undefined, shorten));
  }

}

exports.default = RelativeDate;
RelativeDate.defaultProps = {
  delay: DEFAULT_RERENDER_DELAY,
  shorten: false,
  withToolip: false
};