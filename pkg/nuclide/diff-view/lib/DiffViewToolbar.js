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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3VG9vbGJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBY3VCLGFBQWE7OzRCQUNoQixnQkFBZ0I7OzBCQUNiLFlBQVk7Ozs7SUFXN0IsZUFBZTtZQUFmLGVBQWU7O1dBQWYsZUFBZTswQkFBZixlQUFlOzsrQkFBZixlQUFlOzs7ZUFBZixlQUFlOztXQUdiLGtCQUFpQjs7O21CQUNRLElBQUksQ0FBQyxLQUFLO1VBQWhDLFFBQVEsVUFBUixRQUFRO1VBQUUsUUFBUSxVQUFSLFFBQVE7O0FBQ3pCLFVBQU0sYUFBYSxHQUFHLFFBQVEsSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDOUQsVUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUkscUJBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDaEQsWUFBTSxTQUFTLEdBQUcsb0JBQVMsTUFBTSxDQUFDLENBQUM7QUFDbkMsWUFBTSxTQUFTLEdBQUcsNkJBQVcsS0FBSyxFQUFFO0FBQ2xDLG9CQUFVLEVBQUUsU0FBUyxLQUFLLFFBQVE7U0FDbkMsQ0FBQyxDQUFDO0FBQ0gsZUFDRTs7O0FBQ0UsZUFBRyxFQUFFLFNBQVMsQUFBQztBQUNmLHFCQUFTLEVBQUUsU0FBUyxBQUFDO0FBQ3JCLG1CQUFPLEVBQUU7cUJBQU0sTUFBSyxLQUFLLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQzthQUFBLEFBQUM7VUFDakQsU0FBUztTQUNILENBQ1Q7T0FDSCxDQUFDLENBQUM7O0FBRUgsYUFDRTs7VUFBSyxTQUFTLEVBQUMseURBQXlEO1FBQ3RFOztZQUFLLFNBQVMsRUFBQyxnQ0FBZ0M7VUFDN0M7O2NBQUssU0FBUyxFQUFDLHdCQUF3QjtZQUNwQyxLQUFLO1dBQ0Y7U0FDRjtRQUNOOztZQUFLLFNBQVMsRUFBQyxrQ0FBa0M7VUFDOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCO1VBQ3ZFLEtBQUs7VUFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixJQUFJLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0I7U0FDcEU7UUFDTjs7WUFBSyxTQUFTLEVBQUMsaUNBQWlDO1VBQzlDOztjQUFLLFNBQVMsRUFBQyx3QkFBd0I7WUFDckM7OztBQUNFLHlCQUFTLEVBQUMsS0FBSztBQUNmLHdCQUFRLEVBQUUsQ0FBQyxhQUFhLEFBQUM7QUFDekIsdUJBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixBQUFDOzthQUU5QjtXQUNMO1NBQ0Y7T0FDRixDQUNOO0tBQ0g7OztTQTdDRyxlQUFlO0dBQVMsb0JBQU0sU0FBUzs7QUFnRDdDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IkRpZmZWaWV3VG9vbGJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEaWZmTW9kZVR5cGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQge0RpZmZNb2RlfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxudHlwZSBQcm9wcyA9IHtcbiAgZGlmZk1vZGU6IERpZmZNb2RlVHlwZTtcbiAgZmlsZVBhdGg6IE51Y2xpZGVVcmk7XG4gIG5ld1JldmlzaW9uVGl0bGU6ID9zdHJpbmc7XG4gIG9sZFJldmlzaW9uVGl0bGU6ID9zdHJpbmc7XG4gIG9uU3dpdGNoVG9FZGl0b3I6ICgpID0+IG1peGVkO1xuICBvblN3aXRjaE1vZGU6IChtb2RlOiBEaWZmTW9kZVR5cGUpID0+IG1peGVkO1xufTtcblxuY2xhc3MgRGlmZlZpZXdUb29sYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtkaWZmTW9kZSwgZmlsZVBhdGh9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBoYXNBY3RpdmVGaWxlID0gZmlsZVBhdGggIT0gbnVsbCAmJiBmaWxlUGF0aC5sZW5ndGggPiAwO1xuICAgIGNvbnN0IG1vZGVzID0gT2JqZWN0LmtleXMoRGlmZk1vZGUpLm1hcChtb2RlSWQgPT4ge1xuICAgICAgY29uc3QgbW9kZVZhbHVlID0gRGlmZk1vZGVbbW9kZUlkXTtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ2J0bicsIHtcbiAgICAgICAgJ3NlbGVjdGVkJzogbW9kZVZhbHVlID09PSBkaWZmTW9kZSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIGtleT17bW9kZVZhbHVlfVxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMucHJvcHMub25Td2l0Y2hNb2RlKG1vZGVWYWx1ZSl9PlxuICAgICAgICAgIHttb2RlVmFsdWV9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LXRvb2xiYXIgbnVjbGlkZS1kaWZmLXZpZXctdG9vbGJhci10b3BcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10b29sYmFyLWxlZnRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cCBidG4tZ3JvdXAtc21cIj5cbiAgICAgICAgICAgIHttb2Rlc31cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctdG9vbGJhci1jZW50ZXJcIj5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5vbGRSZXZpc2lvblRpdGxlID09IG51bGwgPyAnPycgOiB0aGlzLnByb3BzLm9sZFJldmlzaW9uVGl0bGV9XG4gICAgICAgICAgeycuLi4nfVxuICAgICAgICAgIHt0aGlzLnByb3BzLm5ld1JldmlzaW9uVGl0bGUgPT0gbnVsbCA/ICc/JyA6IHRoaXMucHJvcHMubmV3UmV2aXNpb25UaXRsZX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctdG9vbGJhci1yaWdodFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVwiPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG5cIlxuICAgICAgICAgICAgICBkaXNhYmxlZD17IWhhc0FjdGl2ZUZpbGV9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25Td2l0Y2hUb0VkaXRvcn0+XG4gICAgICAgICAgICAgIEdvdG8gRWRpdG9yXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlZpZXdUb29sYmFyO1xuIl19