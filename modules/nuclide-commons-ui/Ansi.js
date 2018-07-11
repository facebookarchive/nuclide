"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _anser() {
  const data = _interopRequireDefault(require("anser"));

  _anser = function () {
    return data;
  };

  return data;
}

function _escapeCarriage() {
  const data = _interopRequireDefault(require("escape-carriage"));

  _escapeCarriage = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function ansiToJSON(input) {
  return _anser().default.ansiToJson((0, _escapeCarriage().default)(input), {
    json: true,
    remove_empty: true
  });
}

function ansiJSONtoStyleBundle(ansiBundle) {
  const style = {};

  if (ansiBundle.bg) {
    style.backgroundColor = `rgb(${ansiBundle.bg})`;
  }

  if (ansiBundle.fg) {
    style.color = `rgb(${ansiBundle.fg})`;
  }

  return {
    content: ansiBundle.content,
    style
  };
}

function ansiToInlineStyle(text) {
  return ansiToJSON(text).map(ansiJSONtoStyleBundle);
}

function defaultRenderSegment({
  key,
  style,
  content
}) {
  return React.createElement("span", {
    key: key,
    style: style
  }, content);
}

class Ansi extends React.PureComponent {
  render() {
    const _this$props = this.props,
          {
      children,
      renderSegment = defaultRenderSegment
    } = _this$props,
          passThroughProps = _objectWithoutProperties(_this$props, ["children", "renderSegment"]);

    return React.createElement("code", passThroughProps, ansiToInlineStyle(children).map(({
      style,
      content
    }, key) => renderSegment({
      key: String(key),
      style,
      content
    })));
  }

}

exports.default = Ansi;