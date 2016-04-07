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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _constants = require('./constants');

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibToolbar = require('../../nuclide-ui/lib/Toolbar');

var _nuclideUiLibToolbarCenter = require('../../nuclide-ui/lib/ToolbarCenter');

var _nuclideUiLibToolbarLeft = require('../../nuclide-ui/lib/ToolbarLeft');

var _nuclideUiLibToolbarRight = require('../../nuclide-ui/lib/ToolbarRight');

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
        var className = (0, _classnames2['default'])('btn', {
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
          modeValue
        );
      });

      return _reactForAtom.React.createElement(
        _nuclideUiLibToolbar.Toolbar,
        { location: 'top' },
        _reactForAtom.React.createElement(
          _nuclideUiLibToolbarLeft.ToolbarLeft,
          null,
          _reactForAtom.React.createElement(
            'div',
            { className: 'btn-group btn-group-sm' },
            modes
          )
        ),
        _reactForAtom.React.createElement(
          _nuclideUiLibToolbarCenter.ToolbarCenter,
          null,
          this.props.oldRevisionTitle == null ? '?' : this.props.oldRevisionTitle,
          '...',
          this.props.newRevisionTitle == null ? '?' : this.props.newRevisionTitle
        ),
        _reactForAtom.React.createElement(
          _nuclideUiLibToolbarRight.ToolbarRight,
          null,
          _reactForAtom.React.createElement(
            'div',
            { className: 'btn-group btn-group-sm' },
            _reactForAtom.React.createElement(
              'button',
              {
                className: 'btn',
                disabled: !hasActiveFile,
                onClick: this.props.onSwitchToEditor },
              'Goto Editor'
            )
          )
        )
      );
    }
  }]);

  return DiffViewToolbar;
})(_reactForAtom.React.Component);

