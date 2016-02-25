var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _constants = require('./constants');

var _reactForAtom = require('react-for-atom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var DiffViewToolbar = (function (_React$Component) {
  _inherits(DiffViewToolbar, _React$Component);

  function DiffViewToolbar() {
    _classCallCheck(this, DiffViewToolbar);

    _get(Object.getPrototypeOf(DiffViewToolbar.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DiffViewToolbar, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var _props = this.props;
      var diffMode = _props.diffMode;
      var filePath = _props.filePath;

      var hasActiveFile = filePath != null && filePath.length > 0;
      var modes = Object.keys(_constants.DiffMode).map(function (modeId) {
        var modeValue = _constants.DiffMode[modeId];
        var className = (0, _classnames2['default'])({
          'btn': true,
          'selected': modeValue === diffMode
        });
        return _reactForAtom.React.createElement(
          'button',
          {
            key: modeValue,
            className: className,
            onClick: function () {
              return _this.props.onSwitchMode(modeValue);
            } },
          modeValue,
          ' Mode'
        );
      });
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-view-toolbar tool-panel' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'btn-group' },
          modes
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'editor-switch btn-group' },
          _reactForAtom.React.createElement(
            'button',
            {
              onClick: this.props.onSwitchToEditor,
              disabled: !hasActiveFile, className: 'btn' },
            'Goto Editor'
          )
        )
      );
    }
  }]);

  return DiffViewToolbar;
})(_reactForAtom.React.Component);

module.exports = DiffViewToolbar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3VG9vbGJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBY3VCLGFBQWE7OzRCQUNoQixnQkFBZ0I7OzBCQUNiLFlBQVk7Ozs7SUFTN0IsZUFBZTtZQUFmLGVBQWU7O1dBQWYsZUFBZTswQkFBZixlQUFlOzsrQkFBZixlQUFlOzs7ZUFBZixlQUFlOztXQUdiLGtCQUFpQjs7O21CQUNRLElBQUksQ0FBQyxLQUFLO1VBQWhDLFFBQVEsVUFBUixRQUFRO1VBQUUsUUFBUSxVQUFSLFFBQVE7O0FBQ3pCLFVBQU0sYUFBYSxHQUFHLFFBQVEsSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDOUQsVUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUkscUJBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDaEQsWUFBTSxTQUFTLEdBQUcsb0JBQVMsTUFBTSxDQUFDLENBQUM7QUFDbkMsWUFBTSxTQUFTLEdBQUcsNkJBQVc7QUFDM0IsZUFBSyxFQUFFLElBQUk7QUFDWCxvQkFBVSxFQUFFLFNBQVMsS0FBSyxRQUFRO1NBQ25DLENBQUMsQ0FBQztBQUNILGVBQ0U7OztBQUNFLGVBQUcsRUFBRSxTQUFTLEFBQUM7QUFDZixxQkFBUyxFQUFFLFNBQVMsQUFBQztBQUNyQixtQkFBTyxFQUFFO3FCQUFNLE1BQUssS0FBSyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7YUFBQSxBQUFDO1VBQ2pELFNBQVM7O1NBQ0gsQ0FDVDtPQUNILENBQUMsQ0FBQztBQUNILGFBQ0U7O1VBQUssU0FBUyxFQUFDLHNDQUFzQztRQUNuRDs7WUFBSyxTQUFTLEVBQUMsV0FBVztVQUN2QixLQUFLO1NBQ0Y7UUFDTjs7WUFBSyxTQUFTLEVBQUMseUJBQXlCO1VBQ3RDOzs7QUFDRSxxQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEFBQUM7QUFDckMsc0JBQVEsRUFBRSxDQUFDLGFBQWEsQUFBQyxFQUFDLFNBQVMsRUFBQyxLQUFLOztXQUVsQztTQUNMO09BQ0YsQ0FDTjtLQUNIOzs7U0FuQ0csZUFBZTtHQUFTLG9CQUFNLFNBQVM7O0FBc0M3QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJEaWZmVmlld1Rvb2xiYXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RGlmZk1vZGVUeXBlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IHtEaWZmTW9kZX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGRpZmZNb2RlOiBEaWZmTW9kZVR5cGU7XG4gIGZpbGVQYXRoOiBOdWNsaWRlVXJpO1xuICBvblN3aXRjaFRvRWRpdG9yOiAoKSA9PiBtaXhlZDtcbiAgb25Td2l0Y2hNb2RlOiAobW9kZTogRGlmZk1vZGVUeXBlKSA9PiBtaXhlZDtcbn07XG5cbmNsYXNzIERpZmZWaWV3VG9vbGJhciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7ZGlmZk1vZGUsIGZpbGVQYXRofSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgaGFzQWN0aXZlRmlsZSA9IGZpbGVQYXRoICE9IG51bGwgJiYgZmlsZVBhdGgubGVuZ3RoID4gMDtcbiAgICBjb25zdCBtb2RlcyA9IE9iamVjdC5rZXlzKERpZmZNb2RlKS5tYXAobW9kZUlkID0+IHtcbiAgICAgIGNvbnN0IG1vZGVWYWx1ZSA9IERpZmZNb2RlW21vZGVJZF07XG4gICAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcbiAgICAgICAgJ2J0bic6IHRydWUsXG4gICAgICAgICdzZWxlY3RlZCc6IG1vZGVWYWx1ZSA9PT0gZGlmZk1vZGUsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBrZXk9e21vZGVWYWx1ZX1cbiAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLnByb3BzLm9uU3dpdGNoTW9kZShtb2RlVmFsdWUpfT5cbiAgICAgICAgICB7bW9kZVZhbHVlfSBNb2RlXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKTtcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10b29sYmFyIHRvb2wtcGFuZWxcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXBcIj5cbiAgICAgICAgICB7bW9kZXN9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImVkaXRvci1zd2l0Y2ggYnRuLWdyb3VwXCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vblN3aXRjaFRvRWRpdG9yfVxuICAgICAgICAgICAgZGlzYWJsZWQ9eyFoYXNBY3RpdmVGaWxlfSBjbGFzc05hbWU9XCJidG5cIj5cbiAgICAgICAgICAgIEdvdG8gRWRpdG9yXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpZmZWaWV3VG9vbGJhcjtcbiJdfQ==