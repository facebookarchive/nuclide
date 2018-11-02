"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MeasuredComponent = void 0;

var React = _interopRequireWildcard(require("react"));

function _observableDom() {
  const data = require("./observable-dom");

  _observableDom = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

/** A container which invokes a callback function supplied in props whenever the
 * container's height and width measurements change. The callback is invoked once
 * when the MeasuredComponent has mounted.
 */
class MeasuredComponent extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._updateDomNode = node => {
      if (node == null) {
        this._domNode = null; // _updateDomNode is called before component unmount, so don't need to unsubscribe()
        // in componentWillUnmount()

        this._resizeSubscription.unsubscribe();

        return;
      }

      this._resizeSubscription = new (_observableDom().ResizeObservable)(node).subscribe(entries => {
        if (!(entries.length === 1)) {
          throw new Error("Invariant violation: \"entries.length === 1\"");
        }

        this.props.onMeasurementsChanged(entries[0].contentRect, entries[0].target);
      });
      this._domNode = node;
    }, _temp;
  }

  render() {
    const _this$props = this.props,
          {
      onMeasurementsChanged
    } = _this$props,
          passThroughProps = _objectWithoutProperties(_this$props, ["onMeasurementsChanged"]);

    return React.createElement("div", Object.assign({
      ref: this._updateDomNode
    }, passThroughProps));
  }

}

exports.MeasuredComponent = MeasuredComponent;