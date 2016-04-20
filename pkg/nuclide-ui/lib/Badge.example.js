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

var _reactForAtom = require('react-for-atom');

var _Block = require('./Block');

var _Badge = require('./Badge');

var BadgeBasicExample = function BadgeBasicExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_Badge.Badge, { value: 1 }),
      ' ',
      _reactForAtom.React.createElement(_Badge.Badge, { value: 11 }),
      ' ',
      _reactForAtom.React.createElement(_Badge.Badge, { value: 123 })
    )
  );
};

var BadgeColorExample = function BadgeColorExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Info: ',
      _reactForAtom.React.createElement(_Badge.Badge, { color: _Badge.BadgeColors.info, value: 123 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Success: ',
      _reactForAtom.React.createElement(_Badge.Badge, { color: _Badge.BadgeColors.success, value: 123 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Warning: ',
      _reactForAtom.React.createElement(_Badge.Badge, { color: _Badge.BadgeColors.warning, value: 123 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Error: ',
      _reactForAtom.React.createElement(_Badge.Badge, { color: _Badge.BadgeColors.error, value: 123 })
    )
  );
};

var BadgeSizeExample = function BadgeSizeExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Small: ',
      _reactForAtom.React.createElement(_Badge.Badge, { size: _Badge.BadgeSizes.small, value: 123 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Medium: ',
      _reactForAtom.React.createElement(_Badge.Badge, { size: _Badge.BadgeSizes.medium, value: 123 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Large: ',
      _reactForAtom.React.createElement(_Badge.Badge, { size: _Badge.BadgeSizes.large, value: 123 })
    )
  );
};

var BadgeIconExample = function BadgeIconExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_Badge.Badge, { icon: 'gear', value: 13 }),
      ' ',
      _reactForAtom.React.createElement(_Badge.Badge, { icon: 'cloud-download', color: _Badge.BadgeColors.info, value: 23 }),
      ' ',
      _reactForAtom.React.createElement(_Badge.Badge, { icon: 'octoface', color: _Badge.BadgeColors.success, value: 42 })
    )
  );
};

