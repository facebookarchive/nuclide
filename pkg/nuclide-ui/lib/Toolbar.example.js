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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRvb2xiYXIuZXhhbXBsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7NEJBV29CLGdCQUFnQjs7cUJBQ2hCLFNBQVM7O3VCQUNQLFdBQVc7OzZCQUNMLGlCQUFpQjs7MkJBQ25CLGVBQWU7OzRCQUNkLGdCQUFnQjs7c0JBQ3RCLFVBQVU7O0FBRS9CLElBQU0sa0JBQWtCLEdBQUcsU0FBckIsa0JBQWtCO1NBQ3RCOzs7SUFDRTs7O01BQ0U7O1VBQVMsUUFBUSxFQUFDLEtBQUs7UUFDckI7OztVQUNFOzs7O1dBQWdEO1VBQ2hEOzs7O1dBQXFDO1NBQ3pCO09BQ047S0FDSjtJQUNSOzs7TUFDRTs7OztRQUNrQixvREFBb0Q7O09BQ2hFO0tBQ0E7R0FDSjtDQUNQLENBQUM7O0FBRUYsSUFBTSxvQkFBb0IsR0FBRyxTQUF2QixvQkFBb0I7U0FDeEI7OztJQUNFOztRQUFTLFFBQVEsRUFBQyxLQUFLO01BQ3JCOzs7UUFDRTs7OztVQUFpQixtQkFBbUI7O1NBQVE7T0FDOUI7S0FDUjtHQUNKO0NBQ1QsQ0FBQzs7QUFFRixJQUFNLG1CQUFtQixHQUFHLFNBQXRCLG1CQUFtQjtTQUN2Qjs7O0lBQ0U7O1FBQVMsUUFBUSxFQUFDLEtBQUs7TUFDckI7OztRQUNFOzs7O1VBQWlCLGtCQUFrQjtTQUFPO09BQzdCO0tBQ1A7R0FDSjtDQUNULENBQUM7O0FBRUYsSUFBTSxzQkFBc0IsR0FBRyxTQUF6QixzQkFBc0I7U0FDMUI7OztJQUNFOztRQUFTLFFBQVEsRUFBQyxLQUFLO01BQ3JCOzs7UUFDRTs7OztTQUEwQjtPQUNkO01BQ2Q7OztRQUNFOzs7O1NBQTRCO09BQ2Q7TUFDaEI7OztRQUNFOzs7O1NBQXVCO09BQ1Y7S0FDUDtHQUNKO0NBQ1QsQ0FBQzs7QUFFSyxJQUFNLGVBQWUsR0FBRztBQUM3QixhQUFXLEVBQUUsU0FBUztBQUN0QixhQUFXLEVBQUUsRUFBRTtBQUNmLFVBQVEsRUFBRSxDQUNSO0FBQ0UsU0FBSyxFQUFFLGNBQWM7QUFDckIsYUFBUyxFQUFFLGtCQUFrQjtHQUM5QixFQUNEO0FBQ0UsU0FBSyxFQUFFLGdCQUFnQjtBQUN2QixhQUFTLEVBQUUsb0JBQW9CO0dBQ2hDLEVBQ0Q7QUFDRSxTQUFLLEVBQUUsZUFBZTtBQUN0QixhQUFTLEVBQUUsbUJBQW1CO0dBQy9CLEVBQ0Q7QUFDRSxTQUFLLEVBQUUsNEJBQTRCO0FBQ25DLGFBQVMsRUFBRSxzQkFBc0I7R0FDbEMsQ0FDRjtDQUNGLENBQUMiLCJmaWxlIjoiVG9vbGJhci5leGFtcGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtCbG9ja30gZnJvbSAnLi9CbG9jayc7XG5pbXBvcnQge1Rvb2xiYXJ9IGZyb20gJy4vVG9vbGJhcic7XG5pbXBvcnQge1Rvb2xiYXJDZW50ZXJ9IGZyb20gJy4vVG9vbGJhckNlbnRlcic7XG5pbXBvcnQge1Rvb2xiYXJMZWZ0fSBmcm9tICcuL1Rvb2xiYXJMZWZ0JztcbmltcG9ydCB7VG9vbGJhclJpZ2h0fSBmcm9tICcuL1Rvb2xiYXJSaWdodCc7XG5pbXBvcnQge0J1dHRvbn0gZnJvbSAnLi9CdXR0b24nO1xuXG5jb25zdCBUb29sYmFyRXhhbXBsZUxlZnQgPSAoKTogUmVhY3QuRWxlbWVudCA9PiAoXG4gIDxkaXY+XG4gICAgPEJsb2NrPlxuICAgICAgPFRvb2xiYXIgbG9jYXRpb249XCJ0b3BcIj5cbiAgICAgICAgPFRvb2xiYXJMZWZ0PlxuICAgICAgICAgIDxkaXY+YSB0b29sYmFyIGNhbiBoYXZlIG11bHRpcGxlIGNoaWxkcmVuLDwvZGl2PlxuICAgICAgICAgIDxCdXR0b24+c3VjaCBhcyB0aGlzIGJ1dHRvbi48L0J1dHRvbj5cbiAgICAgICAgPC9Ub29sYmFyTGVmdD5cbiAgICAgIDwvVG9vbGJhcj5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIDxkaXY+XG4gICAgICAgIEJlIHN1cmUgdG8gdXNlIHsnPFRvb2xiYXJMZWZ0Lz4sIDxUb29sYmFyTGVmdC8+LCBhbmQgPFRvb2xiYXJMZWZ0Lz4nfSBhcyBjaGlsZHJlbi5cbiAgICAgIDwvZGl2PlxuICAgIDwvQmxvY2s+XG4gIDwvZGl2PlxuKTtcblxuY29uc3QgVG9vbGJhckV4YW1wbGVDZW50ZXIgPSAoKTogUmVhY3QuRWxlbWVudCA9PiAoXG4gIDxCbG9jaz5cbiAgICA8VG9vbGJhciBsb2NhdGlvbj1cInRvcFwiPlxuICAgICAgPFRvb2xiYXJDZW50ZXI+XG4gICAgICAgIDxkaXY+RXhhbXBsZSBvZiB7JzxUb29sYmFyQ2VudGVyIC8+J30uPC9kaXY+XG4gICAgICA8L1Rvb2xiYXJDZW50ZXI+XG4gICAgPC9Ub29sYmFyPlxuICA8L0Jsb2NrPlxuKTtcblxuY29uc3QgVG9vbGJhckV4YW1wbGVSaWdodCA9ICgpOiBSZWFjdC5FbGVtZW50ID0+IChcbiAgPEJsb2NrPlxuICAgIDxUb29sYmFyIGxvY2F0aW9uPVwidG9wXCI+XG4gICAgICA8VG9vbGJhclJpZ2h0PlxuICAgICAgICA8ZGl2PkV4YW1wbGUgb2Ygeyc8VG9vbGJhclJpZ2h0IC8+J308L2Rpdj5cbiAgICAgIDwvVG9vbGJhclJpZ2h0PlxuICAgIDwvVG9vbGJhcj5cbiAgPC9CbG9jaz5cbik7XG5cbmNvbnN0IFRvb2xiYXJFeGFtcGxlTXVsdGlwbGUgPSAoKTogUmVhY3QuRWxlbWVudCA9PiAoXG4gIDxCbG9jaz5cbiAgICA8VG9vbGJhciBsb2NhdGlvbj1cInRvcFwiPlxuICAgICAgPFRvb2xiYXJMZWZ0PlxuICAgICAgICA8ZGl2PllvdSBjYW4gY29tYmluZTwvZGl2PlxuICAgICAgPC9Ub29sYmFyTGVmdD5cbiAgICAgIDxUb29sYmFyQ2VudGVyPlxuICAgICAgICA8ZGl2PnRoZSB2YXJpb3VzIGtpbmRzPC9kaXY+XG4gICAgICA8L1Rvb2xiYXJDZW50ZXI+XG4gICAgICA8VG9vbGJhclJpZ2h0PlxuICAgICAgICA8ZGl2Pm9mIGFsaWduZXJzLjwvZGl2PlxuICAgICAgPC9Ub29sYmFyUmlnaHQ+XG4gICAgPC9Ub29sYmFyPlxuICA8L0Jsb2NrPlxuKTtcblxuZXhwb3J0IGNvbnN0IFRvb2xiYXJFeGFtcGxlcyA9IHtcbiAgc2VjdGlvbk5hbWU6ICdUb29sYmFyJyxcbiAgZGVzY3JpcHRpb246ICcnLFxuICBleGFtcGxlczogW1xuICAgIHtcbiAgICAgIHRpdGxlOiAnTGVmdCBUb29sYmFyJyxcbiAgICAgIGNvbXBvbmVudDogVG9vbGJhckV4YW1wbGVMZWZ0LFxuICAgIH0sXG4gICAge1xuICAgICAgdGl0bGU6ICdDZW50ZXIgVG9vbGJhcicsXG4gICAgICBjb21wb25lbnQ6IFRvb2xiYXJFeGFtcGxlQ2VudGVyLFxuICAgIH0sXG4gICAge1xuICAgICAgdGl0bGU6ICdSaWdodCBUb29sYmFyJyxcbiAgICAgIGNvbXBvbmVudDogVG9vbGJhckV4YW1wbGVSaWdodCxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRpdGxlOiAnQ29tYmluaW5nIFRvb2xiYXIgYWxpZ25lcnMnLFxuICAgICAgY29tcG9uZW50OiBUb29sYmFyRXhhbXBsZU11bHRpcGxlLFxuICAgIH0sXG4gIF0sXG59O1xuIl19