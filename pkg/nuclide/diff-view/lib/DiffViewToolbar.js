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
        { className: 'nuclide-diff-view-toolbar padded' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'btn-group btn-group-sm' },
          modes
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'btn-group btn-group-sm' },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3VG9vbGJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBY3VCLGFBQWE7OzRCQUNoQixnQkFBZ0I7OzBCQUNiLFlBQVk7Ozs7SUFTN0IsZUFBZTtZQUFmLGVBQWU7O1dBQWYsZUFBZTswQkFBZixlQUFlOzsrQkFBZixlQUFlOzs7ZUFBZixlQUFlOztXQUdiLGtCQUFpQjs7O21CQUNRLElBQUksQ0FBQyxLQUFLO1VBQWhDLFFBQVEsVUFBUixRQUFRO1VBQUUsUUFBUSxVQUFSLFFBQVE7O0FBQ3pCLFVBQU0sYUFBYSxHQUFHLFFBQVEsSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDOUQsVUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUkscUJBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDaEQsWUFBTSxTQUFTLEdBQUcsb0JBQVMsTUFBTSxDQUFDLENBQUM7QUFDbkMsWUFBTSxTQUFTLEdBQUcsNkJBQVc7QUFDM0IsZUFBSyxFQUFFLElBQUk7QUFDWCxvQkFBVSxFQUFFLFNBQVMsS0FBSyxRQUFRO1NBQ25DLENBQUMsQ0FBQztBQUNILGVBQ0U7OztBQUNFLGVBQUcsRUFBRSxTQUFTLEFBQUM7QUFDZixxQkFBUyxFQUFFLFNBQVMsQUFBQztBQUNyQixtQkFBTyxFQUFFO3FCQUFNLE1BQUssS0FBSyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7YUFBQSxBQUFDO1VBQ2pELFNBQVM7O1NBQ0gsQ0FDVDtPQUNILENBQUMsQ0FBQztBQUNILGFBQ0U7O1VBQUssU0FBUyxFQUFDLGtDQUFrQztRQUMvQzs7WUFBSyxTQUFTLEVBQUMsd0JBQXdCO1VBQ3BDLEtBQUs7U0FDRjtRQUNOOztZQUFLLFNBQVMsRUFBQyx3QkFBd0I7VUFDckM7OztBQUNFLHFCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQUFBQztBQUNyQyxzQkFBUSxFQUFFLENBQUMsYUFBYSxBQUFDLEVBQUMsU0FBUyxFQUFDLEtBQUs7O1dBRWxDO1NBQ0w7T0FDRixDQUNOO0tBQ0g7OztTQW5DRyxlQUFlO0dBQVMsb0JBQU0sU0FBUzs7QUFzQzdDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IkRpZmZWaWV3VG9vbGJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEaWZmTW9kZVR5cGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQge0RpZmZNb2RlfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxudHlwZSBQcm9wcyA9IHtcbiAgZGlmZk1vZGU6IERpZmZNb2RlVHlwZTtcbiAgZmlsZVBhdGg6IE51Y2xpZGVVcmk7XG4gIG9uU3dpdGNoVG9FZGl0b3I6ICgpID0+IG1peGVkO1xuICBvblN3aXRjaE1vZGU6IChtb2RlOiBEaWZmTW9kZVR5cGUpID0+IG1peGVkO1xufTtcblxuY2xhc3MgRGlmZlZpZXdUb29sYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtkaWZmTW9kZSwgZmlsZVBhdGh9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBoYXNBY3RpdmVGaWxlID0gZmlsZVBhdGggIT0gbnVsbCAmJiBmaWxlUGF0aC5sZW5ndGggPiAwO1xuICAgIGNvbnN0IG1vZGVzID0gT2JqZWN0LmtleXMoRGlmZk1vZGUpLm1hcChtb2RlSWQgPT4ge1xuICAgICAgY29uc3QgbW9kZVZhbHVlID0gRGlmZk1vZGVbbW9kZUlkXTtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoe1xuICAgICAgICAnYnRuJzogdHJ1ZSxcbiAgICAgICAgJ3NlbGVjdGVkJzogbW9kZVZhbHVlID09PSBkaWZmTW9kZSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIGtleT17bW9kZVZhbHVlfVxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMucHJvcHMub25Td2l0Y2hNb2RlKG1vZGVWYWx1ZSl9PlxuICAgICAgICAgIHttb2RlVmFsdWV9IE1vZGVcbiAgICAgICAgPC9idXR0b24+XG4gICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LXRvb2xiYXIgcGFkZGVkXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVwiPlxuICAgICAgICAgIHttb2Rlc31cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVwiPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25Td2l0Y2hUb0VkaXRvcn1cbiAgICAgICAgICAgIGRpc2FibGVkPXshaGFzQWN0aXZlRmlsZX0gY2xhc3NOYW1lPVwiYnRuXCI+XG4gICAgICAgICAgICBHb3RvIEVkaXRvclxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld1Rvb2xiYXI7XG4iXX0=