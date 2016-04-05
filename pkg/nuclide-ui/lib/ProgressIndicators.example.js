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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb2dyZXNzSW5kaWNhdG9ycy5leGFtcGxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs0QkFXb0IsZ0JBQWdCOztxQkFDaEIsU0FBUzs7MkJBQ0gsZUFBZTs7OEJBQ1osa0JBQWtCOztBQUUvQyxJQUFNLGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQjtTQUN0Qjs7O0lBQ0U7OztNQUNFLGlFQUFlO0tBQ1Q7SUFDUjs7O01BQ0UsOERBQWEsR0FBRyxFQUFFLEdBQUcsQUFBQyxFQUFDLEtBQUssRUFBRSxDQUFDLEFBQUMsR0FBRztLQUM3QjtJQUNSOzs7TUFDRSw4REFBYSxHQUFHLEVBQUUsR0FBRyxBQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUUsQUFBQyxHQUFHO0tBQzlCO0lBQ1I7OztNQUNFLDhEQUFhLEdBQUcsRUFBRSxHQUFHLEFBQUMsRUFBQyxLQUFLLEVBQUUsR0FBRyxBQUFDLEdBQUc7S0FDL0I7R0FDSjtDQUNQLENBQUM7O0FBRUYsSUFBTSxxQkFBcUIsR0FBRyxTQUF4QixxQkFBcUI7U0FDekI7OztJQUNFOzs7TUFDRSxvRUFBZ0IsSUFBSSxFQUFDLGFBQWEsR0FBRztLQUMvQjtJQUNSOzs7TUFDRSxvRUFBZ0IsSUFBSSxFQUFDLE9BQU8sR0FBRztLQUN6QjtJQUNSOzs7TUFDRSxvRUFBZ0IsSUFBSSxFQUFDLFFBQVEsR0FBRztLQUMxQjtJQUNSOzs7TUFDRSxvRUFBZ0IsSUFBSSxFQUFDLE9BQU8sR0FBRztLQUN6QjtHQUNKO0NBQ1AsQ0FBQzs7QUFFSyxJQUFNLHlCQUF5QixHQUFHO0FBQ3ZDLGFBQVcsRUFBRSxxQkFBcUI7QUFDbEMsYUFBVyxFQUFFLG1GQUFtRjtBQUNoRyxVQUFRLEVBQUUsQ0FDUjtBQUNFLFNBQUssRUFBRSxhQUFhO0FBQ3BCLGFBQVMsRUFBRSxrQkFBa0I7R0FDOUIsRUFDRDtBQUNFLFNBQUssRUFBRSxnQkFBZ0I7QUFDdkIsYUFBUyxFQUFFLHFCQUFxQjtHQUNqQyxDQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJQcm9ncmVzc0luZGljYXRvcnMuZXhhbXBsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7QmxvY2t9IGZyb20gJy4vQmxvY2snO1xuaW1wb3J0IHtQcm9ncmVzc0Jhcn0gZnJvbSAnLi9Qcm9ncmVzc0Jhcic7XG5pbXBvcnQge0xvYWRpbmdTcGlubmVyfSBmcm9tICcuL0xvYWRpbmdTcGlubmVyJztcblxuY29uc3QgUHJvZ3Jlc3NCYXJFeGFtcGxlID0gKCk6IFJlYWN0RWxlbWVudCA9PiAoXG4gIDxkaXY+XG4gICAgPEJsb2NrPlxuICAgICAgPFByb2dyZXNzQmFyIC8+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICA8UHJvZ3Jlc3NCYXIgbWF4PXsxMDB9IHZhbHVlPXswfSAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPFByb2dyZXNzQmFyIG1heD17MTAwfSB2YWx1ZT17NTB9IC8+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICA8UHJvZ3Jlc3NCYXIgbWF4PXsxMDB9IHZhbHVlPXsxMDB9IC8+XG4gICAgPC9CbG9jaz5cbiAgPC9kaXY+XG4pO1xuXG5jb25zdCBMb2FkaW5nU3Bpbm5lckV4YW1wbGUgPSAoKTogUmVhY3RFbGVtZW50ID0+IChcbiAgPGRpdj5cbiAgICA8QmxvY2s+XG4gICAgICA8TG9hZGluZ1NwaW5uZXIgc2l6ZT1cIkVYVFJBX1NNQUxMXCIgLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIDxMb2FkaW5nU3Bpbm5lciBzaXplPVwiU01BTExcIiAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPExvYWRpbmdTcGlubmVyIHNpemU9XCJNRURJVU1cIiAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPExvYWRpbmdTcGlubmVyIHNpemU9XCJMQVJHRVwiIC8+XG4gICAgPC9CbG9jaz5cbiAgPC9kaXY+XG4pO1xuXG5leHBvcnQgY29uc3QgUHJvZ3Jlc3NJbmRpY2F0b3JFeGFtcGxlcyA9IHtcbiAgc2VjdGlvbk5hbWU6ICdQcm9ncmVzcyBJbmRpY2F0b3JzJyxcbiAgZGVzY3JpcHRpb246ICdTaG93IHRoYXQgd29yayBpcyBiZWluZyBwZXJmb3JtZWQuIENvbnNpZGVyIHVzaW5nIG9uZSBvZiB0aGVzZSBmb3IgYW55IHdvcmsgPiAxcy4nLFxuICBleGFtcGxlczogW1xuICAgIHtcbiAgICAgIHRpdGxlOiAnUHJvZ3Jlc3NCYXInLFxuICAgICAgY29tcG9uZW50OiBQcm9ncmVzc0JhckV4YW1wbGUsXG4gICAgfSxcbiAgICB7XG4gICAgICB0aXRsZTogJ0xvYWRpbmdTcGlubmVyJyxcbiAgICAgIGNvbXBvbmVudDogTG9hZGluZ1NwaW5uZXJFeGFtcGxlLFxuICAgIH0sXG4gIF0sXG59O1xuIl19