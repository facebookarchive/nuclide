function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _analytics = require('../../analytics');

var _commons = require('../../commons');

var _constants = require('./constants');

var _logging = require('../../logging');

var _libclang = require('./libclang');

var _libclang2 = _interopRequireDefault(_libclang);

module.exports = {
  selector: _commons.array.from(_constants.GRAMMAR_SET).join(', '),
  inclusionPriority: 1,
  formatEntireFile: function formatEntireFile(editor, range) {
    return (0, _analytics.trackOperationTiming)('nuclide-clang-atom.formatCode', _asyncToGenerator(function* () {
      try {
        return yield _libclang2['default'].formatCode(editor, range);
      } catch (e) {
        (0, _logging.getLogger)().error('Could not run clang-format:', e);
        atom.notifications.addError('Could not run clang-format.<br>Ensure it is installed and in your $PATH.');
        throw e;
      }
    }));
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvZGVGb3JtYXRQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7eUJBV21DLGlCQUFpQjs7dUJBQ2hDLGVBQWU7O3lCQUNULGFBQWE7O3VCQUNmLGVBQWU7O3dCQUVsQixZQUFZOzs7O0FBRWpDLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUUsZUFBTSxJQUFJLHdCQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUM1QyxtQkFBaUIsRUFBRSxDQUFDO0FBQ3BCLGtCQUFnQixFQUFBLDBCQUFDLE1BQXVCLEVBQUUsS0FBaUIsRUFHeEQ7QUFDRCxXQUFPLHFDQUFxQiwrQkFBK0Isb0JBQUUsYUFBWTtBQUN2RSxVQUFJO0FBQ0YsZUFBTyxNQUFNLHNCQUFTLFVBQVUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDakQsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGlDQUFXLENBQUMsS0FBSyxDQUFDLDZCQUE2QixFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3BELFlBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUN6QiwwRUFBMEUsQ0FDM0UsQ0FBQztBQUNGLGNBQU0sQ0FBQyxDQUFDO09BQ1Q7S0FDRixFQUFDLENBQUM7R0FDSjtDQUNGLENBQUMiLCJmaWxlIjoiQ29kZUZvcm1hdFByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHt0cmFja09wZXJhdGlvblRpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtHUkFNTUFSX1NFVH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuXG5pbXBvcnQgbGliY2xhbmcgZnJvbSAnLi9saWJjbGFuZyc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZWxlY3RvcjogYXJyYXkuZnJvbShHUkFNTUFSX1NFVCkuam9pbignLCAnKSxcbiAgaW5jbHVzaW9uUHJpb3JpdHk6IDEsXG4gIGZvcm1hdEVudGlyZUZpbGUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHJhbmdlOiBhdG9tJFJhbmdlKTogUHJvbWlzZTx7XG4gICAgbmV3Q3Vyc29yOiBudW1iZXIsXG4gICAgZm9ybWF0dGVkOiBzdHJpbmcsXG4gIH0+IHtcbiAgICByZXR1cm4gdHJhY2tPcGVyYXRpb25UaW1pbmcoJ251Y2xpZGUtY2xhbmctYXRvbS5mb3JtYXRDb2RlJywgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IGxpYmNsYW5nLmZvcm1hdENvZGUoZWRpdG9yLCByYW5nZSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGdldExvZ2dlcigpLmVycm9yKCdDb3VsZCBub3QgcnVuIGNsYW5nLWZvcm1hdDonLCBlKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICdDb3VsZCBub3QgcnVuIGNsYW5nLWZvcm1hdC48YnI+RW5zdXJlIGl0IGlzIGluc3RhbGxlZCBhbmQgaW4geW91ciAkUEFUSC4nXG4gICAgICAgICk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG59O1xuIl19