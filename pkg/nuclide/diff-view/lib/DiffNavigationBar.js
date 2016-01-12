Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _commons = require('../../commons');

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

var _diffUtils = require('./diff-utils');

var _classnames2 = require('classnames');

var _classnames3 = _interopRequireDefault(_classnames2);

/* eslint-disable react/prop-types */

var DiffNavigationBar = (function (_React$Component) {
  _inherits(DiffNavigationBar, _React$Component);

  function DiffNavigationBar(props) {
    _classCallCheck(this, DiffNavigationBar);

    _get(Object.getPrototypeOf(DiffNavigationBar.prototype), 'constructor', this).call(this, props);
    this._boundHandleClick = this._handleClick.bind(this);
  }

  _createClass(DiffNavigationBar, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var addedLines = _props.addedLines;
      var removedLines = _props.removedLines;
      var newContents = _props.newContents;
      var oldContents = _props.oldContents;
      var newOffsets = _props.newOffsets;
      var oldOffsets = _props.oldOffsets;
      var elementHeight = _props.elementHeight;

      var newLinesCount = (0, _diffUtils.getLineCountWithOffsets)(newContents, newOffsets);
      var oldLinesCount = (0, _diffUtils.getLineCountWithOffsets)(oldContents, oldOffsets);

      var linesCount = Math.max(newLinesCount, oldLinesCount);

      // The old and new text editor contents use offsets to create a global line number identifier
      // being the line number with offset.

      // Here are the mapping between the offset line numbers to the original line number.
      var addedLinesWithOffsets = new Map(addedLines.map(function (addedLine) {
        return [(0, _diffUtils.getOffsetLineNumber)(addedLine, newOffsets), addedLine];
      }));
      var removedLinesWithOffsets = new Map(removedLines.map(function (removedLine) {
        return [(0, _diffUtils.getOffsetLineNumber)(removedLine, oldOffsets), removedLine];
      }));
      // Interset the added and removed lines maps, taking the values of the added lines.
      var changedLinesWithOffsets = new Map(_commons.array.from(addedLinesWithOffsets.keys()).filter(function (addedLineWithOffset) {
        return removedLinesWithOffsets.has(addedLineWithOffset);
      }).map(function (changedLineWithOffset) {
        return [changedLineWithOffset, addedLinesWithOffsets.get(changedLineWithOffset)];
      }));

      // These regions will now be 'modified' regions.
      for (var changedLineWithOffset of changedLinesWithOffsets.keys()) {
        addedLinesWithOffsets['delete'](changedLineWithOffset);
        removedLinesWithOffsets['delete'](changedLineWithOffset);
      }

      var jumpTargets = [];

      for (var _ref3 of addedLinesWithOffsets) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var addedLineWithOffset = _ref2[0];
        var addedLine = _ref2[1];

        jumpTargets.push(_reactForAtom2['default'].createElement(NavigatonBarJumpTarget, {
          offsetLineNumber: addedLineWithOffset,
          key: addedLineWithOffset,
          lineNumber: addedLine,
          linesCount: linesCount,
          lineChangeClass: 'added',
          isAddedLine: true,
          containerHeight: elementHeight,
          onClick: this._boundHandleClick }));
      }

      for (var _ref43 of changedLinesWithOffsets) {
        var _ref42 = _slicedToArray(_ref43, 2);

        var changedLineWithOffset = _ref42[0];
        var changedLine = _ref42[1];

        jumpTargets.push(_reactForAtom2['default'].createElement(NavigatonBarJumpTarget, {
          offsetLineNumber: changedLineWithOffset,
          key: changedLineWithOffset,
          lineNumber: changedLine,
          linesCount: linesCount,
          lineChangeClass: 'modified',
          isAddedLine: true,
          containerHeight: elementHeight,
          onClick: this._boundHandleClick }));
      }

      for (var _ref53 of removedLinesWithOffsets) {
        var _ref52 = _slicedToArray(_ref53, 2);

        var removedLineWithOffset = _ref52[0];
        var removedLine = _ref52[1];

        jumpTargets.push(_reactForAtom2['default'].createElement(NavigatonBarJumpTarget, {
          offsetLineNumber: removedLineWithOffset,
          key: removedLineWithOffset,
          lineNumber: removedLine,
          linesCount: linesCount,
          lineChangeClass: 'removed',
          isAddedLine: false,
          containerHeight: elementHeight,
          onClick: this._boundHandleClick }));
      }

      return _reactForAtom2['default'].createElement(
        'div',
        { className: 'nuclide-diff-view-navigation-bar' },
        jumpTargets
      );
    }
  }, {
    key: '_handleClick',
    value: function _handleClick(lineNumber, isAddedLine) {
      this.props.onClick(lineNumber, isAddedLine);
    }
  }]);

  return DiffNavigationBar;
})(_reactForAtom2['default'].Component);

