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

var _Toolbar = require('./Toolbar');

var _ToolbarCenter = require('./ToolbarCenter');

var _ToolbarLeft = require('./ToolbarLeft');

var _ToolbarRight = require('./ToolbarRight');

var _Button = require('./Button');

var ToolbarExampleLeft = function ToolbarExampleLeft() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(
        _Toolbar.Toolbar,
        { location: 'top' },
        _reactForAtom.React.createElement(
          _ToolbarLeft.ToolbarLeft,
          null,
          _reactForAtom.React.createElement(
            'div',
            null,
            'a toolbar can have multiple children,'
          ),
          _reactForAtom.React.createElement(
            _Button.Button,
            null,
            'such as this button.'
          )
        )
      )
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(
        'div',
        null,
        'Be sure to use ',
        '<ToolbarLeft/>, <ToolbarLeft/>, and <ToolbarLeft/>',
        ' as children.'
      )
    )
  );
};

var ToolbarExampleCenter = function ToolbarExampleCenter() {
  return _reactForAtom.React.createElement(
    _Block.Block,
    null,
    _reactForAtom.React.createElement(
      _Toolbar.Toolbar,
      { location: 'top' },
      _reactForAtom.React.createElement(
        _ToolbarCenter.ToolbarCenter,
        null,
        _reactForAtom.React.createElement(
          'div',
          null,
          'Example of ',
          '<ToolbarCenter />',
          '.'
        )
      )
    )
  );
};

var ToolbarExampleRight = function ToolbarExampleRight() {
  return _reactForAtom.React.createElement(
    _Block.Block,
    null,
    _reactForAtom.React.createElement(
      _Toolbar.Toolbar,
      { location: 'top' },
      _reactForAtom.React.createElement(
        _ToolbarRight.ToolbarRight,
        null,
        _reactForAtom.React.createElement(
          'div',
          null,
          'Example of ',
          '<ToolbarRight />'
        )
      )
    )
  );
};

var ToolbarExampleMultiple = function ToolbarExampleMultiple() {
  return _reactForAtom.React.createElement(
    _Block.Block,
    null,
    _reactForAtom.React.createElement(
      _Toolbar.Toolbar,
      { location: 'top' },
      _reactForAtom.React.createElement(
        _ToolbarLeft.ToolbarLeft,
        null,
        _reactForAtom.React.createElement(
          'div',
          null,
          'You can combine'
        )
      ),
      _reactForAtom.React.createElement(
        _ToolbarCenter.ToolbarCenter,
        null,
        _reactForAtom.React.createElement(
          'div',
          null,
          'the various kinds'
        )
      ),
      _reactForAtom.React.createElement(
        _ToolbarRight.ToolbarRight,
        null,
        _reactForAtom.React.createElement(
          'div',
          null,
          'of aligners.'
        )
      )
    )
  );
};

