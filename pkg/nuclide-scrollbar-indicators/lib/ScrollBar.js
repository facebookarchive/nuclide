/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import * as React from 'react';
import {MeasuredComponent} from 'nuclide-commons-ui/MeasuredComponent';
import Immutable from 'immutable';
import nullthrows from 'nullthrows';

import type {
  ScrollbarIndicatorProvider,
  ScrollbarIndicatorMark,
  ScrollbarIndicatorMarkType,
} from './main';
import type {ThemeColors} from './themeColors';
import {scrollbarMarkTypes} from './constants';

type Props = {
  markTypes: ?Immutable.Map<
    ScrollbarIndicatorMarkType,
    Immutable.Map<ScrollbarIndicatorProvider, Set<ScrollbarIndicatorMark>>,
  >,
  colors: ThemeColors,
  editor: atom$TextEditor,
  editorIsVisible: boolean,
  screenLineCount: number,
};
type State = {
  height: ?number,
  width: ?number,
};

type MarkStyle = {
  width: number,
  offset: number,
  color: string,
};

const SCALE = window.devicePixelRatio;
const MIN_PIXEL_HEIGHT = SCALE * 2;

const DIAGNOSTIC_ERROR_COLOR = '#ff0000';
const SEARCH_RESULT_COLOR = '#ffdd00';
const TYPE_ORDER: Array<ScrollbarIndicatorMarkType> = [
  scrollbarMarkTypes.SELECTION,
  scrollbarMarkTypes.SOURCE_CONTROL_ADDITION,
  scrollbarMarkTypes.SOURCE_CONTROL_REMOVAL,
  scrollbarMarkTypes.SOURCE_CONTROL_CHANGE,
  scrollbarMarkTypes.SEARCH_RESULT,
  scrollbarMarkTypes.DIAGNOSTIC_ERROR,
  scrollbarMarkTypes.STALE_DIAGNOSTIC_ERROR,
  scrollbarMarkTypes.CURSOR,
];

export default class ScrollBar extends React.PureComponent<Props, State> {
  _canvas: ?HTMLCanvasElement;
  _context: CanvasRenderingContext2D;
  state = {
    height: null,
    width: null,
  };

  componentDidMount() {
    const canvas = nullthrows(this._canvas);
    this._context = canvas.getContext('2d');
    this._context.scale(SCALE, SCALE);
    this._context.translate(0.5, 0.5);
    const rect = canvas.getBoundingClientRect();
    this.setState({
      height: rect.height,
      width: rect.width,
    });
    this._drawToCanvas();
  }

  _getMarkStyleForType(type: ScrollbarIndicatorMarkType): MarkStyle {
    const canvasWidth = this._context.canvas.width;
    const oneThird = canvasWidth / 3;
    const left = {width: oneThird, offset: 0};
    const middle = {width: oneThird, offset: oneThird};
    const right = {width: oneThird, offset: oneThird * 2};
    const full = {width: canvasWidth, offset: 0};
    switch (type) {
      case scrollbarMarkTypes.DIAGNOSTIC_ERROR:
        return {...right, color: DIAGNOSTIC_ERROR_COLOR};
      case scrollbarMarkTypes.STALE_DIAGNOSTIC_ERROR:
        return {...right, color: this.props.colors.textColorSubtle};
      case scrollbarMarkTypes.SELECTION:
        return {...middle, color: this.props.colors.syntaxSelectionColor};
      case scrollbarMarkTypes.CURSOR:
        return {...full, color: this.props.colors.syntaxTextColor};
      case scrollbarMarkTypes.SEARCH_RESULT:
        return {...middle, color: SEARCH_RESULT_COLOR};
      case scrollbarMarkTypes.SOURCE_CONTROL_ADDITION:
      case scrollbarMarkTypes.SOURCE_CONTROL_REMOVAL:
      case scrollbarMarkTypes.SOURCE_CONTROL_CHANGE:
        return {...left, color: this.props.colors.backgroundColorInfo};
      default:
        throw new Error(`Invalid scroll indicator mark type: ${type}`);
    }
  }

  componentDidUpdate() {
    if (!this.props.editorIsVisible) {
      // Don't bother painting the canvas if it's not visible.
      return;
    }
    this._drawToCanvas();
  }

  _drawToCanvas() {
    const {width, height} = this._context.canvas;
    this._context.clearRect(0, 0, width, height);
    const {markTypes, colors, editor, screenLineCount} = this.props;
    if (markTypes == null || colors == null) {
      return;
    }

    TYPE_ORDER.forEach(type => {
      const typeMarks = markTypes.get(type);
      if (typeMarks == null) {
        return;
      }
      const markStyle = this._getMarkStyleForType(type);
      this._context.fillStyle = markStyle.color;
      typeMarks.forEach((marks, provider) => {
        marks.forEach(mark => {
          const screenStart = editor.screenPositionForBufferPosition([
            mark.start,
            0,
          ]).row;
          const screenEnd =
            // Often the mark is just one line. In that case, avoid the additional
            // call to `editor.screenPositionForBufferPosition`
            mark.end === mark.start
              ? screenStart
              : editor.screenPositionForBufferPosition([mark.end, 0]).row;

          const lineHeight = screenEnd - screenStart;
          const rangeHeight = Math.max(
            MIN_PIXEL_HEIGHT,
            Math.round(height * (lineHeight / screenLineCount)),
          );
          // Draw single lines as lines rather than ranges.
          const markPixelHeight =
            lineHeight === 1 ? MIN_PIXEL_HEIGHT : rangeHeight;
          const positionPercent = screenStart / screenLineCount;
          const pixelPosition = Math.floor(height * positionPercent);
          this._context.fillRect(
            markStyle.offset,
            pixelPosition,
            markStyle.width,
            markPixelHeight,
          );
        });
      });
    });
  }

  _handleMeasurementsChanged = (rect: DOMRectReadOnly) => {
    // TODO: This height is not quite right. It should exclude the
    // ::-webkit-scrollbar-corner, but it does not
    this.setState({height: rect.height, width: rect.width});
  };

  render(): React.Node {
    return (
      <div className="scroll-marker-view">
        <MeasuredComponent
          style={{height: '100%', width: '100%'}}
          onMeasurementsChanged={this._handleMeasurementsChanged}>
          <canvas
            ref={node => (this._canvas = node)}
            height={this.state.height}
            width={this.state.width}
          />
        </MeasuredComponent>
      </div>
    );
  }
}
