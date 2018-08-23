"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListView = exports.ListViewItem = void 0;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _ignoreTextSelectionEvents() {
  const data = _interopRequireDefault(require("./ignoreTextSelectionEvents"));

  _ignoreTextSelectionEvents = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

/**
 * Use ListViewItem in conjunction with ListView.
 */
class ListViewItem extends React.Component {
  _select(value, index, event) {
    if (this.props.onSelect != null) {
      this.props.onSelect(value, index);
    }
  }

  render() {
    const _this$props = this.props,
          {
      children,
      index,
      value
    } = _this$props,
          remainingProps = _objectWithoutProperties(_this$props, ["children", "index", "value"]);

    return React.createElement("div", Object.assign({
      className: "nuclide-ui-listview-item"
    }, remainingProps, {
      onClick: (0, _ignoreTextSelectionEvents().default)(this._select.bind(this, value, index))
    }), children);
  }

}

exports.ListViewItem = ListViewItem;

class ListView extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleSelect = (value, index, event) => {
      if (this.props.selectable && this.props.onSelect != null) {
        this.props.onSelect(index, value);
      }
    }, _temp;
  }

  render() {
    const {
      children,
      alternateBackground,
      selectable
    } = this.props;
    const renderedItems = React.Children.map(children, (child, index) => React.cloneElement(child, {
      index,
      onSelect: this._handleSelect
    }));
    const className = (0, _classnames().default)({
      'native-key-bindings': true,
      'nuclide-ui-listview': true,
      'nuclide-ui-listview-highlight-odd': alternateBackground,
      'nuclide-ui-listview-selectable': selectable
    });
    return React.createElement("div", {
      className: className,
      tabIndex: -1
    }, renderedItems);
  }

}

exports.ListView = ListView;