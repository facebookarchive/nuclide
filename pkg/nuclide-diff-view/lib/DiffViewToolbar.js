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
        'div',
        { className: 'nuclide-diff-view-toolbar nuclide-diff-view-toolbar-top' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-diff-view-toolbar-left' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'btn-group btn-group-sm' },
            modes
          )
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-diff-view-toolbar-center' },
          this.props.oldRevisionTitle == null ? '?' : this.props.oldRevisionTitle,
          '...',
          this.props.newRevisionTitle == null ? '?' : this.props.newRevisionTitle
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-diff-view-toolbar-right' },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3VG9vbGJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBY3VCLGFBQWE7OzRCQUNoQixnQkFBZ0I7OzBCQUNiLFlBQVk7Ozs7SUFXN0IsZUFBZTtZQUFmLGVBQWU7O1dBQWYsZUFBZTswQkFBZixlQUFlOzsrQkFBZixlQUFlOzs7ZUFBZixlQUFlOztXQUdiLGtCQUFpQjs7O21CQUNRLElBQUksQ0FBQyxLQUFLO1VBQWhDLFFBQVEsVUFBUixRQUFRO1VBQUUsUUFBUSxVQUFSLFFBQVE7O0FBQ3pCLFVBQU0sYUFBYSxHQUFHLFFBQVEsSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDOUQsVUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUkscUJBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDaEQsWUFBTSxTQUFTLEdBQUcsb0JBQVMsTUFBTSxDQUFDLENBQUM7QUFDbkMsWUFBTSxTQUFTLEdBQUcsNkJBQVcsS0FBSyxFQUFFO0FBQ2xDLG9CQUFVLEVBQUUsU0FBUyxLQUFLLFFBQVE7U0FDbkMsQ0FBQyxDQUFDO0FBQ0gsZUFDRTs7O0FBQ0UsZUFBRyxFQUFFLFNBQVMsQUFBQztBQUNmLHFCQUFTLEVBQUUsU0FBUyxBQUFDO0FBQ3JCLG1CQUFPLEVBQUU7cUJBQU0sTUFBSyxLQUFLLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQzthQUFBLEFBQUM7VUFDakQsU0FBUztTQUNILENBQ1Q7T0FDSCxDQUFDLENBQUM7O0FBRUgsYUFDRTs7VUFBSyxTQUFTLEVBQUMseURBQXlEO1FBQ3RFOztZQUFLLFNBQVMsRUFBQyxnQ0FBZ0M7VUFDN0M7O2NBQUssU0FBUyxFQUFDLHdCQUF3QjtZQUNwQyxLQUFLO1dBQ0Y7U0FDRjtRQUNOOztZQUFLLFNBQVMsRUFBQyxrQ0FBa0M7VUFDOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCO1VBQ3ZFLEtBQUs7VUFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixJQUFJLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0I7U0FDcEU7UUFDTjs7WUFBSyxTQUFTLEVBQUMsaUNBQWlDO1VBQzlDOztjQUFLLFNBQVMsRUFBQyx3QkFBd0I7WUFDckM7OztBQUNFLHlCQUFTLEVBQUMsS0FBSztBQUNmLHdCQUFRLEVBQUUsQ0FBQyxhQUFhLEFBQUM7QUFDekIsdUJBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixBQUFDOzthQUU5QjtXQUNMO1NBQ0Y7T0FDRixDQUNOO0tBQ0g7OztTQTdDRyxlQUFlO0dBQVMsb0JBQU0sU0FBUzs7QUFnRDdDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IkRpZmZWaWV3VG9vbGJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEaWZmTW9kZVR5cGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB7RGlmZk1vZGV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG50eXBlIFByb3BzID0ge1xuICBkaWZmTW9kZTogRGlmZk1vZGVUeXBlO1xuICBmaWxlUGF0aDogTnVjbGlkZVVyaTtcbiAgbmV3UmV2aXNpb25UaXRsZTogP3N0cmluZztcbiAgb2xkUmV2aXNpb25UaXRsZTogP3N0cmluZztcbiAgb25Td2l0Y2hUb0VkaXRvcjogKCkgPT4gbWl4ZWQ7XG4gIG9uU3dpdGNoTW9kZTogKG1vZGU6IERpZmZNb2RlVHlwZSkgPT4gbWl4ZWQ7XG59O1xuXG5jbGFzcyBEaWZmVmlld1Rvb2xiYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge2RpZmZNb2RlLCBmaWxlUGF0aH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGhhc0FjdGl2ZUZpbGUgPSBmaWxlUGF0aCAhPSBudWxsICYmIGZpbGVQYXRoLmxlbmd0aCA+IDA7XG4gICAgY29uc3QgbW9kZXMgPSBPYmplY3Qua2V5cyhEaWZmTW9kZSkubWFwKG1vZGVJZCA9PiB7XG4gICAgICBjb25zdCBtb2RlVmFsdWUgPSBEaWZmTW9kZVttb2RlSWRdO1xuICAgICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NuYW1lcygnYnRuJywge1xuICAgICAgICAnc2VsZWN0ZWQnOiBtb2RlVmFsdWUgPT09IGRpZmZNb2RlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAga2V5PXttb2RlVmFsdWV9XG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5wcm9wcy5vblN3aXRjaE1vZGUobW9kZVZhbHVlKX0+XG4gICAgICAgICAge21vZGVWYWx1ZX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctdG9vbGJhciBudWNsaWRlLWRpZmYtdmlldy10b29sYmFyLXRvcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LXRvb2xiYXItbGVmdFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVwiPlxuICAgICAgICAgICAge21vZGVzfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10b29sYmFyLWNlbnRlclwiPlxuICAgICAgICAgIHt0aGlzLnByb3BzLm9sZFJldmlzaW9uVGl0bGUgPT0gbnVsbCA/ICc/JyA6IHRoaXMucHJvcHMub2xkUmV2aXNpb25UaXRsZX1cbiAgICAgICAgICB7Jy4uLid9XG4gICAgICAgICAge3RoaXMucHJvcHMubmV3UmV2aXNpb25UaXRsZSA9PSBudWxsID8gJz8nIDogdGhpcy5wcm9wcy5uZXdSZXZpc2lvblRpdGxlfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10b29sYmFyLXJpZ2h0XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXAgYnRuLWdyb3VwLXNtXCI+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0blwiXG4gICAgICAgICAgICAgIGRpc2FibGVkPXshaGFzQWN0aXZlRmlsZX1cbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vblN3aXRjaFRvRWRpdG9yfT5cbiAgICAgICAgICAgICAgR290byBFZGl0b3JcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld1Rvb2xiYXI7XG4iXX0=