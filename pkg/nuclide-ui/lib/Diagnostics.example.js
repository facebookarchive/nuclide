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

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _Block = require('./Block');

var _DiagnosticsMessage = require('./DiagnosticsMessage');

var GOTOLOCATION = function GOTOLOCATION(path, line) {
  atom.notifications.addInfo('Let\'s pretend I opened "' + path + '" at line ' + line + '.');
};
var FIXER = function FIXER() {
  atom.notifications.addInfo('TADA! Fixed.');
};

var messageWarning = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Warning',
  filePath: 'path/to/some/file.js',
  text: 'A word of warning: Something might be broken here.'
};

var messageError = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Error',
  filePath: 'path/to/some/file.js',
  text: 'Error! Something is definitely broken here.'
};

var messageFixable = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Warning',
  filePath: 'path/to/some/file.js',
  text: 'Something looks broken here, but it can be fixed automatically via the "fix" button.',
  fix: {
    oldRange: new _atom.Range([1, 1], [1, 6]),
    newText: 'fixed'
  }
};

var messageWithTrace = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Warning',
  filePath: 'path/to/some/file.js',
  text: 'Something is broken here.',
  trace: [{
    type: 'Trace',
    text: 'A diagnostics message can contain multiple trace lines',
    filePath: 'path/to/random/file.js',
    range: new _atom.Range([1, 1], [1, 6])
  }, {
    type: 'Trace',
    text: 'Trace lines can have paths and ranges, too.',
    filePath: 'path/to/another/file.js',
    range: new _atom.Range([2, 1], [2, 6])
  }, {
    type: 'Trace',
    text: 'Paths and ranges are optional.'
  }]
};

var DiagnosticMessageWarningExample = function DiagnosticMessageWarningExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_DiagnosticsMessage.DiagnosticsMessage, {
        message: messageWarning,
        goToLocation: GOTOLOCATION,
        fixer: FIXER
      })
    )
  );
};

var DiagnosticMessageErrorExample = function DiagnosticMessageErrorExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_DiagnosticsMessage.DiagnosticsMessage, {
        message: messageError,
        goToLocation: GOTOLOCATION,
        fixer: FIXER
      })
    )
  );
};

var DiagnosticMessageFixableExample = function DiagnosticMessageFixableExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_DiagnosticsMessage.DiagnosticsMessage, {
        message: messageFixable,
        goToLocation: GOTOLOCATION,
        fixer: FIXER
      })
    )
  );
};

var DiagnosticMessageTraceExample = function DiagnosticMessageTraceExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_DiagnosticsMessage.DiagnosticsMessage, {
        message: messageWithTrace,
        goToLocation: GOTOLOCATION,
        fixer: FIXER
      })
    )
  );
};