exports['default'] = DiffNavigationBar;

var NavigatonBarJumpTarget = (function (_React$Component2) {
  _inherits(NavigatonBarJumpTarget, _React$Component2);

  function NavigatonBarJumpTarget(props) {
    _classCallCheck(this, NavigatonBarJumpTarget);

    _get(Object.getPrototypeOf(NavigatonBarJumpTarget.prototype), 'constructor', this).call(this, props);
    this._boundHandleClick = this._handleClick.bind(this);
  }

  _createClass(NavigatonBarJumpTarget, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var offsetLineNumber = _props2.offsetLineNumber;
      var linesCount = _props2.linesCount;
      var containerHeight = _props2.containerHeight;
      var lineChangeClass = _props2.lineChangeClass;

      var targertTop = Math.ceil(containerHeight * offsetLineNumber / linesCount);
      var targertHeight = Math.ceil(containerHeight / linesCount);
      var targetStyle = {
        top: targertTop + 'px',
        height: targertHeight + 'px'
      };
      var targetClassName = (0, _classnames3['default'])(_defineProperty({
        'nuclide-diff-view-navigation-target': true
      }, lineChangeClass, true));

      return _reactForAtom2['default'].createElement('div', {
        className: targetClassName,
        style: targetStyle,
        onClick: this._boundHandleClick });
    }
  }, {
    key: '_handleClick',
    value: function _handleClick() {
      this.props.onClick(this.props.lineNumber, this.props.isAddedLine);
    }
  }]);

  return NavigatonBarJumpTarget;
})(_reactForAtom2['default'].Component);

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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b3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2Zmc2V0TWFwfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtnZXRMaW5lQ291bnRXaXRoT2Zmc2V0cywgZ2V0T2Zmc2V0TGluZU51bWJlcn0gZnJvbSAnLi9kaWZmLXV0aWxzJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG50eXBlIERpZmZOYXZpZ2F0aW9uQmFyUHJvcHMgPSB7XG4gIGVsZW1lbnRIZWlnaHQ6IG51bWJlcjtcbiAgYWRkZWRMaW5lczogQXJyYXk8bnVtYmVyPjtcbiAgcmVtb3ZlZExpbmVzOiBBcnJheTxudW1iZXI+O1xuICBvbGRDb250ZW50czogc3RyaW5nO1xuICBuZXdDb250ZW50czogc3RyaW5nO1xuICBvbGRPZmZzZXRzOiBPZmZzZXRNYXA7XG4gIG5ld09mZnNldHM6IE9mZnNldE1hcDtcbiAgb25DbGljazogKGxpbmVOdW1iZXI6IG51bWJlciwgaXNBZGRlZExpbmU6IGJvb2xlYW4pID0+IGFueTtcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZOYXZpZ2F0aW9uQmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IERpZmZOYXZpZ2F0aW9uQmFyUHJvcHM7XG5cbiAgX2JvdW5kSGFuZGxlQ2xpY2s6IChsaW5lTnVtYmVyOiBudW1iZXIsIGlzQWRkZWRMaW5lOiBib29sZWFuKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBEaWZmTmF2aWdhdGlvbkJhclByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2JvdW5kSGFuZGxlQ2xpY2sgPSB0aGlzLl9oYW5kbGVDbGljay5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtcbiAgICAgIGFkZGVkTGluZXMsXG4gICAgICByZW1vdmVkTGluZXMsXG4gICAgICBuZXdDb250ZW50cyxcbiAgICAgIG9sZENvbnRlbnRzLFxuICAgICAgbmV3T2Zmc2V0cyxcbiAgICAgIG9sZE9mZnNldHMsXG4gICAgICBlbGVtZW50SGVpZ2h0LFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IG5ld0xpbmVzQ291bnQgPSBnZXRMaW5lQ291bnRXaXRoT2Zmc2V0cyhuZXdDb250ZW50cywgbmV3T2Zmc2V0cyk7XG4gICAgY29uc3Qgb2xkTGluZXNDb3VudCA9IGdldExpbmVDb3VudFdpdGhPZmZzZXRzKG9sZENvbnRlbnRzLCBvbGRPZmZzZXRzKTtcblxuICAgIGNvbnN0IGxpbmVzQ291bnQgPSBNYXRoLm1heChuZXdMaW5lc0NvdW50LCBvbGRMaW5lc0NvdW50KTtcblxuICAgIC8vIFRoZSBvbGQgYW5kIG5ldyB0ZXh0IGVkaXRvciBjb250ZW50cyB1c2Ugb2Zmc2V0cyB0byBjcmVhdGUgYSBnbG9iYWwgbGluZSBudW1iZXIgaWRlbnRpZmllclxuICAgIC8vIGJlaW5nIHRoZSBsaW5lIG51bWJlciB3aXRoIG9mZnNldC5cblxuICAgIC8vIEhlcmUgYXJlIHRoZSBtYXBwaW5nIGJldHdlZW4gdGhlIG9mZnNldCBsaW5lIG51bWJlcnMgdG8gdGhlIG9yaWdpbmFsIGxpbmUgbnVtYmVyLlxuICAgIGNvbnN0IGFkZGVkTGluZXNXaXRoT2Zmc2V0cyA9IG5ldyBNYXAoYWRkZWRMaW5lcy5tYXAoXG4gICAgICBhZGRlZExpbmUgPT4gW2dldE9mZnNldExpbmVOdW1iZXIoYWRkZWRMaW5lLCBuZXdPZmZzZXRzKSwgYWRkZWRMaW5lXVxuICAgICkpO1xuICAgIGNvbnN0IHJlbW92ZWRMaW5lc1dpdGhPZmZzZXRzID0gbmV3IE1hcChyZW1vdmVkTGluZXMubWFwKFxuICAgICAgcmVtb3ZlZExpbmUgPT4gW2dldE9mZnNldExpbmVOdW1iZXIocmVtb3ZlZExpbmUsIG9sZE9mZnNldHMpLCByZW1vdmVkTGluZV1cbiAgICApKTtcbiAgICAvLyBJbnRlcnNldCB0aGUgYWRkZWQgYW5kIHJlbW92ZWQgbGluZXMgbWFwcywgdGFraW5nIHRoZSB2YWx1ZXMgb2YgdGhlIGFkZGVkIGxpbmVzLlxuICAgIGNvbnN0IGNoYW5nZWRMaW5lc1dpdGhPZmZzZXRzID0gbmV3IE1hcChhcnJheVxuICAgICAgLmZyb20oYWRkZWRMaW5lc1dpdGhPZmZzZXRzLmtleXMoKSlcbiAgICAgIC5maWx0ZXIoYWRkZWRMaW5lV2l0aE9mZnNldCA9PiByZW1vdmVkTGluZXNXaXRoT2Zmc2V0cy5oYXMoYWRkZWRMaW5lV2l0aE9mZnNldCkpXG4gICAgICAubWFwKGNoYW5nZWRMaW5lV2l0aE9mZnNldCA9PiBbXG4gICAgICAgIGNoYW5nZWRMaW5lV2l0aE9mZnNldCxcbiAgICAgICAgYWRkZWRMaW5lc1dpdGhPZmZzZXRzLmdldChjaGFuZ2VkTGluZVdpdGhPZmZzZXQpLFxuICAgICAgXSlcbiAgICApO1xuXG4gICAgLy8gVGhlc2UgcmVnaW9ucyB3aWxsIG5vdyBiZSAnbW9kaWZpZWQnIHJlZ2lvbnMuXG4gICAgZm9yIChjb25zdCBjaGFuZ2VkTGluZVdpdGhPZmZzZXQgb2YgY2hhbmdlZExpbmVzV2l0aE9mZnNldHMua2V5cygpKSB7XG4gICAgICBhZGRlZExpbmVzV2l0aE9mZnNldHMuZGVsZXRlKGNoYW5nZWRMaW5lV2l0aE9mZnNldCk7XG4gICAgICByZW1vdmVkTGluZXNXaXRoT2Zmc2V0cy5kZWxldGUoY2hhbmdlZExpbmVXaXRoT2Zmc2V0KTtcbiAgICB9XG5cbiAgICBjb25zdCBqdW1wVGFyZ2V0cyA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBbYWRkZWRMaW5lV2l0aE9mZnNldCwgYWRkZWRMaW5lXSBvZiBhZGRlZExpbmVzV2l0aE9mZnNldHMpIHtcbiAgICAgIGp1bXBUYXJnZXRzLnB1c2goPE5hdmlnYXRvbkJhckp1bXBUYXJnZXRcbiAgICAgICAgb2Zmc2V0TGluZU51bWJlcj17YWRkZWRMaW5lV2l0aE9mZnNldH1cbiAgICAgICAga2V5PXthZGRlZExpbmVXaXRoT2Zmc2V0fVxuICAgICAgICBsaW5lTnVtYmVyPXthZGRlZExpbmV9XG4gICAgICAgIGxpbmVzQ291bnQ9e2xpbmVzQ291bnR9XG4gICAgICAgIGxpbmVDaGFuZ2VDbGFzcz1cImFkZGVkXCJcbiAgICAgICAgaXNBZGRlZExpbmU9e3RydWV9XG4gICAgICAgIGNvbnRhaW5lckhlaWdodD17ZWxlbWVudEhlaWdodH1cbiAgICAgICAgb25DbGljaz17dGhpcy5fYm91bmRIYW5kbGVDbGlja30vPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IFtjaGFuZ2VkTGluZVdpdGhPZmZzZXQsIGNoYW5nZWRMaW5lXSBvZiBjaGFuZ2VkTGluZXNXaXRoT2Zmc2V0cykge1xuICAgICAganVtcFRhcmdldHMucHVzaCg8TmF2aWdhdG9uQmFySnVtcFRhcmdldFxuICAgICAgICBvZmZzZXRMaW5lTnVtYmVyPXtjaGFuZ2VkTGluZVdpdGhPZmZzZXR9XG4gICAgICAgIGtleT17Y2hhbmdlZExpbmVXaXRoT2Zmc2V0fVxuICAgICAgICBsaW5lTnVtYmVyPXtjaGFuZ2VkTGluZX1cbiAgICAgICAgbGluZXNDb3VudD17bGluZXNDb3VudH1cbiAgICAgICAgbGluZUNoYW5nZUNsYXNzPVwibW9kaWZpZWRcIlxuICAgICAgICBpc0FkZGVkTGluZT17dHJ1ZX1cbiAgICAgICAgY29udGFpbmVySGVpZ2h0PXtlbGVtZW50SGVpZ2h0fVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9ib3VuZEhhbmRsZUNsaWNrfS8+XG4gICAgICApO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgW3JlbW92ZWRMaW5lV2l0aE9mZnNldCwgcmVtb3ZlZExpbmVdIG9mIHJlbW92ZWRMaW5lc1dpdGhPZmZzZXRzKSB7XG4gICAgICBqdW1wVGFyZ2V0cy5wdXNoKDxOYXZpZ2F0b25CYXJKdW1wVGFyZ2V0XG4gICAgICAgIG9mZnNldExpbmVOdW1iZXI9e3JlbW92ZWRMaW5lV2l0aE9mZnNldH1cbiAgICAgICAga2V5PXtyZW1vdmVkTGluZVdpdGhPZmZzZXR9XG4gICAgICAgIGxpbmVOdW1iZXI9e3JlbW92ZWRMaW5lfVxuICAgICAgICBsaW5lc0NvdW50PXtsaW5lc0NvdW50fVxuICAgICAgICBsaW5lQ2hhbmdlQ2xhc3M9XCJyZW1vdmVkXCJcbiAgICAgICAgaXNBZGRlZExpbmU9e2ZhbHNlfVxuICAgICAgICBjb250YWluZXJIZWlnaHQ9e2VsZW1lbnRIZWlnaHR9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX2JvdW5kSGFuZGxlQ2xpY2t9Lz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctbmF2aWdhdGlvbi1iYXJcIj5cbiAgICAgICAge2p1bXBUYXJnZXRzfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVDbGljayhsaW5lTnVtYmVyOiBudW1iZXIsIGlzQWRkZWRMaW5lOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vbkNsaWNrKGxpbmVOdW1iZXIsIGlzQWRkZWRMaW5lKTtcbiAgfVxufVxuXG50eXBlIE5hdmlnYXRvbkJhckp1bXBUYXJnZXRQcm9wcyA9IHtcbiAgb2Zmc2V0TGluZU51bWJlcjogbnVtYmVyO1xuICBsaW5lTnVtYmVyOiBudW1iZXI7XG4gIGxpbmVDaGFuZ2VDbGFzczogc3RyaW5nO1xuICBsaW5lc0NvdW50OiBudW1iZXI7XG4gIGlzQWRkZWRMaW5lOiBib29sZWFuO1xuICBjb250YWluZXJIZWlnaHQ6IG51bWJlcjtcbiAgb25DbGljazogKGxpbmVOdW1iZXI6IG51bWJlciwgaXNBZGRlZExpbmU6IGJvb2xlYW4pID0+IGFueTtcbn07XG5cbmNsYXNzIE5hdmlnYXRvbkJhckp1bXBUYXJnZXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogTmF2aWdhdG9uQmFySnVtcFRhcmdldFByb3BzO1xuXG4gIF9ib3VuZEhhbmRsZUNsaWNrOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBOYXZpZ2F0b25CYXJKdW1wVGFyZ2V0UHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fYm91bmRIYW5kbGVDbGljayA9IHRoaXMuX2hhbmRsZUNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7b2Zmc2V0TGluZU51bWJlciwgbGluZXNDb3VudCwgY29udGFpbmVySGVpZ2h0LCBsaW5lQ2hhbmdlQ2xhc3N9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB0YXJnZXJ0VG9wID0gTWF0aC5jZWlsKGNvbnRhaW5lckhlaWdodCAqIG9mZnNldExpbmVOdW1iZXIgLyBsaW5lc0NvdW50KTtcbiAgICBjb25zdCB0YXJnZXJ0SGVpZ2h0ID0gTWF0aC5jZWlsKGNvbnRhaW5lckhlaWdodCAvIGxpbmVzQ291bnQpO1xuICAgIGNvbnN0IHRhcmdldFN0eWxlID0ge1xuICAgICAgdG9wOiBgJHt0YXJnZXJ0VG9wfXB4YCxcbiAgICAgIGhlaWdodDogYCR7dGFyZ2VydEhlaWdodH1weGAsXG4gICAgfTtcbiAgICBjb25zdCB0YXJnZXRDbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcbiAgICAgICdudWNsaWRlLWRpZmYtdmlldy1uYXZpZ2F0aW9uLXRhcmdldCc6IHRydWUsXG4gICAgICBbbGluZUNoYW5nZUNsYXNzXTogdHJ1ZSxcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17dGFyZ2V0Q2xhc3NOYW1lfVxuICAgICAgICBzdHlsZT17dGFyZ2V0U3R5bGV9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX2JvdW5kSGFuZGxlQ2xpY2t9IC8+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVDbGljaygpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uQ2xpY2sodGhpcy5wcm9wcy5saW5lTnVtYmVyLCB0aGlzLnByb3BzLmlzQWRkZWRMaW5lKTtcbiAgfVxufVxuIl19