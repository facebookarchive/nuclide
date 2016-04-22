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

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var _nuclideUiLibButtonGroup = require('../../nuclide-ui/lib/ButtonGroup');

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
      var diffModeIds = Object.keys(_constants.DiffMode);
      var modeElements = [];

      var _loop = function (i) {
        var modeId = diffModeIds[i];
        var modeValue = _constants.DiffMode[modeId];
        var className = (0, _classnames2['default'])({
          'selected': modeValue === diffMode
        });
        modeElements.push(_reactForAtom.React.createElement(
          _nuclideUiLibButton.Button,
          {
            key: modeValue,
            icon: _constants.DiffModeIcon[modeId],
            className: className,
            onClick: function () {
              return _this.props.onSwitchMode(modeValue);
            } },
          modeValue
        ));
        if (i !== diffModeIds.length - 1) {
          var toolbarSeperatorClass = (0, _classnames2['default'])('nuclide-diff-view-toolbar-seperator', 'pull-left', 'icon icon-playback-fast-forward', 'status status-added');
          modeElements.push(_reactForAtom.React.createElement('span', { className: toolbarSeperatorClass }));
        }
      };

      for (var i = 0; i < diffModeIds.length; i++) {
        _loop(i);
      }

      return _reactForAtom.React.createElement(
        _nuclideUiLibToolbar.Toolbar,
        { location: 'top' },
        _reactForAtom.React.createElement(
          _nuclideUiLibToolbarLeft.ToolbarLeft,
          null,
          _reactForAtom.React.createElement(
            _nuclideUiLibButtonGroup.ButtonGroup,
            { size: _nuclideUiLibButtonGroup.ButtonGroupSizes.SMALL },
            modeElements
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
            _nuclideUiLibButtonGroup.ButtonGroup,
            { size: _nuclideUiLibButtonGroup.ButtonGroupSizes.SMALL },
            _reactForAtom.React.createElement(
              _nuclideUiLibButton.Button,
              {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3VG9vbGJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBY3VCLFlBQVk7Ozs7eUJBQ0UsYUFBYTs7NEJBQzlCLGdCQUFnQjs7a0NBRzdCLDZCQUE2Qjs7dUNBSTdCLGtDQUFrQzs7bUNBQ25CLDhCQUE4Qjs7eUNBQ3hCLG9DQUFvQzs7dUNBQ3RDLGtDQUFrQzs7d0NBQ2pDLG1DQUFtQzs7SUFXeEQsZUFBZTtZQUFmLGVBQWU7O1dBQWYsZUFBZTswQkFBZixlQUFlOzsrQkFBZixlQUFlOzs7ZUFBZixlQUFlOztXQUdiLGtCQUFrQjs7O21CQUNPLElBQUksQ0FBQyxLQUFLO1VBQWhDLFFBQVEsVUFBUixRQUFRO1VBQUUsUUFBUSxVQUFSLFFBQVE7O0FBQ3pCLFVBQU0sYUFBYSxHQUFHLFFBQVEsSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDOUQsVUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUkscUJBQVUsQ0FBQztBQUMxQyxVQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7OzRCQUNmLENBQUM7QUFDUixZQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsWUFBTSxTQUFTLEdBQUcsb0JBQVMsTUFBTSxDQUFDLENBQUM7QUFDbkMsWUFBTSxTQUFTLEdBQUcsNkJBQVc7QUFDM0Isb0JBQVUsRUFBRSxTQUFTLEtBQUssUUFBUTtTQUNuQyxDQUFDLENBQUM7QUFDSCxvQkFBWSxDQUFDLElBQUksQ0FDZjs7O0FBQ0UsZUFBRyxFQUFFLFNBQVMsQUFBQztBQUNmLGdCQUFJLEVBQUUsd0JBQWEsTUFBTSxDQUFDLEFBQUM7QUFDM0IscUJBQVMsRUFBRSxTQUFTLEFBQUM7QUFDckIsbUJBQU8sRUFBRTtxQkFBTSxNQUFLLEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDO2FBQUEsQUFBQztVQUNqRCxTQUFTO1NBQ0gsQ0FDVixDQUFDO0FBQ0YsWUFBSSxDQUFDLEtBQUssV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDaEMsY0FBTSxxQkFBcUIsR0FBRyw2QkFDNUIscUNBQXFDLEVBQ3JDLFdBQVcsRUFDWCxpQ0FBaUMsRUFDakMscUJBQXFCLENBQ3RCLENBQUM7QUFDRixzQkFBWSxDQUFDLElBQUksQ0FBQyw0Q0FBTSxTQUFTLEVBQUUscUJBQXFCLEFBQUMsR0FBRyxDQUFDLENBQUM7U0FDL0Q7OztBQXZCSCxXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtjQUFwQyxDQUFDO09Bd0JUOztBQUVELGFBQ0U7O1VBQVMsUUFBUSxFQUFDLEtBQUs7UUFDckI7OztVQUNFOztjQUFhLElBQUksRUFBRSwwQ0FBaUIsS0FBSyxBQUFDO1lBQ3ZDLFlBQVk7V0FDRDtTQUNGO1FBQ2Q7OztVQUNHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLElBQUksSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQjtVQUN2RSxLQUFLO1VBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCO1NBQzFEO1FBQ2hCOzs7VUFDRTs7Y0FBYSxJQUFJLEVBQUUsMENBQWlCLEtBQUssQUFBQztZQUN4Qzs7O0FBQ0Usd0JBQVEsRUFBRSxDQUFDLGFBQWEsQUFBQztBQUN6Qix1QkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEFBQUM7O2FBRTlCO1dBQ0c7U0FDRDtPQUNQLENBQ1Y7S0FDSDs7O1NBekRHLGVBQWU7R0FBUyxvQkFBTSxTQUFTOztBQTREN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiRGlmZlZpZXdUb29sYmFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0RpZmZNb2RlVHlwZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge0RpZmZNb2RlLCBEaWZmTW9kZUljb259IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7XG4gIEJ1dHRvbixcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQnV0dG9uJztcbmltcG9ydCB7XG4gIEJ1dHRvbkdyb3VwLFxuICBCdXR0b25Hcm91cFNpemVzLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9CdXR0b25Hcm91cCc7XG5pbXBvcnQge1Rvb2xiYXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL1Rvb2xiYXInO1xuaW1wb3J0IHtUb29sYmFyQ2VudGVyfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9Ub29sYmFyQ2VudGVyJztcbmltcG9ydCB7VG9vbGJhckxlZnR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL1Rvb2xiYXJMZWZ0JztcbmltcG9ydCB7VG9vbGJhclJpZ2h0fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9Ub29sYmFyUmlnaHQnO1xuXG50eXBlIFByb3BzID0ge1xuICBkaWZmTW9kZTogRGlmZk1vZGVUeXBlO1xuICBmaWxlUGF0aDogTnVjbGlkZVVyaTtcbiAgbmV3UmV2aXNpb25UaXRsZTogP3N0cmluZztcbiAgb2xkUmV2aXNpb25UaXRsZTogP3N0cmluZztcbiAgb25Td2l0Y2hUb0VkaXRvcjogKCkgPT4gbWl4ZWQ7XG4gIG9uU3dpdGNoTW9kZTogKG1vZGU6IERpZmZNb2RlVHlwZSkgPT4gbWl4ZWQ7XG59O1xuXG5jbGFzcyBEaWZmVmlld1Rvb2xiYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IHtkaWZmTW9kZSwgZmlsZVBhdGh9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBoYXNBY3RpdmVGaWxlID0gZmlsZVBhdGggIT0gbnVsbCAmJiBmaWxlUGF0aC5sZW5ndGggPiAwO1xuICAgIGNvbnN0IGRpZmZNb2RlSWRzID0gT2JqZWN0LmtleXMoRGlmZk1vZGUpO1xuICAgIGNvbnN0IG1vZGVFbGVtZW50cyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGlmZk1vZGVJZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG1vZGVJZCA9IGRpZmZNb2RlSWRzW2ldO1xuICAgICAgY29uc3QgbW9kZVZhbHVlID0gRGlmZk1vZGVbbW9kZUlkXTtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoe1xuICAgICAgICAnc2VsZWN0ZWQnOiBtb2RlVmFsdWUgPT09IGRpZmZNb2RlLFxuICAgICAgfSk7XG4gICAgICBtb2RlRWxlbWVudHMucHVzaChcbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGtleT17bW9kZVZhbHVlfVxuICAgICAgICAgIGljb249e0RpZmZNb2RlSWNvblttb2RlSWRdfVxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMucHJvcHMub25Td2l0Y2hNb2RlKG1vZGVWYWx1ZSl9PlxuICAgICAgICAgIHttb2RlVmFsdWV9XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgKTtcbiAgICAgIGlmIChpICE9PSBkaWZmTW9kZUlkcy5sZW5ndGggLSAxKSB7XG4gICAgICAgIGNvbnN0IHRvb2xiYXJTZXBlcmF0b3JDbGFzcyA9IGNsYXNzbmFtZXMoXG4gICAgICAgICAgJ251Y2xpZGUtZGlmZi12aWV3LXRvb2xiYXItc2VwZXJhdG9yJyxcbiAgICAgICAgICAncHVsbC1sZWZ0JyxcbiAgICAgICAgICAnaWNvbiBpY29uLXBsYXliYWNrLWZhc3QtZm9yd2FyZCcsXG4gICAgICAgICAgJ3N0YXR1cyBzdGF0dXMtYWRkZWQnLFxuICAgICAgICApO1xuICAgICAgICBtb2RlRWxlbWVudHMucHVzaCg8c3BhbiBjbGFzc05hbWU9e3Rvb2xiYXJTZXBlcmF0b3JDbGFzc30gLz4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8VG9vbGJhciBsb2NhdGlvbj1cInRvcFwiPlxuICAgICAgICA8VG9vbGJhckxlZnQ+XG4gICAgICAgICAgPEJ1dHRvbkdyb3VwIHNpemU9e0J1dHRvbkdyb3VwU2l6ZXMuU01BTEx9PlxuICAgICAgICAgICAge21vZGVFbGVtZW50c31cbiAgICAgICAgICA8L0J1dHRvbkdyb3VwPlxuICAgICAgICA8L1Rvb2xiYXJMZWZ0PlxuICAgICAgICA8VG9vbGJhckNlbnRlcj5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5vbGRSZXZpc2lvblRpdGxlID09IG51bGwgPyAnPycgOiB0aGlzLnByb3BzLm9sZFJldmlzaW9uVGl0bGV9XG4gICAgICAgICAgeycuLi4nfVxuICAgICAgICAgIHt0aGlzLnByb3BzLm5ld1JldmlzaW9uVGl0bGUgPT0gbnVsbCA/ICc/JyA6IHRoaXMucHJvcHMubmV3UmV2aXNpb25UaXRsZX1cbiAgICAgICAgPC9Ub29sYmFyQ2VudGVyPlxuICAgICAgICA8VG9vbGJhclJpZ2h0PlxuICAgICAgICAgIDxCdXR0b25Hcm91cCBzaXplPXtCdXR0b25Hcm91cFNpemVzLlNNQUxMfT5cbiAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFoYXNBY3RpdmVGaWxlfVxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uU3dpdGNoVG9FZGl0b3J9PlxuICAgICAgICAgICAgICBHb3RvIEVkaXRvclxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9CdXR0b25Hcm91cD5cbiAgICAgICAgPC9Ub29sYmFyUmlnaHQ+XG4gICAgICA8L1Rvb2xiYXI+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpZmZWaWV3VG9vbGJhcjtcbiJdfQ==