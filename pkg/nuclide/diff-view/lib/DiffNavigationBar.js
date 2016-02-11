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

        jumpTargets.push(_reactForAtom.React.createElement(NavigatonBarJumpTarget, {
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

        jumpTargets.push(_reactForAtom.React.createElement(NavigatonBarJumpTarget, {
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

        jumpTargets.push(_reactForAtom.React.createElement(NavigatonBarJumpTarget, {
          offsetLineNumber: removedLineWithOffset,
          key: removedLineWithOffset,
          lineNumber: removedLine,
          linesCount: linesCount,
          lineChangeClass: 'removed',
          isAddedLine: false,
          containerHeight: elementHeight,
          onClick: this._boundHandleClick }));
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

      return _reactForAtom.React.createElement('div', {
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
})(_reactForAtom.React.Component);

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZOYXZpZ2F0aW9uQmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VCQWFvQixlQUFlOzs0QkFDZixnQkFBZ0I7O3lCQUN1QixjQUFjOzsyQkFDbEQsWUFBWTs7Ozs7O0lBY2QsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFLekIsV0FMUSxpQkFBaUIsQ0FLeEIsS0FBNkIsRUFBRTswQkFMeEIsaUJBQWlCOztBQU1sQywrQkFOaUIsaUJBQWlCLDZDQU01QixLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdkQ7O2VBUmtCLGlCQUFpQjs7V0FVOUIsa0JBQWtCO21CQVNsQixJQUFJLENBQUMsS0FBSztVQVBaLFVBQVUsVUFBVixVQUFVO1VBQ1YsWUFBWSxVQUFaLFlBQVk7VUFDWixXQUFXLFVBQVgsV0FBVztVQUNYLFdBQVcsVUFBWCxXQUFXO1VBQ1gsVUFBVSxVQUFWLFVBQVU7VUFDVixVQUFVLFVBQVYsVUFBVTtVQUNWLGFBQWEsVUFBYixhQUFhOztBQUVmLFVBQU0sYUFBYSxHQUFHLHdDQUF3QixXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdkUsVUFBTSxhQUFhLEdBQUcsd0NBQXdCLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQzs7QUFFdkUsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7Ozs7OztBQU0xRCxVQUFNLHFCQUFxQixHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQ2xELFVBQUEsU0FBUztlQUFJLENBQUMsb0NBQW9CLFNBQVMsRUFBRSxVQUFVLENBQUMsRUFBRSxTQUFTLENBQUM7T0FBQSxDQUNyRSxDQUFDLENBQUM7QUFDSCxVQUFNLHVCQUF1QixHQUFHLElBQUksR0FBRyxDQUFDLFlBQVksQ0FB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Y2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2Zmc2V0TWFwfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge2dldExpbmVDb3VudFdpdGhPZmZzZXRzLCBnZXRPZmZzZXRMaW5lTnVtYmVyfSBmcm9tICcuL2RpZmYtdXRpbHMnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbnR5cGUgRGlmZk5hdmlnYXRpb25CYXJQcm9wcyA9IHtcbiAgZWxlbWVudEhlaWdodDogbnVtYmVyO1xuICBhZGRlZExpbmVzOiBBcnJheTxudW1iZXI+O1xuICByZW1vdmVkTGluZXM6IEFycmF5PG51bWJlcj47XG4gIG9sZENvbnRlbnRzOiBzdHJpbmc7XG4gIG5ld0NvbnRlbnRzOiBzdHJpbmc7XG4gIG9sZE9mZnNldHM6IE9mZnNldE1hcDtcbiAgbmV3T2Zmc2V0czogT2Zmc2V0TWFwO1xuICBvbkNsaWNrOiAobGluZU51bWJlcjogbnVtYmVyLCBpc0FkZGVkTGluZTogYm9vbGVhbikgPT4gYW55O1xufTtcblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZk5hdmlnYXRpb25CYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogRGlmZk5hdmlnYXRpb25CYXJQcm9wcztcblxuICBfYm91bmRIYW5kbGVDbGljazogKGxpbmVOdW1iZXI6IG51bWJlciwgaXNBZGRlZExpbmU6IGJvb2xlYW4pID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IERpZmZOYXZpZ2F0aW9uQmFyUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fYm91bmRIYW5kbGVDbGljayA9IHRoaXMuX2hhbmRsZUNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge1xuICAgICAgYWRkZWRMaW5lcyxcbiAgICAgIHJlbW92ZWRMaW5lcyxcbiAgICAgIG5ld0NvbnRlbnRzLFxuICAgICAgb2xkQ29udGVudHMsXG4gICAgICBuZXdPZmZzZXRzLFxuICAgICAgb2xkT2Zmc2V0cyxcbiAgICAgIGVsZW1lbnRIZWlnaHQsXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgbmV3TGluZXNDb3VudCA9IGdldExpbmVDb3VudFdpdGhPZmZzZXRzKG5ld0NvbnRlbnRzLCBuZXdPZmZzZXRzKTtcbiAgICBjb25zdCBvbGRMaW5lc0NvdW50ID0gZ2V0TGluZUNvdW50V2l0aE9mZnNldHMob2xkQ29udGVudHMsIG9sZE9mZnNldHMpO1xuXG4gICAgY29uc3QgbGluZXNDb3VudCA9IE1hdGgubWF4KG5ld0xpbmVzQ291bnQsIG9sZExpbmVzQ291bnQpO1xuXG4gICAgLy8gVGhlIG9sZCBhbmQgbmV3IHRleHQgZWRpdG9yIGNvbnRlbnRzIHVzZSBvZmZzZXRzIHRvIGNyZWF0ZSBhIGdsb2JhbCBsaW5lIG51bWJlciBpZGVudGlmaWVyXG4gICAgLy8gYmVpbmcgdGhlIGxpbmUgbnVtYmVyIHdpdGggb2Zmc2V0LlxuXG4gICAgLy8gSGVyZSBhcmUgdGhlIG1hcHBpbmcgYmV0d2VlbiB0aGUgb2Zmc2V0IGxpbmUgbnVtYmVycyB0byB0aGUgb3JpZ2luYWwgbGluZSBudW1iZXIuXG4gICAgY29uc3QgYWRkZWRMaW5lc1dpdGhPZmZzZXRzID0gbmV3IE1hcChhZGRlZExpbmVzLm1hcChcbiAgICAgIGFkZGVkTGluZSA9PiBbZ2V0T2Zmc2V0TGluZU51bWJlcihhZGRlZExpbmUsIG5ld09mZnNldHMpLCBhZGRlZExpbmVdXG4gICAgKSk7XG4gICAgY29uc3QgcmVtb3ZlZExpbmVzV2l0aE9mZnNldHMgPSBuZXcgTWFwKHJlbW92ZWRMaW5lcy5tYXAoXG4gICAgICByZW1vdmVkTGluZSA9PiBbZ2V0T2Zmc2V0TGluZU51bWJlcihyZW1vdmVkTGluZSwgb2xkT2Zmc2V0cyksIHJlbW92ZWRMaW5lXVxuICAgICkpO1xuICAgIC8vIEludGVyc2V0IHRoZSBhZGRlZCBhbmQgcmVtb3ZlZCBsaW5lcyBtYXBzLCB0YWtpbmcgdGhlIHZhbHVlcyBvZiB0aGUgYWRkZWQgbGluZXMuXG4gICAgY29uc3QgY2hhbmdlZExpbmVzV2l0aE9mZnNldHMgPSBuZXcgTWFwKGFycmF5XG4gICAgICAuZnJvbShhZGRlZExpbmVzV2l0aE9mZnNldHMua2V5cygpKVxuICAgICAgLmZpbHRlcihhZGRlZExpbmVXaXRoT2Zmc2V0ID0+IHJlbW92ZWRMaW5lc1dpdGhPZmZzZXRzLmhhcyhhZGRlZExpbmVXaXRoT2Zmc2V0KSlcbiAgICAgIC5tYXAoY2hhbmdlZExpbmVXaXRoT2Zmc2V0ID0+IFtcbiAgICAgICAgY2hhbmdlZExpbmVXaXRoT2Zmc2V0LFxuICAgICAgICBhZGRlZExpbmVzV2l0aE9mZnNldHMuZ2V0KGNoYW5nZWRMaW5lV2l0aE9mZnNldCksXG4gICAgICBdKVxuICAgICk7XG5cbiAgICAvLyBUaGVzZSByZWdpb25zIHdpbGwgbm93IGJlICdtb2RpZmllZCcgcmVnaW9ucy5cbiAgICBmb3IgKGNvbnN0IGNoYW5nZWRMaW5lV2l0aE9mZnNldCBvZiBjaGFuZ2VkTGluZXNXaXRoT2Zmc2V0cy5rZXlzKCkpIHtcbiAgICAgIGFkZGVkTGluZXNXaXRoT2Zmc2V0cy5kZWxldGUoY2hhbmdlZExpbmVXaXRoT2Zmc2V0KTtcbiAgICAgIHJlbW92ZWRMaW5lc1dpdGhPZmZzZXRzLmRlbGV0ZShjaGFuZ2VkTGluZVdpdGhPZmZzZXQpO1xuICAgIH1cblxuICAgIGNvbnN0IGp1bXBUYXJnZXRzID0gW107XG5cbiAgICBmb3IgKGNvbnN0IFthZGRlZExpbmVXaXRoT2Zmc2V0LCBhZGRlZExpbmVdIG9mIGFkZGVkTGluZXNXaXRoT2Zmc2V0cykge1xuICAgICAganVtcFRhcmdldHMucHVzaCg8TmF2aWdhdG9uQmFySnVtcFRhcmdldFxuICAgICAgICBvZmZzZXRMaW5lTnVtYmVyPXthZGRlZExpbmVXaXRoT2Zmc2V0fVxuICAgICAgICBrZXk9e2FkZGVkTGluZVdpdGhPZmZzZXR9XG4gICAgICAgIGxpbmVOdW1iZXI9e2FkZGVkTGluZX1cbiAgICAgICAgbGluZXNDb3VudD17bGluZXNDb3VudH1cbiAgICAgICAgbGluZUNoYW5nZUNsYXNzPVwiYWRkZWRcIlxuICAgICAgICBpc0FkZGVkTGluZT17dHJ1ZX1cbiAgICAgICAgY29udGFpbmVySGVpZ2h0PXtlbGVtZW50SGVpZ2h0fVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9ib3VuZEhhbmRsZUNsaWNrfS8+XG4gICAgICApO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgW2NoYW5nZWRMaW5lV2l0aE9mZnNldCwgY2hhbmdlZExpbmVdIG9mIGNoYW5nZWRMaW5lc1dpdGhPZmZzZXRzKSB7XG4gICAgICBqdW1wVGFyZ2V0cy5wdXNoKDxOYXZpZ2F0b25CYXJKdW1wVGFyZ2V0XG4gICAgICAgIG9mZnNldExpbmVOdW1iZXI9e2NoYW5nZWRMaW5lV2l0aE9mZnNldH1cbiAgICAgICAga2V5PXtjaGFuZ2VkTGluZVdpdGhPZmZzZXR9XG4gICAgICAgIGxpbmVOdW1iZXI9e2NoYW5nZWRMaW5lfVxuICAgICAgICBsaW5lc0NvdW50PXtsaW5lc0NvdW50fVxuICAgICAgICBsaW5lQ2hhbmdlQ2xhc3M9XCJtb2RpZmllZFwiXG4gICAgICAgIGlzQWRkZWRMaW5lPXt0cnVlfVxuICAgICAgICBjb250YWluZXJIZWlnaHQ9e2VsZW1lbnRIZWlnaHR9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX2JvdW5kSGFuZGxlQ2xpY2t9Lz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBbcmVtb3ZlZExpbmVXaXRoT2Zmc2V0LCByZW1vdmVkTGluZV0gb2YgcmVtb3ZlZExpbmVzV2l0aE9mZnNldHMpIHtcbiAgICAgIGp1bXBUYXJnZXRzLnB1c2goPE5hdmlnYXRvbkJhckp1bXBUYXJnZXRcbiAgICAgICAgb2Zmc2V0TGluZU51bWJlcj17cmVtb3ZlZExpbmVXaXRoT2Zmc2V0fVxuICAgICAgICBrZXk9e3JlbW92ZWRMaW5lV2l0aE9mZnNldH1cbiAgICAgICAgbGluZU51bWJlcj17cmVtb3ZlZExpbmV9XG4gICAgICAgIGxpbmVzQ291bnQ9e2xpbmVzQ291bnR9XG4gICAgICAgIGxpbmVDaGFuZ2VDbGFzcz1cInJlbW92ZWRcIlxuICAgICAgICBpc0FkZGVkTGluZT17ZmFsc2V9XG4gICAgICAgIGNvbnRhaW5lckhlaWdodD17ZWxlbWVudEhlaWdodH1cbiAgICAgICAgb25DbGljaz17dGhpcy5fYm91bmRIYW5kbGVDbGlja30vPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy1uYXZpZ2F0aW9uLWJhclwiPlxuICAgICAgICB7anVtcFRhcmdldHN9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUNsaWNrKGxpbmVOdW1iZXI6IG51bWJlciwgaXNBZGRlZExpbmU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uQ2xpY2sobGluZU51bWJlciwgaXNBZGRlZExpbmUpO1xuICB9XG59XG5cbnR5cGUgTmF2aWdhdG9uQmFySnVtcFRhcmdldFByb3BzID0ge1xuICBvZmZzZXRMaW5lTnVtYmVyOiBudW1iZXI7XG4gIGxpbmVOdW1iZXI6IG51bWJlcjtcbiAgbGluZUNoYW5nZUNsYXNzOiBzdHJpbmc7XG4gIGxpbmVzQ291bnQ6IG51bWJlcjtcbiAgaXNBZGRlZExpbmU6IGJvb2xlYW47XG4gIGNvbnRhaW5lckhlaWdodDogbnVtYmVyO1xuICBvbkNsaWNrOiAobGluZU51bWJlcjogbnVtYmVyLCBpc0FkZGVkTGluZTogYm9vbGVhbikgPT4gYW55O1xufTtcblxuY2xhc3MgTmF2aWdhdG9uQmFySnVtcFRhcmdldCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBOYXZpZ2F0b25CYXJKdW1wVGFyZ2V0UHJvcHM7XG5cbiAgX2JvdW5kSGFuZGxlQ2xpY2s6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE5hdmlnYXRvbkJhckp1bXBUYXJnZXRQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZUNsaWNrID0gdGhpcy5faGFuZGxlQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtvZmZzZXRMaW5lTnVtYmVyLCBsaW5lc0NvdW50LCBjb250YWluZXJIZWlnaHQsIGxpbmVDaGFuZ2VDbGFzc30gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHRhcmdlcnRUb3AgPSBNYXRoLmNlaWwoY29udGFpbmVySGVpZ2h0ICogb2Zmc2V0TGluZU51bWJlciAvIGxpbmVzQ291bnQpO1xuICAgIGNvbnN0IHRhcmdlcnRIZWlnaHQgPSBNYXRoLmNlaWwoY29udGFpbmVySGVpZ2h0IC8gbGluZXNDb3VudCk7XG4gICAgY29uc3QgdGFyZ2V0U3R5bGUgPSB7XG4gICAgICB0b3A6IGAke3RhcmdlcnRUb3B9cHhgLFxuICAgICAgaGVpZ2h0OiBgJHt0YXJnZXJ0SGVpZ2h0fXB4YCxcbiAgICB9O1xuICAgIGNvbnN0IHRhcmdldENsYXNzTmFtZSA9IGNsYXNzbmFtZXMoe1xuICAgICAgJ251Y2xpZGUtZGlmZi12aWV3LW5hdmlnYXRpb24tdGFyZ2V0JzogdHJ1ZSxcbiAgICAgIFtsaW5lQ2hhbmdlQ2xhc3NdOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXt0YXJnZXRDbGFzc05hbWV9XG4gICAgICAgIHN0eWxlPXt0YXJnZXRTdHlsZX1cbiAgICAgICAgb25DbGljaz17dGhpcy5fYm91bmRIYW5kbGVDbGlja30gLz5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUNsaWNrKCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25DbGljayh0aGlzLnByb3BzLmxpbmVOdW1iZXIsIHRoaXMucHJvcHMuaXNBZGRlZExpbmUpO1xuICB9XG59XG4iXX0=