var DiagnosticsExamples = {
  sectionName: 'DiagnosticsMessage',
  description: 'Display warnings & error messages',
  examples: [{
    title: 'Warning',
    component: DiagnosticMessageWarningExample
  }, {
    title: 'Error',
    component: DiagnosticMessageErrorExample
  }, {
    title: 'Fixable warning:',
    component: DiagnosticMessageFixableExample
  }, {
    title: 'Warning with traces',
    component: DiagnosticMessageTraceExample
  }]
};
exports.DiagnosticsExamples = DiagnosticsExamples;
//# sourceMappingURL=data:application/json;base64,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OztJQUNFOzs7TUFDRTtBQUNFLGVBQU8sRUFBRSxjQUFjLEFBQUM7QUFDeEIsb0JBQVksRUFBRSxZQUFZLEFBQUM7QUFDM0IsYUFBSyxFQUFFLEtBQUssQUFBQztRQUNiO0tBQ0k7R0FDSjtDQUNQLENBQUM7O0FBRUYsSUFBTSw2QkFBNkIsR0FBRyxTQUFoQyw2QkFBNkI7U0FDakM7OztJQUNFOzs7TUFDRTtBQUNFLGVBQU8sRUFBRSxnQkFBZ0IsQUFBQztBQUMxQixvQkFBWSxFQUFFLFlBQVksQUFBQztBQUMzQixhQUFLLEVBQUUsS0FBSyxBQUFDO1FBQ2I7S0FDSTtHQUNKO0NBQ1AsQ0FBQzs7QUFFSyxJQUFNLG1CQUFtQixHQUFHO0FBQ2pDLGFBQVcsRUFBRSxvQkFBb0I7QUFDakMsYUFBVyxFQUFFLG1DQUFtQztBQUNoRCxVQUFRLEVBQUUsQ0FDUjtBQUNFLFNBQUssRUFBRSxTQUFTO0FBQ2hCLGFBQVMsRUFBRSwrQkFBK0I7R0FDM0MsRUFDRDtBQUNFLFNBQUssRUFBRSxPQUFPO0FBQ2QsYUFBUyxFQUFFLDZCQUE2QjtHQUN6QyxFQUNEO0FBQ0UsU0FBSyxFQUFFLGtCQUFrQjtBQUN6QixhQUFTLEVBQUUsK0JBQStCO0dBQzNDLEVBQ0Q7QUFDRSxTQUFLLEVBQUUscUJBQXFCO0FBQzVCLGFBQVMsRUFBRSw2QkFBNkI7R0FDekMsQ0FDRjtDQUNGLENBQUMiLCJmaWxlIjoiRGlhZ25vc3RpY3MuZXhhbXBsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLWJhc2UnO1xuXG5pbXBvcnQge1xuICBSYW5nZSxcbn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0Jsb2NrfSBmcm9tICcuL0Jsb2NrJztcbmltcG9ydCB7RGlhZ25vc3RpY3NNZXNzYWdlfSBmcm9tICcuL0RpYWdub3N0aWNzTWVzc2FnZSc7XG5cbmNvbnN0IEdPVE9MT0NBVElPTiA9IChwYXRoOiBzdHJpbmcsIGxpbmU6IG51bWJlcikgPT4ge1xuICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhgTGV0J3MgcHJldGVuZCBJIG9wZW5lZCBcIiR7cGF0aH1cIiBhdCBsaW5lICR7bGluZX0uYCk7XG59O1xuY29uc3QgRklYRVIgPSAoKSA9PiB7XG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdUQURBISBGaXhlZC4nKTtcbn07XG5cbmNvbnN0IG1lc3NhZ2VXYXJuaW5nOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UgPSB7XG4gIHNjb3BlOiAnZmlsZScsXG4gIHByb3ZpZGVyTmFtZTogJ0Nvb2xMaW50ZXInLFxuICB0eXBlOiAnV2FybmluZycsXG4gIGZpbGVQYXRoOiAncGF0aC90by9zb21lL2ZpbGUuanMnLFxuICB0ZXh0OiAnQSB3b3JkIG9mIHdhcm5pbmc6IFNvbWV0aGluZyBtaWdodCBiZSBicm9rZW4gaGVyZS4nLFxufTtcblxuY29uc3QgbWVzc2FnZUVycm9yOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UgPSB7XG4gIHNjb3BlOiAnZmlsZScsXG4gIHByb3ZpZGVyTmFtZTogJ0Nvb2xMaW50ZXInLFxuICB0eXBlOiAnRXJyb3InLFxuICBmaWxlUGF0aDogJ3BhdGgvdG8vc29tZS9maWxlLmpzJyxcbiAgdGV4dDogJ0Vycm9yISBTb21ldGhpbmcgaXMgZGVmaW5pdGVseSBicm9rZW4gaGVyZS4nLFxufTtcblxuY29uc3QgbWVzc2FnZUZpeGFibGU6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSA9IHtcbiAgc2NvcGU6ICdmaWxlJyxcbiAgcHJvdmlkZXJOYW1lOiAnQ29vbExpbnRlcicsXG4gIHR5cGU6ICdXYXJuaW5nJyxcbiAgZmlsZVBhdGg6ICdwYXRoL3RvL3NvbWUvZmlsZS5qcycsXG4gIHRleHQ6ICdTb21ldGhpbmcgbG9va3MgYnJva2VuIGhlcmUsIGJ1dCBpdCBjYW4gYmUgZml4ZWQgYXV0b21hdGljYWxseSB2aWEgdGhlIFwiZml4XCIgYnV0dG9uLicsXG4gIGZpeDoge1xuICAgIG9sZFJhbmdlOiBuZXcgUmFuZ2UoWzEsIDFdLCBbMSwgNl0pLFxuICAgIG5ld1RleHQ6ICdmaXhlZCcsXG4gIH0sXG59O1xuXG5jb25zdCBtZXNzYWdlV2l0aFRyYWNlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UgPSB7XG4gIHNjb3BlOiAnZmlsZScsXG4gIHByb3ZpZGVyTmFtZTogJ0Nvb2xMaW50ZXInLFxuICB0eXBlOiAnV2FybmluZycsXG4gIGZpbGVQYXRoOiAncGF0aC90by9zb21lL2ZpbGUuanMnLFxuICB0ZXh0OiAnU29tZXRoaW5nIGlzIGJyb2tlbiBoZXJlLicsXG4gIHRyYWNlOiBbXG4gICAge1xuICAgICAgdHlwZTogJ1RyYWNlJyxcbiAgICAgIHRleHQ6ICdBIGRpYWdub3N0aWNzIG1lc3NhZ2UgY2FuIGNvbnRhaW4gbXVsdGlwbGUgdHJhY2UgbGluZXMnLFxuICAgICAgZmlsZVBhdGg6ICdwYXRoL3RvL3JhbmRvbS9maWxlLmpzJyxcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoWzEsIDFdLCBbMSwgNl0pLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogJ1RyYWNlJyxcbiAgICAgIHRleHQ6ICdUcmFjZSBsaW5lcyBjYW4gaGF2ZSBwYXRocyBhbmQgcmFuZ2VzLCB0b28uJyxcbiAgICAgIGZpbGVQYXRoOiAncGF0aC90by9hbm90aGVyL2ZpbGUuanMnLFxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZShbMiwgMV0sIFsyLCA2XSksXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiAnVHJhY2UnLFxuICAgICAgdGV4dDogJ1BhdGhzIGFuZCByYW5nZXMgYXJlIG9wdGlvbmFsLicsXG4gICAgfSxcbiAgXSxcbn07XG5cbmNvbnN0IERpYWdub3N0aWNNZXNzYWdlV2FybmluZ0V4YW1wbGUgPSAoKTogUmVhY3QuRWxlbWVudCA9PiAoXG4gIDxkaXY+XG4gICAgPEJsb2NrPlxuICAgICAgPERpYWdub3N0aWNzTWVzc2FnZVxuICAgICAgICBtZXNzYWdlPXttZXNzYWdlV2FybmluZ31cbiAgICAgICAgZ29Ub0xvY2F0aW9uPXtHT1RPTE9DQVRJT059XG4gICAgICAgIGZpeGVyPXtGSVhFUn1cbiAgICAgIC8+XG4gICAgPC9CbG9jaz5cbiAgPC9kaXY+XG4pO1xuXG5jb25zdCBEaWFnbm9zdGljTWVzc2FnZUVycm9yRXhhbXBsZSA9ICgpOiBSZWFjdC5FbGVtZW50ID0+IChcbiAgPGRpdj5cbiAgICA8QmxvY2s+XG4gICAgICA8RGlhZ25vc3RpY3NNZXNzYWdlXG4gICAgICAgIG1lc3NhZ2U9e21lc3NhZ2VFcnJvcn1cbiAgICAgICAgZ29Ub0xvY2F0aW9uPXtHT1RPTE9DQVRJT059XG4gICAgICAgIGZpeGVyPXtGSVhFUn1cbiAgICAgIC8+XG4gICAgPC9CbG9jaz5cbiAgPC9kaXY+XG4pO1xuXG5jb25zdCBEaWFnbm9zdGljTWVzc2FnZUZpeGFibGVFeGFtcGxlID0gKCk6IFJlYWN0LkVsZW1lbnQgPT4gKFxuICA8ZGl2PlxuICAgIDxCbG9jaz5cbiAgICAgIDxEaWFnbm9zdGljc01lc3NhZ2VcbiAgICAgICAgbWVzc2FnZT17bWVzc2FnZUZpeGFibGV9XG4gICAgICAgIGdvVG9Mb2NhdGlvbj17R09UT0xPQ0FUSU9OfVxuICAgICAgICBmaXhlcj17RklYRVJ9XG4gICAgICAvPlxuICAgIDwvQmxvY2s+XG4gIDwvZGl2PlxuKTtcblxuY29uc3QgRGlhZ25vc3RpY01lc3NhZ2VUcmFjZUV4YW1wbGUgPSAoKTogUmVhY3QuRWxlbWVudCA9PiAoXG4gIDxkaXY+XG4gICAgPEJsb2NrPlxuICAgICAgPERpYWdub3N0aWNzTWVzc2FnZVxuICAgICAgICBtZXNzYWdlPXttZXNzYWdlV2l0aFRyYWNlfVxuICAgICAgICBnb1RvTG9jYXRpb249e0dPVE9MT0NBVElPTn1cbiAgICAgICAgZml4ZXI9e0ZJWEVSfVxuICAgICAgLz5cbiAgICA8L0Jsb2NrPlxuICA8L2Rpdj5cbik7XG5cbmV4cG9ydCBjb25zdCBEaWFnbm9zdGljc0V4YW1wbGVzID0ge1xuICBzZWN0aW9uTmFtZTogJ0RpYWdub3N0aWNzTWVzc2FnZScsXG4gIGRlc2NyaXB0aW9uOiAnRGlzcGxheSB3YXJuaW5ncyAmIGVycm9yIG1lc3NhZ2VzJyxcbiAgZXhhbXBsZXM6IFtcbiAgICB7XG4gICAgICB0aXRsZTogJ1dhcm5pbmcnLFxuICAgICAgY29tcG9uZW50OiBEaWFnbm9zdGljTWVzc2FnZVdhcm5pbmdFeGFtcGxlLFxuICAgIH0sXG4gICAge1xuICAgICAgdGl0bGU6ICdFcnJvcicsXG4gICAgICBjb21wb25lbnQ6IERpYWdub3N0aWNNZXNzYWdlRXJyb3JFeGFtcGxlLFxuICAgIH0sXG4gICAge1xuICAgICAgdGl0bGU6ICdGaXhhYmxlIHdhcm5pbmc6JyxcbiAgICAgIGNvbXBvbmVudDogRGlhZ25vc3RpY01lc3NhZ2VGaXhhYmxlRXhhbXBsZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRpdGxlOiAnV2FybmluZyB3aXRoIHRyYWNlcycsXG4gICAgICBjb21wb25lbnQ6IERpYWdub3N0aWNNZXNzYWdlVHJhY2VFeGFtcGxlLFxuICAgIH0sXG4gIF0sXG59O1xuIl19