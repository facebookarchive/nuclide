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
//# sourceMappingURL=data:application/json;base64,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c0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09mZnNldE1hcH0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtnZXRMaW5lQ291bnRXaXRoT2Zmc2V0cywgZ2V0T2Zmc2V0TGluZU51bWJlcn0gZnJvbSAnLi9kaWZmLXV0aWxzJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG50eXBlIERpZmZOYXZpZ2F0aW9uQmFyUHJvcHMgPSB7XG4gIGVsZW1lbnRIZWlnaHQ6IG51bWJlcjtcbiAgYWRkZWRMaW5lczogQXJyYXk8bnVtYmVyPjtcbiAgcmVtb3ZlZExpbmVzOiBBcnJheTxudW1iZXI+O1xuICBvbGRDb250ZW50czogc3RyaW5nO1xuICBuZXdDb250ZW50czogc3RyaW5nO1xuICBvbGRPZmZzZXRzOiBPZmZzZXRNYXA7XG4gIG5ld09mZnNldHM6IE9mZnNldE1hcDtcbiAgb25DbGljazogKGxpbmVOdW1iZXI6IG51bWJlciwgaXNBZGRlZExpbmU6IGJvb2xlYW4pID0+IGFueTtcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZOYXZpZ2F0aW9uQmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IERpZmZOYXZpZ2F0aW9uQmFyUHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IERpZmZOYXZpZ2F0aW9uQmFyUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUNsaWNrID0gdGhpcy5faGFuZGxlQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7XG4gICAgICBhZGRlZExpbmVzLFxuICAgICAgcmVtb3ZlZExpbmVzLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBvbGRDb250ZW50cyxcbiAgICAgIG5ld09mZnNldHMsXG4gICAgICBvbGRPZmZzZXRzLFxuICAgICAgZWxlbWVudEhlaWdodCxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBuZXdMaW5lc0NvdW50ID0gZ2V0TGluZUNvdW50V2l0aE9mZnNldHMobmV3Q29udGVudHMsIG5ld09mZnNldHMpO1xuICAgIGNvbnN0IG9sZExpbmVzQ291bnQgPSBnZXRMaW5lQ291bnRXaXRoT2Zmc2V0cyhvbGRDb250ZW50cywgb2xkT2Zmc2V0cyk7XG5cbiAgICBjb25zdCBsaW5lc0NvdW50ID0gTWF0aC5tYXgobmV3TGluZXNDb3VudCwgb2xkTGluZXNDb3VudCk7XG5cbiAgICAvLyBUaGUgb2xkIGFuZCBuZXcgdGV4dCBlZGl0b3IgY29udGVudHMgdXNlIG9mZnNldHMgdG8gY3JlYXRlIGEgZ2xvYmFsIGxpbmUgbnVtYmVyIGlkZW50aWZpZXJcbiAgICAvLyBiZWluZyB0aGUgbGluZSBudW1iZXIgd2l0aCBvZmZzZXQuXG5cbiAgICAvLyBIZXJlIGFyZSB0aGUgbWFwcGluZyBiZXR3ZWVuIHRoZSBvZmZzZXQgbGluZSBudW1iZXJzIHRvIHRoZSBvcmlnaW5hbCBsaW5lIG51bWJlci5cbiAgICBjb25zdCBhZGRlZExpbmVzV2l0aE9mZnNldHMgPSBuZXcgTWFwKGFkZGVkTGluZXMubWFwKFxuICAgICAgYWRkZWRMaW5lID0+IFtnZXRPZmZzZXRMaW5lTnVtYmVyKGFkZGVkTGluZSwgbmV3T2Zmc2V0cyksIGFkZGVkTGluZV1cbiAgICApKTtcbiAgICBjb25zdCByZW1vdmVkTGluZXNXaXRoT2Zmc2V0cyA9IG5ldyBNYXAocmVtb3ZlZExpbmVzLm1hcChcbiAgICAgIHJlbW92ZWRMaW5lID0+IFtnZXRPZmZzZXRMaW5lTnVtYmVyKHJlbW92ZWRMaW5lLCBvbGRPZmZzZXRzKSwgcmVtb3ZlZExpbmVdXG4gICAgKSk7XG4gICAgLy8gSW50ZXJzZXQgdGhlIGFkZGVkIGFuZCByZW1vdmVkIGxpbmVzIG1hcHMsIHRha2luZyB0aGUgdmFsdWVzIG9mIHRoZSBhZGRlZCBsaW5lcy5cbiAgICBjb25zdCBjaGFuZ2VkTGluZXNXaXRoT2Zmc2V0cyA9IG5ldyBNYXAoYXJyYXlcbiAgICAgIC5mcm9tKGFkZGVkTGluZXNXaXRoT2Zmc2V0cy5rZXlzKCkpXG4gICAgICAuZmlsdGVyKGFkZGVkTGluZVdpdGhPZmZzZXQgPT4gcmVtb3ZlZExpbmVzV2l0aE9mZnNldHMuaGFzKGFkZGVkTGluZVdpdGhPZmZzZXQpKVxuICAgICAgLm1hcChjaGFuZ2VkTGluZVdpdGhPZmZzZXQgPT4gW1xuICAgICAgICBjaGFuZ2VkTGluZVdpdGhPZmZzZXQsXG4gICAgICAgIGFkZGVkTGluZXNXaXRoT2Zmc2V0cy5nZXQoY2hhbmdlZExpbmVXaXRoT2Zmc2V0KSxcbiAgICAgIF0pXG4gICAgKTtcblxuICAgIC8vIFRoZXNlIHJlZ2lvbnMgd2lsbCBub3cgYmUgJ21vZGlmaWVkJyByZWdpb25zLlxuICAgIGZvciAoY29uc3QgY2hhbmdlZExpbmVXaXRoT2Zmc2V0IG9mIGNoYW5nZWRMaW5lc1dpdGhPZmZzZXRzLmtleXMoKSkge1xuICAgICAgYWRkZWRMaW5lc1dpdGhPZmZzZXRzLmRlbGV0ZShjaGFuZ2VkTGluZVdpdGhPZmZzZXQpO1xuICAgICAgcmVtb3ZlZExpbmVzV2l0aE9mZnNldHMuZGVsZXRlKGNoYW5nZWRMaW5lV2l0aE9mZnNldCk7XG4gICAgfVxuXG4gICAgY29uc3QganVtcFRhcmdldHMgPSBbXTtcblxuICAgIGZvciAoY29uc3QgW2FkZGVkTGluZVdpdGhPZmZzZXQsIGFkZGVkTGluZV0gb2YgYWRkZWRMaW5lc1dpdGhPZmZzZXRzKSB7XG4gICAgICBqdW1wVGFyZ2V0cy5wdXNoKFxuICAgICAgICA8TmF2aWdhdG9uQmFySnVtcFRhcmdldFxuICAgICAgICAgIG9mZnNldExpbmVOdW1iZXI9e2FkZGVkTGluZVdpdGhPZmZzZXR9XG4gICAgICAgICAga2V5PXthZGRlZExpbmVXaXRoT2Zmc2V0fVxuICAgICAgICAgIGxpbmVOdW1iZXI9e2FkZGVkTGluZX1cbiAgICAgICAgICBsaW5lc0NvdW50PXtsaW5lc0NvdW50fVxuICAgICAgICAgIGxpbmVDaGFuZ2VDbGFzcz1cImFkZGVkXCJcbiAgICAgICAgICBpc0FkZGVkTGluZT17dHJ1ZX1cbiAgICAgICAgICBjb250YWluZXJIZWlnaHQ9e2VsZW1lbnRIZWlnaHR9XG4gICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xpY2t9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgW2NoYW5nZWRMaW5lV2l0aE9mZnNldCwgY2hhbmdlZExpbmVdIG9mIGNoYW5nZWRMaW5lc1dpdGhPZmZzZXRzKSB7XG4gICAgICBqdW1wVGFyZ2V0cy5wdXNoKFxuICAgICAgICA8TmF2aWdhdG9uQmFySnVtcFRhcmdldFxuICAgICAgICAgIG9mZnNldExpbmVOdW1iZXI9e2NoYW5nZWRMaW5lV2l0aE9mZnNldH1cbiAgICAgICAgICBrZXk9e2NoYW5nZWRMaW5lV2l0aE9mZnNldH1cbiAgICAgICAgICBsaW5lTnVtYmVyPXtjaGFuZ2VkTGluZX1cbiAgICAgICAgICBsaW5lc0NvdW50PXtsaW5lc0NvdW50fVxuICAgICAgICAgIGxpbmVDaGFuZ2VDbGFzcz1cIm1vZGlmaWVkXCJcbiAgICAgICAgICBpc0FkZGVkTGluZT17dHJ1ZX1cbiAgICAgICAgICBjb250YWluZXJIZWlnaHQ9e2VsZW1lbnRIZWlnaHR9XG4gICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xpY2t9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgW3JlbW92ZWRMaW5lV2l0aE9mZnNldCwgcmVtb3ZlZExpbmVdIG9mIHJlbW92ZWRMaW5lc1dpdGhPZmZzZXRzKSB7XG4gICAgICBqdW1wVGFyZ2V0cy5wdXNoKFxuICAgICAgICA8TmF2aWdhdG9uQmFySnVtcFRhcmdldFxuICAgICAgICAgIG9mZnNldExpbmVOdW1iZXI9e3JlbW92ZWRMaW5lV2l0aE9mZnNldH1cbiAgICAgICAgICBrZXk9e3JlbW92ZWRMaW5lV2l0aE9mZnNldH1cbiAgICAgICAgICBsaW5lTnVtYmVyPXtyZW1vdmVkTGluZX1cbiAgICAgICAgICBsaW5lc0NvdW50PXtsaW5lc0NvdW50fVxuICAgICAgICAgIGxpbmVDaGFuZ2VDbGFzcz1cInJlbW92ZWRcIlxuICAgICAgICAgIGlzQWRkZWRMaW5lPXtmYWxzZX1cbiAgICAgICAgICBjb250YWluZXJIZWlnaHQ9e2VsZW1lbnRIZWlnaHR9XG4gICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlQ2xpY2t9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LW5hdmlnYXRpb24tYmFyXCI+XG4gICAgICAgIHtqdW1wVGFyZ2V0c31cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlQ2xpY2sobGluZU51bWJlcjogbnVtYmVyLCBpc0FkZGVkTGluZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25DbGljayhsaW5lTnVtYmVyLCBpc0FkZGVkTGluZSk7XG4gIH1cbn1cblxudHlwZSBOYXZpZ2F0b25CYXJKdW1wVGFyZ2V0UHJvcHMgPSB7XG4gIG9mZnNldExpbmVOdW1iZXI6IG51bWJlcjtcbiAgbGluZU51bWJlcjogbnVtYmVyO1xuICBsaW5lQ2hhbmdlQ2xhc3M6IHN0cmluZztcbiAgbGluZXNDb3VudDogbnVtYmVyO1xuICBpc0FkZGVkTGluZTogYm9vbGVhbjtcbiAgY29udGFpbmVySGVpZ2h0OiBudW1iZXI7XG4gIG9uQ2xpY2s6IChsaW5lTnVtYmVyOiBudW1iZXIsIGlzQWRkZWRMaW5lOiBib29sZWFuKSA9PiBhbnk7XG59O1xuXG5jbGFzcyBOYXZpZ2F0b25CYXJKdW1wVGFyZ2V0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IE5hdmlnYXRvbkJhckp1bXBUYXJnZXRQcm9wcztcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogTmF2aWdhdG9uQmFySnVtcFRhcmdldFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDbGljayA9IHRoaXMuX2hhbmRsZUNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7b2Zmc2V0TGluZU51bWJlciwgbGluZXNDb3VudCwgY29udGFpbmVySGVpZ2h0LCBsaW5lQ2hhbmdlQ2xhc3N9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB0YXJnZXJ0VG9wID0gTWF0aC5jZWlsKGNvbnRhaW5lckhlaWdodCAqIG9mZnNldExpbmVOdW1iZXIgLyBsaW5lc0NvdW50KTtcbiAgICBjb25zdCB0YXJnZXJ0SGVpZ2h0ID0gTWF0aC5jZWlsKGNvbnRhaW5lckhlaWdodCAvIGxpbmVzQ291bnQpO1xuICAgIGNvbnN0IHRhcmdldFN0eWxlID0ge1xuICAgICAgdG9wOiBgJHt0YXJnZXJ0VG9wfXB4YCxcbiAgICAgIGhlaWdodDogYCR7dGFyZ2VydEhlaWdodH1weGAsXG4gICAgfTtcbiAgICBjb25zdCB0YXJnZXRDbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcbiAgICAgICdudWNsaWRlLWRpZmYtdmlldy1uYXZpZ2F0aW9uLXRhcmdldCc6IHRydWUsXG4gICAgICBbbGluZUNoYW5nZUNsYXNzXTogdHJ1ZSxcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17dGFyZ2V0Q2xhc3NOYW1lfVxuICAgICAgICBzdHlsZT17dGFyZ2V0U3R5bGV9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUNsaWNrfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUNsaWNrKCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25DbGljayh0aGlzLnByb3BzLmxpbmVOdW1iZXIsIHRoaXMucHJvcHMuaXNBZGRlZExpbmUpO1xuICB9XG59XG4iXX0=