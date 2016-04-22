function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideAnalytics = require('../../nuclide-analytics');

var _constants = require('./constants');

var _nuclideLogging = require('../../nuclide-logging');

var _libclang = require('./libclang');

var _libclang2 = _interopRequireDefault(_libclang);

module.exports = {
  selector: Array.from(_constants.GRAMMAR_SET).join(', '),
  inclusionPriority: 1,
  formatEntireFile: function formatEntireFile(editor, range) {
    return (0, _nuclideAnalytics.trackOperationTiming)('nuclide-clang-atom.formatCode', _asyncToGenerator(function* () {
      try {
        return yield _libclang2['default'].formatCode(editor, range);
      } catch (e) {
        (0, _nuclideLogging.getLogger)().error('Could not run clang-format:', e);
        atom.notifications.addError('Could not run clang-format.<br>Ensure it is installed and in your $PATH.');
        throw e;
      }
    }));
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvZGVGb3JtYXRQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Z0NBV21DLHlCQUF5Qjs7eUJBQ2xDLGFBQWE7OzhCQUNmLHVCQUF1Qjs7d0JBRTFCLFlBQVk7Ozs7QUFFakMsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFVBQVEsRUFBRSxLQUFLLENBQUMsSUFBSSx3QkFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDNUMsbUJBQWlCLEVBQUUsQ0FBQztBQUNwQixrQkFBZ0IsRUFBQSwwQkFBQyxNQUF1QixFQUFFLEtBQWlCLEVBR3hEO0FBQ0QsV0FBTyw0Q0FBcUIsK0JBQStCLG9CQUFFLGFBQVk7QUFDdkUsVUFBSTtBQUNGLGVBQU8sTUFBTSxzQkFBUyxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQ2pELENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVix3Q0FBVyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNwRCxZQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsMEVBQTBFLENBQzNFLENBQUM7QUFDRixjQUFNLENBQUMsQ0FBQztPQUNUO0tBQ0YsRUFBQyxDQUFDO0dBQ0o7Q0FDRixDQUFDIiwiZmlsZSI6IkNvZGVGb3JtYXRQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7R1JBTU1BUl9TRVR9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuXG5pbXBvcnQgbGliY2xhbmcgZnJvbSAnLi9saWJjbGFuZyc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZWxlY3RvcjogQXJyYXkuZnJvbShHUkFNTUFSX1NFVCkuam9pbignLCAnKSxcbiAgaW5jbHVzaW9uUHJpb3JpdHk6IDEsXG4gIGZvcm1hdEVudGlyZUZpbGUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHJhbmdlOiBhdG9tJFJhbmdlKTogUHJvbWlzZTx7XG4gICAgbmV3Q3Vyc29yOiBudW1iZXI7XG4gICAgZm9ybWF0dGVkOiBzdHJpbmc7XG4gIH0+IHtcbiAgICByZXR1cm4gdHJhY2tPcGVyYXRpb25UaW1pbmcoJ251Y2xpZGUtY2xhbmctYXRvbS5mb3JtYXRDb2RlJywgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IGxpYmNsYW5nLmZvcm1hdENvZGUoZWRpdG9yLCByYW5nZSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGdldExvZ2dlcigpLmVycm9yKCdDb3VsZCBub3QgcnVuIGNsYW5nLWZvcm1hdDonLCBlKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICdDb3VsZCBub3QgcnVuIGNsYW5nLWZvcm1hdC48YnI+RW5zdXJlIGl0IGlzIGluc3RhbGxlZCBhbmQgaW4geW91ciAkUEFUSC4nXG4gICAgICAgICk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG59O1xuIl19