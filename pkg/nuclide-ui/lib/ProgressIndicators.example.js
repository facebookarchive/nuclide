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

var _ProgressBar = require('./ProgressBar');

var _LoadingSpinner = require('./LoadingSpinner');

var ProgressBarExample = function ProgressBarExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_ProgressBar.ProgressBar, null)
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_ProgressBar.ProgressBar, { max: 100, value: 0 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_ProgressBar.ProgressBar, { max: 100, value: 50 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_ProgressBar.ProgressBar, { max: 100, value: 100 })
    )
  );
};

var LoadingSpinnerExample = function LoadingSpinnerExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_LoadingSpinner.LoadingSpinner, { size: 'EXTRA_SMALL' })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_LoadingSpinner.LoadingSpinner, { size: 'SMALL' })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_LoadingSpinner.LoadingSpinner, { size: 'MEDIUM' })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_LoadingSpinner.LoadingSpinner, { size: 'LARGE' })
    )
  );
};

var ProgressIndicatorExamples = {
  sectionName: 'Progress Indicators',
  description: 'Show that work is being performed. Consider using one of these for any work > 1s.',
  examples: [{
    title: 'ProgressBar',
    component: ProgressBarExample
  }, {
    title: 'LoadingSpinner',
    component: LoadingSpinnerExample
  }]
};
exports.ProgressIndicatorExamples = ProgressIndicatorExamples;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb2dyZXNzSW5kaWNhdG9ycy5leGFtcGxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs0QkFXb0IsZ0JBQWdCOztxQkFDaEIsU0FBUzs7MkJBQ0gsZUFBZTs7OEJBQ1osa0JBQWtCOztBQUUvQyxJQUFNLGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQjtTQUN0Qjs7O0lBQ0U7OztNQUNFLGlFQUFlO0tBQ1Q7SUFDUjs7O01BQ0UsOERBQWEsR0FBRyxFQUFFLEdBQUcsQUFBQyxFQUFDLEtBQUssRUFBRSxDQUFDLEFBQUMsR0FBRztLQUM3QjtJQUNSOzs7TUFDRSw4REFBYSxHQUFHLEVBQUUsR0FBRyxBQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUUsQUFBQyxHQUFHO0tBQzlCO0lBQ1I7OztNQUNFLDhEQUFhLEdBQUcsRUFBRSxHQUFHLEFBQUMsRUFBQyxLQUFLLEVBQUUsR0FBRyxBQUFDLEdBQUc7S0FDL0I7R0FDSjtDQUNQLENBQUM7O0FBRUYsSUFBTSxxQkFBcUIsR0FBRyxTQUF4QixxQkFBcUI7U0FDekI7OztJQUNFOzs7TUFDRSxvRUFBZ0IsSUFBSSxFQUFDLGFBQWEsR0FBRztLQUMvQjtJQUNSOzs7TUFDRSxvRUFBZ0IsSUFBSSxFQUFDLE9BQU8sR0FBRztLQUN6QjtJQUNSOzs7TUFDRSxvRUFBZ0IsSUFBSSxFQUFDLFFBQVEsR0FBRztLQUMxQjtJQUNSOzs7TUFDRSxvRUFBZ0IsSUFBSSxFQUFDLE9BQU8sR0FBRztLQUN6QjtHQUNKO0NBQ1AsQ0FBQzs7QUFFSyxJQUFNLHlCQUF5QixHQUFHO0FBQ3ZDLGFBQVcsRUFBRSxxQkFBcUI7QUFDbEMsYUFBVyxFQUFFLG1GQUFtRjtBQUNoRyxVQUFRLEVBQUUsQ0FDUjtBQUNFLFNBQUssRUFBRSxhQUFhO0FBQ3BCLGFBQVMsRUFBRSxrQkFBa0I7R0FDOUIsRUFDRDtBQUNFLFNBQUssRUFBRSxnQkFBZ0I7QUFDdkIsYUFBUyxFQUFFLHFCQUFxQjtHQUNqQyxDQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJQcm9ncmVzc0luZGljYXRvcnMuZXhhbXBsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7QmxvY2t9IGZyb20gJy4vQmxvY2snO1xuaW1wb3J0IHtQcm9ncmVzc0Jhcn0gZnJvbSAnLi9Qcm9ncmVzc0Jhcic7XG5pbXBvcnQge0xvYWRpbmdTcGlubmVyfSBmcm9tICcuL0xvYWRpbmdTcGlubmVyJztcblxuY29uc3QgUHJvZ3Jlc3NCYXJFeGFtcGxlID0gKCk6IFJlYWN0LkVsZW1lbnQgPT4gKFxuICA8ZGl2PlxuICAgIDxCbG9jaz5cbiAgICAgIDxQcm9ncmVzc0JhciAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPFByb2dyZXNzQmFyIG1heD17MTAwfSB2YWx1ZT17MH0gLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIDxQcm9ncmVzc0JhciBtYXg9ezEwMH0gdmFsdWU9ezUwfSAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPFByb2dyZXNzQmFyIG1heD17MTAwfSB2YWx1ZT17MTAwfSAvPlxuICAgIDwvQmxvY2s+XG4gIDwvZGl2PlxuKTtcblxuY29uc3QgTG9hZGluZ1NwaW5uZXJFeGFtcGxlID0gKCk6IFJlYWN0LkVsZW1lbnQgPT4gKFxuICA8ZGl2PlxuICAgIDxCbG9jaz5cbiAgICAgIDxMb2FkaW5nU3Bpbm5lciBzaXplPVwiRVhUUkFfU01BTExcIiAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPExvYWRpbmdTcGlubmVyIHNpemU9XCJTTUFMTFwiIC8+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICA8TG9hZGluZ1NwaW5uZXIgc2l6ZT1cIk1FRElVTVwiIC8+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICA8TG9hZGluZ1NwaW5uZXIgc2l6ZT1cIkxBUkdFXCIgLz5cbiAgICA8L0Jsb2NrPlxuICA8L2Rpdj5cbik7XG5cbmV4cG9ydCBjb25zdCBQcm9ncmVzc0luZGljYXRvckV4YW1wbGVzID0ge1xuICBzZWN0aW9uTmFtZTogJ1Byb2dyZXNzIEluZGljYXRvcnMnLFxuICBkZXNjcmlwdGlvbjogJ1Nob3cgdGhhdCB3b3JrIGlzIGJlaW5nIHBlcmZvcm1lZC4gQ29uc2lkZXIgdXNpbmcgb25lIG9mIHRoZXNlIGZvciBhbnkgd29yayA+IDFzLicsXG4gIGV4YW1wbGVzOiBbXG4gICAge1xuICAgICAgdGl0bGU6ICdQcm9ncmVzc0JhcicsXG4gICAgICBjb21wb25lbnQ6IFByb2dyZXNzQmFyRXhhbXBsZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRpdGxlOiAnTG9hZGluZ1NwaW5uZXInLFxuICAgICAgY29tcG9uZW50OiBMb2FkaW5nU3Bpbm5lckV4YW1wbGUsXG4gICAgfSxcbiAgXSxcbn07XG4iXX0=