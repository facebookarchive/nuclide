"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dragEventCameFromDraggableFile = dragEventCameFromDraggableFile;
exports.default = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _analytics() {
  const data = require("../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

const MAGIC_DATA_TRANSFER_KEY = 'nuclide-draggable-file';

class DraggableFile extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._onDragStart = e => {
      const {
        dataTransfer
      } = e;

      if (dataTransfer != null) {
        dataTransfer.effectAllowed = 'move';
        dataTransfer.setData('initialPath', this.props.uri); // For security reasons, dragEnter events can't see the values of
        // `dataTransfer`, just the keys. So, we use a unique key to enable other
        // components to infer if a drag event contains a draggable file.

        dataTransfer.setData(MAGIC_DATA_TRANSFER_KEY, ''); // Allow draggable files to be dragged into the tab bar.

        dataTransfer.setData('text/plain', this.props.uri);
        dataTransfer.setData('atom-event', 'true');
        dataTransfer.setData('allow-all-locations', 'true');
        (0, _analytics().track)('draggable-file:drag-start', {
          source: this.props.trackingSource,
          uri: this.props.uri
        });
      }
    }, _temp;
  }

  componentDidMount() {
    const el = _reactDom.default.findDOMNode(this);

    this._disposables = new (_UniversalDisposable().default)( // Because this element can be inside of an Atom panel (which adds its own drag and drop
    // handlers) we need to sidestep React's event delegation.
    _rxjsCompatUmdMin.Observable.fromEvent(el, 'dragstart').subscribe(this._onDragStart));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const _this$props = this.props,
          {
      uri,
      trackingSource,
      draggable = true
    } = _this$props,
          restProps = _objectWithoutProperties(_this$props, ["uri", "trackingSource", "draggable"]); // https://discuss.atom.io/t/drag-drop/21262/14


    const tabIndex = -1;
    return React.createElement("div", Object.assign({
      draggable: draggable,
      tabIndex: tabIndex
    }, restProps));
  }

}

exports.default = DraggableFile;

function dragEventCameFromDraggableFile(event) {
  const {
    dataTransfer
  } = event;

  if (dataTransfer == null) {
    return false;
  }

  return dataTransfer.types.includes(MAGIC_DATA_TRANSFER_KEY);
}