var ToolbarExamples = {
  sectionName: 'Toolbar',
  description: '',
  examples: [{
    title: 'Left Toolbar',
    component: ToolbarExampleLeft
  }, {
    title: 'Center Toolbar',
    component: ToolbarExampleCenter
  }, {
    title: 'Right Toolbar',
    component: ToolbarExampleRight
  }, {
    title: 'Combining Toolbar aligners',
    component: ToolbarExampleMultiple
  }]
};
exports.ToolbarExamples = ToolbarExamples;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRvb2xiYXIuZXhhbXBsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7NEJBV29CLGdCQUFnQjs7cUJBQ2hCLFNBQVM7O3VCQUNQLFdBQVc7OzZCQUNMLGlCQUFpQjs7MkJBQ25CLGVBQWU7OzRCQUNkLGdCQUFnQjs7c0JBQ3RCLFVBQVU7O0FBRS9CLElBQU0sa0JBQWtCLEdBQUcsU0FBckIsa0JBQWtCO1NBQ3RCOzs7SUFDRTs7O01BQ0U7O1VBQVMsUUFBUSxFQUFDLEtBQUs7UUFDckI7OztVQUNFOzs7O1dBQWdEO1VBQ2hEOzs7O1dBQXFDO1NBQ3pCO09BQ047S0FDSjtJQUNSOzs7TUFDRTs7OztRQUNrQixvREFBb0Q7O09BQ2hFO0tBQ0E7R0FDSjtDQUNQLENBQUM7O0FBRUYsSUFBTSxvQkFBb0IsR0FBRyxTQUF2QixvQkFBb0I7U0FDeEI7OztJQUNFOztRQUFTLFFBQVEsRUFBQyxLQUFLO01BQ3JCOzs7UUFDRTs7OztVQUFpQixtQkFBbUI7O1NBQVE7T0FDOUI7S0FDUjtHQUNKO0NBQ1QsQ0FBQzs7QUFFRixJQUFNLG1CQUFtQixHQUFHLFNBQXRCLG1CQUFtQjtTQUN2Qjs7O0lBQ0U7O1FBQVMsUUFBUSxFQUFDLEtBQUs7TUFDckI7OztRQUNFOzs7O1VBQWlCLGtCQUFrQjtTQUFPO09BQzdCO0tBQ1A7R0FDSjtDQUNULENBQUM7O0FBRUYsSUFBTSxzQkFBc0IsR0FBRyxTQUF6QixzQkFBc0I7U0FDMUI7OztJQUNFOztRQUFTLFFBQVEsRUFBQyxLQUFLO01BQ3JCOzs7UUFDRTs7OztTQUEwQjtPQUNkO01BQ2Q7OztRQUNFOzs7O1NBQTRCO09BQ2Q7TUFDaEI7OztRQUNFOzs7O1NBQXVCO09BQ1Y7S0FDUDtHQUNKO0NBQ1QsQ0FBQzs7QUFFSyxJQUFNLGVBQWUsR0FBRztBQUM3QixhQUFXLEVBQUUsU0FBUztBQUN0QixhQUFXLEVBQUUsRUFBRTtBQUNmLFVBQVEsRUFBRSxDQUNSO0FBQ0UsU0FBSyxFQUFFLGNBQWM7QUFDckIsYUFBUyxFQUFFLGtCQUFrQjtHQUM5QixFQUNEO0FBQ0UsU0FBSyxFQUFFLGdCQUFnQjtBQUN2QixhQUFTLEVBQUUsb0JBQW9CO0dBQ2hDLEVBQ0Q7QUFDRSxTQUFLLEVBQUUsZUFBZTtBQUN0QixhQUFTLEVBQUUsbUJBQW1CO0dBQy9CLEVBQ0Q7QUFDRSxTQUFLLEVBQUUsNEJBQTRCO0FBQ25DLGFBQVMsRUFBRSxzQkFBc0I7R0FDbEMsQ0FDRjtDQUNGLENBQUMiLCJmaWxlIjoiVG9vbGJhci5leGFtcGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtCbG9ja30gZnJvbSAnLi9CbG9jayc7XG5pbXBvcnQge1Rvb2xiYXJ9IGZyb20gJy4vVG9vbGJhcic7XG5pbXBvcnQge1Rvb2xiYXJDZW50ZXJ9IGZyb20gJy4vVG9vbGJhckNlbnRlcic7XG5pbXBvcnQge1Rvb2xiYXJMZWZ0fSBmcm9tICcuL1Rvb2xiYXJMZWZ0JztcbmltcG9ydCB7VG9vbGJhclJpZ2h0fSBmcm9tICcuL1Rvb2xiYXJSaWdodCc7XG5pbXBvcnQge0J1dHRvbn0gZnJvbSAnLi9CdXR0b24nO1xuXG5jb25zdCBUb29sYmFyRXhhbXBsZUxlZnQgPSAoKTogUmVhY3RFbGVtZW50ID0+IChcbiAgPGRpdj5cbiAgICA8QmxvY2s+XG4gICAgICA8VG9vbGJhciBsb2NhdGlvbj1cInRvcFwiPlxuICAgICAgICA8VG9vbGJhckxlZnQ+XG4gICAgICAgICAgPGRpdj5hIHRvb2xiYXIgY2FuIGhhdmUgbXVsdGlwbGUgY2hpbGRyZW4sPC9kaXY+XG4gICAgICAgICAgPEJ1dHRvbj5zdWNoIGFzIHRoaXMgYnV0dG9uLjwvQnV0dG9uPlxuICAgICAgICA8L1Rvb2xiYXJMZWZ0PlxuICAgICAgPC9Ub29sYmFyPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPGRpdj5cbiAgICAgICAgQmUgc3VyZSB0byB1c2Ugeyc8VG9vbGJhckxlZnQvPiwgPFRvb2xiYXJMZWZ0Lz4sIGFuZCA8VG9vbGJhckxlZnQvPid9IGFzIGNoaWxkcmVuLlxuICAgICAgPC9kaXY+XG4gICAgPC9CbG9jaz5cbiAgPC9kaXY+XG4pO1xuXG5jb25zdCBUb29sYmFyRXhhbXBsZUNlbnRlciA9ICgpOiBSZWFjdEVsZW1lbnQgPT4gKFxuICA8QmxvY2s+XG4gICAgPFRvb2xiYXIgbG9jYXRpb249XCJ0b3BcIj5cbiAgICAgIDxUb29sYmFyQ2VudGVyPlxuICAgICAgICA8ZGl2PkV4YW1wbGUgb2Ygeyc8VG9vbGJhckNlbnRlciAvPid9LjwvZGl2PlxuICAgICAgPC9Ub29sYmFyQ2VudGVyPlxuICAgIDwvVG9vbGJhcj5cbiAgPC9CbG9jaz5cbik7XG5cbmNvbnN0IFRvb2xiYXJFeGFtcGxlUmlnaHQgPSAoKTogUmVhY3RFbGVtZW50ID0+IChcbiAgPEJsb2NrPlxuICAgIDxUb29sYmFyIGxvY2F0aW9uPVwidG9wXCI+XG4gICAgICA8VG9vbGJhclJpZ2h0PlxuICAgICAgICA8ZGl2PkV4YW1wbGUgb2Ygeyc8VG9vbGJhclJpZ2h0IC8+J308L2Rpdj5cbiAgICAgIDwvVG9vbGJhclJpZ2h0PlxuICAgIDwvVG9vbGJhcj5cbiAgPC9CbG9jaz5cbik7XG5cbmNvbnN0IFRvb2xiYXJFeGFtcGxlTXVsdGlwbGUgPSAoKTogUmVhY3RFbGVtZW50ID0+IChcbiAgPEJsb2NrPlxuICAgIDxUb29sYmFyIGxvY2F0aW9uPVwidG9wXCI+XG4gICAgICA8VG9vbGJhckxlZnQ+XG4gICAgICAgIDxkaXY+WW91IGNhbiBjb21iaW5lPC9kaXY+XG4gICAgICA8L1Rvb2xiYXJMZWZ0PlxuICAgICAgPFRvb2xiYXJDZW50ZXI+XG4gICAgICAgIDxkaXY+dGhlIHZhcmlvdXMga2luZHM8L2Rpdj5cbiAgICAgIDwvVG9vbGJhckNlbnRlcj5cbiAgICAgIDxUb29sYmFyUmlnaHQ+XG4gICAgICAgIDxkaXY+b2YgYWxpZ25lcnMuPC9kaXY+XG4gICAgICA8L1Rvb2xiYXJSaWdodD5cbiAgICA8L1Rvb2xiYXI+XG4gIDwvQmxvY2s+XG4pO1xuXG5leHBvcnQgY29uc3QgVG9vbGJhckV4YW1wbGVzID0ge1xuICBzZWN0aW9uTmFtZTogJ1Rvb2xiYXInLFxuICBkZXNjcmlwdGlvbjogJycsXG4gIGV4YW1wbGVzOiBbXG4gICAge1xuICAgICAgdGl0bGU6ICdMZWZ0IFRvb2xiYXInLFxuICAgICAgY29tcG9uZW50OiBUb29sYmFyRXhhbXBsZUxlZnQsXG4gICAgfSxcbiAgICB7XG4gICAgICB0aXRsZTogJ0NlbnRlciBUb29sYmFyJyxcbiAgICAgIGNvbXBvbmVudDogVG9vbGJhckV4YW1wbGVDZW50ZXIsXG4gICAgfSxcbiAgICB7XG4gICAgICB0aXRsZTogJ1JpZ2h0IFRvb2xiYXInLFxuICAgICAgY29tcG9uZW50OiBUb29sYmFyRXhhbXBsZVJpZ2h0LFxuICAgIH0sXG4gICAge1xuICAgICAgdGl0bGU6ICdDb21iaW5pbmcgVG9vbGJhciBhbGlnbmVycycsXG4gICAgICBjb21wb25lbnQ6IFRvb2xiYXJFeGFtcGxlTXVsdGlwbGUsXG4gICAgfSxcbiAgXSxcbn07XG4iXX0=