"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _MeasuredComponent() {
  const data = require("../../../modules/nuclide-commons-ui/MeasuredComponent");

  _MeasuredComponent = function () {
    return data;
  };

  return data;
}

function _immutable() {
  const data = _interopRequireDefault(require("immutable"));

  _immutable = function () {
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

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const SCALE = window.devicePixelRatio;
const MIN_PIXEL_HEIGHT = SCALE * 2;
const DIAGNOSTIC_ERROR_COLOR = '#ff0000';
const SEARCH_RESULT_COLOR = '#ffdd00';
const TYPE_ORDER = [_constants().scrollbarMarkTypes.SELECTION, _constants().scrollbarMarkTypes.CURSOR, _constants().scrollbarMarkTypes.SEARCH_RESULT, _constants().scrollbarMarkTypes.DIAGNOSTIC_ERROR];

class ScrollBar extends React.PureComponent {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      height: null,
      width: null
    }, this._handleMeasurementsChanged = rect => {
      // TODO: This height is not quite right. It should exclude the
      // ::-webkit-scrollbar-corner, but it does not
      this.setState({
        height: rect.height,
        width: rect.width
      });
    }, _temp;
  }

  componentDidMount() {
    const canvas = (0, _nullthrows().default)(this._canvas);
    this._context = canvas.getContext('2d');

    this._context.scale(SCALE, SCALE);

    this._context.translate(0.5, 0.5);

    const rect = canvas.getBoundingClientRect();
    this.setState({
      height: rect.height,
      width: rect.width
    });
  }

  _getColorForType(type) {
    switch (type) {
      case _constants().scrollbarMarkTypes.DIAGNOSTIC_ERROR:
        return DIAGNOSTIC_ERROR_COLOR;

      case _constants().scrollbarMarkTypes.SELECTION:
        return this.props.colors.syntaxGutterBackgroundColorSelected;

      case _constants().scrollbarMarkTypes.CURSOR:
        return this.props.colors.syntaxTextColor;

      case _constants().scrollbarMarkTypes.SEARCH_RESULT:
        return SEARCH_RESULT_COLOR;

      default:
        throw new Error(`Invalid scroll indicator mark type: ${type}`);
    }
  }

  componentDidUpdate() {
    if (!this.props.editorIsVisible) {
      // Don't bother painting the canvas if it's not visible.
      return;
    }

    const lineCount = this.props.editor.getLineCount();
    const {
      width,
      height
    } = this._context.canvas;

    this._context.clearRect(0, 0, width, height);

    const {
      markTypes,
      colors
    } = this.props;

    if (markTypes == null || colors == null) {
      return;
    }

    TYPE_ORDER.forEach(type => {
      const typeMarks = markTypes.get(type);

      if (typeMarks == null) {
        return;
      }

      typeMarks.forEach((marks, provider) => {
        this._context.fillStyle = this._getColorForType(type);
        marks.forEach(mark => {
          const lineHeight = mark.end - mark.start;
          const rangeHeight = Math.max(MIN_PIXEL_HEIGHT, Math.round(height * (lineHeight / lineCount))); // Draw single lines as lines rather than ranges.

          const markPixelHeight = lineHeight === 1 ? MIN_PIXEL_HEIGHT : rangeHeight;
          const positionPercent = mark.start / lineCount;
          const pixelPosition = Math.floor(height * positionPercent);

          this._context.fillRect(0, pixelPosition, width, markPixelHeight);
        });
      });
    });
  }

  render() {
    return React.createElement(_MeasuredComponent().MeasuredComponent, {
      style: {
        height: '100%',
        width: '100%'
      },
      onMeasurementsChanged: this._handleMeasurementsChanged
    }, React.createElement("canvas", {
      ref: node => this._canvas = node,
      height: this.state.height,
      width: this.state.width
    }));
  }

}

exports.default = ScrollBar;