var BadgeExamples = {
  sectionName: 'Badges',
  description: 'Badges are typically used to display numbers.',
  examples: [{
    title: 'Basic badges',
    component: BadgeBasicExample
  }, {
    title: 'Colored badges',
    component: BadgeColorExample
  }, {
    title: 'Badges with explicit size',
    component: BadgeSizeExample
  }, {
    title: 'Badges with Icons',
    component: BadgeIconExample
  }]
};
exports.BadgeExamples = BadgeExamples;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJhZGdlLmV4YW1wbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O3FCQUNoQixTQUFTOztxQkFLdEIsU0FBUzs7QUFFaEIsSUFBTSxpQkFBaUIsR0FBRyxTQUFwQixpQkFBaUI7U0FDckI7OztJQUNFOzs7TUFDRSxrREFBTyxLQUFLLEVBQUUsQ0FBQyxBQUFDLEdBQUc7TUFBQyxHQUFHO01BQ3ZCLGtEQUFPLEtBQUssRUFBRSxFQUFFLEFBQUMsR0FBRztNQUFDLEdBQUc7TUFDeEIsa0RBQU8sS0FBSyxFQUFFLEdBQUcsQUFBQyxHQUFHO0tBQ2Y7R0FDSjtDQUNQLENBQUM7O0FBRUYsSUFBTSxpQkFBaUIsR0FBRyxTQUFwQixpQkFBaUI7U0FDckI7OztJQUNFOzs7O01BQ1Esa0RBQU8sS0FBSyxFQUFFLG1CQUFZLElBQUksQUFBQyxFQUFDLEtBQUssRUFBRSxHQUFHLEFBQUMsR0FBRztLQUM5QztJQUNSOzs7O01BQ1csa0RBQU8sS0FBSyxFQUFFLG1CQUFZLE9BQU8sQUFBQyxFQUFDLEtBQUssRUFBRSxHQUFHLEFBQUMsR0FBRztLQUNwRDtJQUNSOzs7O01BQ1csa0RBQU8sS0FBSyxFQUFFLG1CQUFZLE9BQU8sQUFBQyxFQUFDLEtBQUssRUFBRSxHQUFHLEFBQUMsR0FBRztLQUNwRDtJQUNSOzs7O01BQ1Msa0RBQU8sS0FBSyxFQUFFLG1CQUFZLEtBQUssQUFBQyxFQUFDLEtBQUssRUFBRSxHQUFHLEFBQUMsR0FBRztLQUNoRDtHQUNKO0NBQ1AsQ0FBQzs7QUFFRixJQUFNLGdCQUFnQixHQUFHLFNBQW5CLGdCQUFnQjtTQUNwQjs7O0lBQ0U7Ozs7TUFDUyxrREFBTyxJQUFJLEVBQUUsa0JBQVcsS0FBSyxBQUFDLEVBQUMsS0FBSyxFQUFFLEdBQUcsQUFBQyxHQUFHO0tBQzlDO0lBQ1I7Ozs7TUFDVSxrREFBTyxJQUFJLEVBQUUsa0JBQVcsTUFBTSxBQUFDLEVBQUMsS0FBSyxFQUFFLEdBQUcsQUFBQyxHQUFHO0tBQ2hEO0lBQ1I7Ozs7TUFDUyxrREFBTyxJQUFJLEVBQUUsa0JBQVcsS0FBSyxBQUFDLEVBQUMsS0FBSyxFQUFFLEdBQUcsQUFBQyxHQUFHO0tBQzlDO0dBQ0o7Q0FDUCxDQUFDOztBQUVGLElBQU0sZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCO1NBQ3BCOzs7SUFDRTs7O01BQ0Usa0RBQU8sSUFBSSxFQUFDLE1BQU0sRUFBQyxLQUFLLEVBQUUsRUFBRSxBQUFDLEdBQUc7TUFBQyxHQUFHO01BQ3BDLGtEQUFPLElBQUksRUFBQyxnQkFBZ0IsRUFBQyxLQUFLLEVBQUUsbUJBQVksSUFBSSxBQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUUsQUFBQyxHQUFHO01BQUMsR0FBRztNQUN2RSxrREFBTyxJQUFJLEVBQUMsVUFBVSxFQUFDLEtBQUssRUFBRSxtQkFBWSxPQUFPLEFBQUMsRUFBQyxLQUFLLEVBQUUsRUFBRSxBQUFDLEdBQUc7S0FDMUQ7R0FDSjtDQUNQLENBQUM7O0FBRUssSUFBTSxhQUFhLEdBQUc7QUFDM0IsYUFBVyxFQUFFLFFBQVE7QUFDckIsYUFBVyxFQUFFLCtDQUErQztBQUM1RCxVQUFRLEVBQUUsQ0FDUjtBQUNFLFNBQUssRUFBRSxjQUFjO0FBQ3JCLGFBQVMsRUFBRSxpQkFBaUI7R0FDN0IsRUFDRDtBQUNFLFNBQUssRUFBRSxnQkFBZ0I7QUFDdkIsYUFBUyxFQUFFLGlCQUFpQjtHQUM3QixFQUNEO0FBQ0UsU0FBSyxFQUFFLDJCQUEyQjtBQUNsQyxhQUFTLEVBQUUsZ0JBQWdCO0dBQzVCLEVBQ0Q7QUFDRSxTQUFLLEVBQUUsbUJBQW1CO0FBQzFCLGFBQVMsRUFBRSxnQkFBZ0I7R0FDNUIsQ0FDRjtDQUNGLENBQUMiLCJmaWxlIjoiQmFkZ2UuZXhhbXBsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7QmxvY2t9IGZyb20gJy4vQmxvY2snO1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJhZGdlQ29sb3JzLFxuICBCYWRnZVNpemVzLFxufSBmcm9tICcuL0JhZGdlJztcblxuY29uc3QgQmFkZ2VCYXNpY0V4YW1wbGUgPSAoKTogUmVhY3QuRWxlbWVudCA9PiAoXG4gIDxkaXY+XG4gICAgPEJsb2NrPlxuICAgICAgPEJhZGdlIHZhbHVlPXsxfSAvPnsnICd9XG4gICAgICA8QmFkZ2UgdmFsdWU9ezExfSAvPnsnICd9XG4gICAgICA8QmFkZ2UgdmFsdWU9ezEyM30gLz5cbiAgICA8L0Jsb2NrPlxuICA8L2Rpdj5cbik7XG5cbmNvbnN0IEJhZGdlQ29sb3JFeGFtcGxlID0gKCk6IFJlYWN0LkVsZW1lbnQgPT4gKFxuICA8ZGl2PlxuICAgIDxCbG9jaz5cbiAgICAgIEluZm86IDxCYWRnZSBjb2xvcj17QmFkZ2VDb2xvcnMuaW5mb30gdmFsdWU9ezEyM30gLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIFN1Y2Nlc3M6IDxCYWRnZSBjb2xvcj17QmFkZ2VDb2xvcnMuc3VjY2Vzc30gdmFsdWU9ezEyM30gLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIFdhcm5pbmc6IDxCYWRnZSBjb2xvcj17QmFkZ2VDb2xvcnMud2FybmluZ30gdmFsdWU9ezEyM30gLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIEVycm9yOiA8QmFkZ2UgY29sb3I9e0JhZGdlQ29sb3JzLmVycm9yfSB2YWx1ZT17MTIzfSAvPlxuICAgIDwvQmxvY2s+XG4gIDwvZGl2PlxuKTtcblxuY29uc3QgQmFkZ2VTaXplRXhhbXBsZSA9ICgpOiBSZWFjdC5FbGVtZW50ID0+IChcbiAgPGRpdj5cbiAgICA8QmxvY2s+XG4gICAgICBTbWFsbDogPEJhZGdlIHNpemU9e0JhZGdlU2l6ZXMuc21hbGx9IHZhbHVlPXsxMjN9IC8+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICBNZWRpdW06IDxCYWRnZSBzaXplPXtCYWRnZVNpemVzLm1lZGl1bX0gdmFsdWU9ezEyM30gLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIExhcmdlOiA8QmFkZ2Ugc2l6ZT17QmFkZ2VTaXplcy5sYXJnZX0gdmFsdWU9ezEyM30gLz5cbiAgICA8L0Jsb2NrPlxuICA8L2Rpdj5cbik7XG5cbmNvbnN0IEJhZGdlSWNvbkV4YW1wbGUgPSAoKTogUmVhY3QuRWxlbWVudCA9PiAoXG4gIDxkaXY+XG4gICAgPEJsb2NrPlxuICAgICAgPEJhZGdlIGljb249XCJnZWFyXCIgdmFsdWU9ezEzfSAvPnsnICd9XG4gICAgICA8QmFkZ2UgaWNvbj1cImNsb3VkLWRvd25sb2FkXCIgY29sb3I9e0JhZGdlQ29sb3JzLmluZm99IHZhbHVlPXsyM30gLz57JyAnfVxuICAgICAgPEJhZGdlIGljb249XCJvY3RvZmFjZVwiIGNvbG9yPXtCYWRnZUNvbG9ycy5zdWNjZXNzfSB2YWx1ZT17NDJ9IC8+XG4gICAgPC9CbG9jaz5cbiAgPC9kaXY+XG4pO1xuXG5leHBvcnQgY29uc3QgQmFkZ2VFeGFtcGxlcyA9IHtcbiAgc2VjdGlvbk5hbWU6ICdCYWRnZXMnLFxuICBkZXNjcmlwdGlvbjogJ0JhZGdlcyBhcmUgdHlwaWNhbGx5IHVzZWQgdG8gZGlzcGxheSBudW1iZXJzLicsXG4gIGV4YW1wbGVzOiBbXG4gICAge1xuICAgICAgdGl0bGU6ICdCYXNpYyBiYWRnZXMnLFxuICAgICAgY29tcG9uZW50OiBCYWRnZUJhc2ljRXhhbXBsZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRpdGxlOiAnQ29sb3JlZCBiYWRnZXMnLFxuICAgICAgY29tcG9uZW50OiBCYWRnZUNvbG9yRXhhbXBsZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRpdGxlOiAnQmFkZ2VzIHdpdGggZXhwbGljaXQgc2l6ZScsXG4gICAgICBjb21wb25lbnQ6IEJhZGdlU2l6ZUV4YW1wbGUsXG4gICAgfSxcbiAgICB7XG4gICAgICB0aXRsZTogJ0JhZGdlcyB3aXRoIEljb25zJyxcbiAgICAgIGNvbXBvbmVudDogQmFkZ2VJY29uRXhhbXBsZSxcbiAgICB9LFxuICBdLFxufTtcbiJdfQ==