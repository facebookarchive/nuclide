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

var _nuclideCommons = require('../../nuclide-commons');

var _reactForAtom = require('react-for-atom');

var _diffUtils = require('./diff-utils');

var _classnames2 = require('classnames');

var _classnames3 = _interopRequireDefault(_classnames2);

var DiffNavigationBar = (function (_React$Component) {
  _inherits(DiffNavigationBar, _React$Component);

  function DiffNavigationBar(props) {
    _classCallCheck(this, DiffNavigationBar);

    _get(Object.getPrototypeOf(DiffNavigationBar.prototype), 'constructor', this).call(this, props);
    this._handleClick = this._handleClick.bind(this);
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
      var changedLinesWithOffsets = new Map(_nuclideCommons.array.from(addedLinesWithOffsets.keys()).filter(function (addedLineWithOffset) {
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

        jumpTargets.push(_reactForAtom.React.createElement(NavigatonBarJumpTarget, {
          offsetLineNumber: addedLineWithOffset,
          key: addedLineWithOffset,
          lineNumber: addedLine,
          linesCount: linesCount,
          lineChangeClass: 'added',
          isAddedLine: true,
          containerHeight: elementHeight,
          onClick: this._handleClick
        }));
      }

      for (var _ref43 of changedLinesWithOffsets) {
        var _ref42 = _slicedToArray(_ref43, 2);

        var changedLineWithOffset = _ref42[0];
        var changedLine = _ref42[1];

        jumpTargets.push(_reactForAtom.React.createElement(NavigatonBarJumpTarget, {
          offsetLineNumber: changedLineWithOffset,
          key: changedLineWithOffset,
          lineNumber: changedLine,
          linesCount: linesCount,
          lineChangeClass: 'modified',
          isAddedLine: true,
          containerHeight: elementHeight,
          onClick: this._handleClick
        }));
      }

      for (var _ref53 of removedLinesWithOffsets) {
        var _ref52 = _slicedToArray(_ref53, 2);

        var removedLineWithOffset = _ref52[0];
        var removedLine = _ref52[1];

        jumpTargets.push(_reactForAtom.React.createElement(NavigatonBarJumpTarget, {
          offsetLineNumber: removedLineWithOffset,
          key: removedLineWithOffset,
          lineNumber: removedLine,
          linesCount: linesCount,
          lineChangeClass: 'removed',
          isAddedLine: false,
          containerHeight: elementHeight,
          onClick: this._handleClick
        }));
      }

      return _reactForAtom.React.createElement(
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
})(_reactForAtom.React.Component);

exports['default'] = DiffNavigationBar;

var NavigatonBarJumpTarget = (function (_React$Component2) {
  _inherits(NavigatonBarJumpTarget, _React$Component2);

  function NavigatonBarJumpTarget(props) {
    _classCallCheck(this, NavigatonBarJumpTarget);

    _get(Object.getPrototypeOf(NavigatonBarJumpTarget.prototype), 'constructor', this).call(this, props);
    this._handleClick = this._handleClick.bind(this);
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

      return _reactForAtom.React.createElement('div', {
        className: targetClassName,
        style: targetStyle,
        onClick: this._handleClick
      });
    }
  }, {
    key: '_handleClick',
    value: function _handleClick() {
      this.props.onClick(this.props.lineNumber, this.props.isAddedLine);
    }
  }]);

  return NavigatonBarJumpTarget;
})(_reactForAtom.React.Component);

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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Y2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2Zmc2V0TWFwfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7Z2V0TGluZUNvdW50V2l0aE9mZnNldHMsIGdldE9mZnNldExpbmVOdW1iZXJ9IGZyb20gJy4vZGlmZi11dGlscyc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxudHlwZSBEaWZmTmF2aWdhdGlvbkJhclByb3BzID0ge1xuICBlbGVtZW50SGVpZ2h0OiBudW1iZXI7XG4gIGFkZGVkTGluZXM6IEFycmF5PG51bWJlcj47XG4gIHJlbW92ZWRMaW5lczogQXJyYXk8bnVtYmVyPjtcbiAgb2xkQ29udGVudHM6IHN0cmluZztcbiAgbmV3Q29udGVudHM6IHN0cmluZztcbiAgb2xkT2Zmc2V0czogT2Zmc2V0TWFwO1xuICBuZXdPZmZzZXRzOiBPZmZzZXRNYXA7XG4gIG9uQ2xpY2s6IChsaW5lTnVtYmVyOiBudW1iZXIsIGlzQWRkZWRMaW5lOiBib29sZWFuKSA9PiBhbnk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWZmTmF2aWdhdGlvbkJhciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBEaWZmTmF2aWdhdGlvbkJhclByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBEaWZmTmF2aWdhdGlvbkJhclByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDbGljayA9IHRoaXMuX2hhbmRsZUNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge1xuICAgICAgYWRkZWRMaW5lcyxcbiAgICAgIHJlbW92ZWRMaW5lcyxcbiAgICAgIG5ld0NvbnRlbnRzLFxuICAgICAgb2xkQ29udGVudHMsXG4gICAgICBuZXdPZmZzZXRzLFxuICAgICAgb2xkT2Zmc2V0cyxcbiAgICAgIGVsZW1lbnRIZWlnaHQsXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgbmV3TGluZXNDb3VudCA9IGdldExpbmVDb3VudFdpdGhPZmZzZXRzKG5ld0NvbnRlbnRzLCBuZXdPZmZzZXRzKTtcbiAgICBjb25zdCBvbGRMaW5lc0NvdW50ID0gZ2V0TGluZUNvdW50V2l0aE9mZnNldHMob2xkQ29udGVudHMsIG9sZE9mZnNldHMpO1xuXG4gICAgY29uc3QgbGluZXNDb3VudCA9IE1hdGgubWF4KG5ld0xpbmVzQ291bnQsIG9sZExpbmVzQ291bnQpO1xuXG4gICAgLy8gVGhlIG9sZCBhbmQgbmV3IHRleHQgZWRpdG9yIGNvbnRlbnRzIHVzZSBvZmZzZXRzIHRvIGNyZWF0ZSBhIGdsb2JhbCBsaW5lIG51bWJlciBpZGVudGlmaWVyXG4gICAgLy8gYmVpbmcgdGhlIGxpbmUgbnVtYmVyIHdpdGggb2Zmc2V0LlxuXG4gICAgLy8gSGVyZSBhcmUgdGhlIG1hcHBpbmcgYmV0d2VlbiB0aGUgb2Zmc2V0IGxpbmUgbnVtYmVycyB0byB0aGUgb3JpZ2luYWwgbGluZSBudW1iZXIuXG4gICAgY29uc3QgYWRkZWRMaW5lc1dpdGhPZmZzZXRzID0gbmV3IE1hcChhZGRlZExpbmVzLm1hcChcbiAgICAgIGFkZGVkTGluZSA9PiBbZ2V0T2Zmc2V0TGluZU51bWJlcihhZGRlZExpbmUsIG5ld09mZnNldHMpLCBhZGRlZExpbmVdXG4gICAgKSk7XG4gICAgY29uc3QgcmVtb3ZlZExpbmVzV2l0aE9mZnNldHMgPSBuZXcgTWFwKHJlbW92ZWRMaW5lcy5tYXAoXG4gICAgICByZW1vdmVkTGluZSA9PiBbZ2V0T2Zmc2V0TGluZU51bWJlcihyZW1vdmVkTGluZSwgb2xkT2Zmc2V0cyksIHJlbW92ZWRMaW5lXVxuICAgICkpO1xuICAgIC8vIEludGVyc2V0IHRoZSBhZGRlZCBhbmQgcmVtb3ZlZCBsaW5lcyBtYXBzLCB0YWtpbmcgdGhlIHZhbHVlcyBvZiB0aGUgYWRkZWQgbGluZXMuXG4gICAgY29uc3QgY2hhbmdlZExpbmVzV2l0aE9mZnNldHMgPSBuZXcgTWFwKGFycmF5XG4gICAgICAuZnJvbShhZGRlZExpbmVzV2l0aE9mZnNldHMua2V5cygpKVxuICAgICAgLmZpbHRlcihhZGRlZExpbmVXaXRoT2Zmc2V0ID0+IHJlbW92ZWRMaW5lc1dpdGhPZmZzZXRzLmhhcyhhZGRlZExpbmVXaXRoT2Zmc2V0KSlcbiAgICAgIC5tYXAoY2hhbmdlZExpbmVXaXRoT2Zmc2V0ID0+IFtcbiAgICAgICAgY2hhbmdlZExpbmVXaXRoT2Zmc2V0LFxuICAgICAgICBhZGRlZExpbmVzV2l0aE9mZnNldHMuZ2V0KGNoYW5nZWRMaW5lV2l0aE9mZnNldCksXG4gICAgICBdKVxuICAgICk7XG5cbiAgICAvLyBUaGVzZSByZWdpb25zIHdpbGwgbm93IGJlICdtb2RpZmllZCcgcmVnaW9ucy5cbiAgICBmb3IgKGNvbnN0IGNoYW5nZWRMaW5lV2l0aE9mZnNldCBvZiBjaGFuZ2VkTGluZXNXaXRoT2Zmc2V0cy5rZXlzKCkpIHtcbiAgICAgIGFkZGVkTGluZXNXaXRoT2Zmc2V0cy5kZWxldGUoY2hhbmdlZExpbmVXaXRoT2Zmc2V0KTtcbiAgICAgIHJlbW92ZWRMaW5lc1dpdGhPZmZzZXRzLmRlbGV0ZShjaGFuZ2VkTGluZVdpdGhPZmZzZXQpO1xuICAgIH1cblxuICAgIGNvbnN0IGp1bXBUYXJnZXRzID0gW107XG5cbiAgICBmb3IgKGNvbnN0IFthZGRlZExpbmVXaXRoT2Zmc2V0LCBhZGRlZExpbmVdIG9mIGFkZGVkTGluZXNXaXRoT2Zmc2V0cykge1xuICAgICAganVtcFRhcmdldHMucHVzaChcbiAgICAgICAgPE5hdmlnYXRvbkJhckp1bXBUYXJnZXRcbiAgICAgICAgICBvZmZzZXRMaW5lTnVtYmVyPXthZGRlZExpbmVXaXRoT2Zmc2V0fVxuICAgICAgICAgIGtleT17YWRkZWRMaW5lV2l0aE9mZnNldH1cbiAgICAgICAgICBsaW5lTnVtYmVyPXthZGRlZExpbmV9XG4gICAgICAgICAgbGluZXNDb3VudD17bGluZXNDb3VudH1cbiAgICAgICAgICBsaW5lQ2hhbmdlQ2xhc3M9XCJhZGRlZFwiXG4gICAgICAgICAgaXNBZGRlZExpbmU9e3RydWV9XG4gICAgICAgICAgY29udGFpbmVySGVpZ2h0PXtlbGVtZW50SGVpZ2h0fVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUNsaWNrfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IFtjaGFuZ2VkTGluZVdpdGhPZmZzZXQsIGNoYW5nZWRMaW5lXSBvZiBjaGFuZ2VkTGluZXNXaXRoT2Zmc2V0cykge1xuICAgICAganVtcFRhcmdldHMucHVzaChcbiAgICAgICAgPE5hdmlnYXRvbkJhckp1bXBUYXJnZXRcbiAgICAgICAgICBvZmZzZXRMaW5lTnVtYmVyPXtjaGFuZ2VkTGluZVdpdGhPZmZzZXR9XG4gICAgICAgICAga2V5PXtjaGFuZ2VkTGluZVdpdGhPZmZzZXR9XG4gICAgICAgICAgbGluZU51bWJlcj17Y2hhbmdlZExpbmV9XG4gICAgICAgICAgbGluZXNDb3VudD17bGluZXNDb3VudH1cbiAgICAgICAgICBsaW5lQ2hhbmdlQ2xhc3M9XCJtb2RpZmllZFwiXG4gICAgICAgICAgaXNBZGRlZExpbmU9e3RydWV9XG4gICAgICAgICAgY29udGFpbmVySGVpZ2h0PXtlbGVtZW50SGVpZ2h0fVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUNsaWNrfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IFtyZW1vdmVkTGluZVdpdGhPZmZzZXQsIHJlbW92ZWRMaW5lXSBvZiByZW1vdmVkTGluZXNXaXRoT2Zmc2V0cykge1xuICAgICAganVtcFRhcmdldHMucHVzaChcbiAgICAgICAgPE5hdmlnYXRvbkJhckp1bXBUYXJnZXRcbiAgICAgICAgICBvZmZzZXRMaW5lTnVtYmVyPXtyZW1vdmVkTGluZVdpdGhPZmZzZXR9XG4gICAgICAgICAga2V5PXtyZW1vdmVkTGluZVdpdGhPZmZzZXR9XG4gICAgICAgICAgbGluZU51bWJlcj17cmVtb3ZlZExpbmV9XG4gICAgICAgICAgbGluZXNDb3VudD17bGluZXNDb3VudH1cbiAgICAgICAgICBsaW5lQ2hhbmdlQ2xhc3M9XCJyZW1vdmVkXCJcbiAgICAgICAgICBpc0FkZGVkTGluZT17ZmFsc2V9XG4gICAgICAgICAgY29udGFpbmVySGVpZ2h0PXtlbGVtZW50SGVpZ2h0fVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUNsaWNrfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy1uYXZpZ2F0aW9uLWJhclwiPlxuICAgICAgICB7anVtcFRhcmdldHN9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUNsaWNrKGxpbmVOdW1iZXI6IG51bWJlciwgaXNBZGRlZExpbmU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uQ2xpY2sobGluZU51bWJlciwgaXNBZGRlZExpbmUpO1xuICB9XG59XG5cbnR5cGUgTmF2aWdhdG9uQmFySnVtcFRhcmdldFByb3BzID0ge1xuICBvZmZzZXRMaW5lTnVtYmVyOiBudW1iZXI7XG4gIGxpbmVOdW1iZXI6IG51bWJlcjtcbiAgbGluZUNoYW5nZUNsYXNzOiBzdHJpbmc7XG4gIGxpbmVzQ291bnQ6IG51bWJlcjtcbiAgaXNBZGRlZExpbmU6IGJvb2xlYW47XG4gIGNvbnRhaW5lckhlaWdodDogbnVtYmVyO1xuICBvbkNsaWNrOiAobGluZU51bWJlcjogbnVtYmVyLCBpc0FkZGVkTGluZTogYm9vbGVhbikgPT4gYW55O1xufTtcblxuY2xhc3MgTmF2aWdhdG9uQmFySnVtcFRhcmdldCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBOYXZpZ2F0b25CYXJKdW1wVGFyZ2V0UHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE5hdmlnYXRvbkJhckp1bXBUYXJnZXRQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQ2xpY2sgPSB0aGlzLl9oYW5kbGVDbGljay5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge29mZnNldExpbmVOdW1iZXIsIGxpbmVzQ291bnQsIGNvbnRhaW5lckhlaWdodCwgbGluZUNoYW5nZUNsYXNzfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgdGFyZ2VydFRvcCA9IE1hdGguY2VpbChjb250YWluZXJIZWlnaHQgKiBvZmZzZXRMaW5lTnVtYmVyIC8gbGluZXNDb3VudCk7XG4gICAgY29uc3QgdGFyZ2VydEhlaWdodCA9IE1hdGguY2VpbChjb250YWluZXJIZWlnaHQgLyBsaW5lc0NvdW50KTtcbiAgICBjb25zdCB0YXJnZXRTdHlsZSA9IHtcbiAgICAgIHRvcDogYCR7dGFyZ2VydFRvcH1weGAsXG4gICAgICBoZWlnaHQ6IGAke3RhcmdlcnRIZWlnaHR9cHhgLFxuICAgIH07XG4gICAgY29uc3QgdGFyZ2V0Q2xhc3NOYW1lID0gY2xhc3NuYW1lcyh7XG4gICAgICAnbnVjbGlkZS1kaWZmLXZpZXctbmF2aWdhdGlvbi10YXJnZXQnOiB0cnVlLFxuICAgICAgW2xpbmVDaGFuZ2VDbGFzc106IHRydWUsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e3RhcmdldENsYXNzTmFtZX1cbiAgICAgICAgc3R5bGU9e3RhcmdldFN0eWxlfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDbGlja31cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVDbGljaygpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uQ2xpY2sodGhpcy5wcm9wcy5saW5lTnVtYmVyLCB0aGlzLnByb3BzLmlzQWRkZWRMaW5lKTtcbiAgfVxufVxuIl19