module.exports = DiffViewToolbar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3VG9vbGJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBY3VCLFlBQVk7Ozs7eUJBQ1osYUFBYTs7NEJBQ2hCLGdCQUFnQjs7bUNBQ2QsOEJBQThCOzt5Q0FDeEIsb0NBQW9DOzt1Q0FDdEMsa0NBQWtDOzt3Q0FDakMsbUNBQW1DOztJQVd4RCxlQUFlO1lBQWYsZUFBZTs7V0FBZixlQUFlOzBCQUFmLGVBQWU7OytCQUFmLGVBQWU7OztlQUFmLGVBQWU7O1dBR2Isa0JBQWlCOzs7bUJBQ1EsSUFBSSxDQUFDLEtBQUs7VUFBaEMsUUFBUSxVQUFSLFFBQVE7VUFBRSxRQUFRLFVBQVIsUUFBUTs7QUFDekIsVUFBTSxhQUFhLEdBQUcsUUFBUSxJQUFJLElBQUksSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUM5RCxVQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxxQkFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUNoRCxZQUFNLFNBQVMsR0FBRyxvQkFBUyxNQUFNLENBQUMsQ0FBQztBQUNuQyxZQUFNLFNBQVMsR0FBRyw2QkFBVyxLQUFLLEVBQUU7QUFDbEMsb0JBQVUsRUFBRSxTQUFTLEtBQUssUUFBUTtTQUNuQyxDQUFDLENBQUM7QUFDSCxlQUNFOzs7QUFDRSxlQUFHLEVBQUUsU0FBUyxBQUFDO0FBQ2YscUJBQVMsRUFBRSxTQUFTLEFBQUM7QUFDckIsbUJBQU8sRUFBRTtxQkFBTSxNQUFLLEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDO2FBQUEsQUFBQztVQUNqRCxTQUFTO1NBQ0gsQ0FDVDtPQUNILENBQUMsQ0FBQzs7QUFFSCxhQUNFOztVQUFTLFFBQVEsRUFBQyxLQUFLO1FBQ3JCOzs7VUFDRTs7Y0FBSyxTQUFTLEVBQUMsd0JBQXdCO1lBQ3BDLEtBQUs7V0FDRjtTQUNNO1FBQ2Q7OztVQUNHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLElBQUksSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQjtVQUN2RSxLQUFLO1VBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCO1NBQzFEO1FBQ2hCOzs7VUFDRTs7Y0FBSyxTQUFTLEVBQUMsd0JBQXdCO1lBQ3JDOzs7QUFDRSx5QkFBUyxFQUFDLEtBQUs7QUFDZix3QkFBUSxFQUFFLENBQUMsYUFBYSxBQUFDO0FBQ3pCLHVCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQUFBQzs7YUFFOUI7V0FDTDtTQUNPO09BQ1AsQ0FDVjtLQUNIOzs7U0E3Q0csZUFBZTtHQUFTLG9CQUFNLFNBQVM7O0FBZ0Q3QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJEaWZmVmlld1Rvb2xiYXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RGlmZk1vZGVUeXBlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7RGlmZk1vZGV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7VG9vbGJhcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvVG9vbGJhcic7XG5pbXBvcnQge1Rvb2xiYXJDZW50ZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL1Rvb2xiYXJDZW50ZXInO1xuaW1wb3J0IHtUb29sYmFyTGVmdH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvVG9vbGJhckxlZnQnO1xuaW1wb3J0IHtUb29sYmFyUmlnaHR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL1Rvb2xiYXJSaWdodCc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGRpZmZNb2RlOiBEaWZmTW9kZVR5cGU7XG4gIGZpbGVQYXRoOiBOdWNsaWRlVXJpO1xuICBuZXdSZXZpc2lvblRpdGxlOiA/c3RyaW5nO1xuICBvbGRSZXZpc2lvblRpdGxlOiA/c3RyaW5nO1xuICBvblN3aXRjaFRvRWRpdG9yOiAoKSA9PiBtaXhlZDtcbiAgb25Td2l0Y2hNb2RlOiAobW9kZTogRGlmZk1vZGVUeXBlKSA9PiBtaXhlZDtcbn07XG5cbmNsYXNzIERpZmZWaWV3VG9vbGJhciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7ZGlmZk1vZGUsIGZpbGVQYXRofSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgaGFzQWN0aXZlRmlsZSA9IGZpbGVQYXRoICE9IG51bGwgJiYgZmlsZVBhdGgubGVuZ3RoID4gMDtcbiAgICBjb25zdCBtb2RlcyA9IE9iamVjdC5rZXlzKERpZmZNb2RlKS5tYXAobW9kZUlkID0+IHtcbiAgICAgIGNvbnN0IG1vZGVWYWx1ZSA9IERpZmZNb2RlW21vZGVJZF07XG4gICAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc25hbWVzKCdidG4nLCB7XG4gICAgICAgICdzZWxlY3RlZCc6IG1vZGVWYWx1ZSA9PT0gZGlmZk1vZGUsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBrZXk9e21vZGVWYWx1ZX1cbiAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLnByb3BzLm9uU3dpdGNoTW9kZShtb2RlVmFsdWUpfT5cbiAgICAgICAgICB7bW9kZVZhbHVlfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFRvb2xiYXIgbG9jYXRpb249XCJ0b3BcIj5cbiAgICAgICAgPFRvb2xiYXJMZWZ0PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVwiPlxuICAgICAgICAgICAge21vZGVzfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L1Rvb2xiYXJMZWZ0PlxuICAgICAgICA8VG9vbGJhckNlbnRlcj5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5vbGRSZXZpc2lvblRpdGxlID09IG51bGwgPyAnPycgOiB0aGlzLnByb3BzLm9sZFJldmlzaW9uVGl0bGV9XG4gICAgICAgICAgeycuLi4nfVxuICAgICAgICAgIHt0aGlzLnByb3BzLm5ld1JldmlzaW9uVGl0bGUgPT0gbnVsbCA/ICc/JyA6IHRoaXMucHJvcHMubmV3UmV2aXNpb25UaXRsZX1cbiAgICAgICAgPC9Ub29sYmFyQ2VudGVyPlxuICAgICAgICA8VG9vbGJhclJpZ2h0PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVwiPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG5cIlxuICAgICAgICAgICAgICBkaXNhYmxlZD17IWhhc0FjdGl2ZUZpbGV9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25Td2l0Y2hUb0VkaXRvcn0+XG4gICAgICAgICAgICAgIEdvdG8gRWRpdG9yXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9Ub29sYmFyUmlnaHQ+XG4gICAgICA8L1Rvb2xiYXI+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpZmZWaWV3VG9vbGJhcjtcbiJdfQ==