Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copies a specified subdirectory of integration-test-helpers/spec/fixtures to a temporary
 * location.  The fixtureName parameter must contain a directory named .hg-rename.  After the
 * directory specified by fixtureName is copied, its .hg-rename folder will be renamed to .hg, so
 * that it can act as a mercurial repository.
 *
 * @param fixtureName The name of the subdirectory of the fixtures/ directory within the
 * nuclide-test-helpers package directory that should be copied.  Must contain a .hg-rename folder.
 * @returns the path to the temporary directory that this function creates.
 */

var copyMercurialFixture = _asyncToGenerator(function* (fixtureName) {
  var repo = yield _testHelpers.fixtures.copyFixture(fixtureName, _path2['default'].join(__dirname, '../spec'));
  var pathToHg = _path2['default'].join(repo, '.hg-rename');
  (0, _assert2['default'])((0, _fsPlus.existsSync)(pathToHg), 'Directory: ' + pathToHg + ' was not found.');
  (0, _fsPlus.moveSync)(pathToHg, _path2['default'].join(repo, '.hg'));
  return (0, _fsPlus.absolute)(repo);
}

/**
 * Set the project.  If there are one or more projects set previously, this replaces them all with
 * the one(s) provided as the argument `projectPath`.
 */
);

exports.copyMercurialFixture = copyMercurialFixture;
exports.setLocalProject = setLocalProject;

/*
 * Copies a specified subdirectory of integration-test-helpers/spec/fixtures
 * to a temporary location.
 *
 * @param fixtureName The name of the subdirectory of the fixtures/ directory within the
 * nuclide-test-helpers package directory that should be copied.
 * @returns the path to the temporary directory that this function creates.
 */

var copyFixture = _asyncToGenerator(function* (fixtureName) {
  var fixturePath = yield _testHelpers.fixtures.copyFixture(fixtureName, _path2['default'].join(__dirname, '../spec'));
  return (0, _fsPlus.absolute)(fixturePath);
});

exports.copyFixture = copyFixture;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _fsPlus = require('fs-plus');

var _testHelpers = require('../../test-helpers');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function setLocalProject(projectPath) {
  if (Array.isArray(projectPath)) {
    atom.project.setPaths(projectPath);
  } else {
    atom.project.setPaths([projectPath]);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpeHR1cmVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztJQTBCc0Isb0JBQW9CLHFCQUFuQyxXQUFvQyxXQUFtQixFQUFtQjtBQUMvRSxNQUFNLElBQUksR0FBRyxNQUFNLHNCQUFTLFdBQVcsQ0FBQyxXQUFXLEVBQUUsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ3RGLE1BQU0sUUFBUSxHQUFHLGtCQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDL0MsMkJBQVUsd0JBQVcsUUFBUSxDQUFDLGtCQUFnQixRQUFRLHFCQUFrQixDQUFDO0FBQ3pFLHdCQUFTLFFBQVEsRUFBRSxrQkFBSyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDM0MsU0FBTyxzQkFBUyxJQUFJLENBQUMsQ0FBQztDQUN2Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFzQnFCLFdBQVcscUJBQTFCLFdBQTJCLFdBQW1CLEVBQW1CO0FBQ3RFLE1BQU0sV0FBVyxHQUFHLE1BQU0sc0JBQVMsV0FBVyxDQUFDLFdBQVcsRUFBRSxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDN0YsU0FBTyxzQkFBUyxXQUFXLENBQUMsQ0FBQztDQUM5Qjs7Ozs7Ozs7Ozs7Ozs7OztzQkE5Q3FCLFFBQVE7Ozs7c0JBQ2UsU0FBUzs7MkJBQy9CLG9CQUFvQjs7b0JBQzFCLE1BQU07Ozs7QUF3QmhCLFNBQVMsZUFBZSxDQUFDLFdBQW1DLEVBQVE7QUFDekUsTUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO0FBQzlCLFFBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQ3BDLE1BQU07QUFDTCxRQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7R0FDdEM7Q0FDRiIsImZpbGUiOiJmaXh0dXJlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7YWJzb2x1dGUsIGV4aXN0c1N5bmMsIG1vdmVTeW5jfSBmcm9tICdmcy1wbHVzJztcbmltcG9ydCB7Zml4dHVyZXN9IGZyb20gJy4uLy4uL3Rlc3QtaGVscGVycyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuLypcbiAqIENvcGllcyBhIHNwZWNpZmllZCBzdWJkaXJlY3Rvcnkgb2YgaW50ZWdyYXRpb24tdGVzdC1oZWxwZXJzL3NwZWMvZml4dHVyZXMgdG8gYSB0ZW1wb3JhcnlcbiAqIGxvY2F0aW9uLiAgVGhlIGZpeHR1cmVOYW1lIHBhcmFtZXRlciBtdXN0IGNvbnRhaW4gYSBkaXJlY3RvcnkgbmFtZWQgLmhnLXJlbmFtZS4gIEFmdGVyIHRoZVxuICogZGlyZWN0b3J5IHNwZWNpZmllZCBieSBmaXh0dXJlTmFtZSBpcyBjb3BpZWQsIGl0cyAuaGctcmVuYW1lIGZvbGRlciB3aWxsIGJlIHJlbmFtZWQgdG8gLmhnLCBzb1xuICogdGhhdCBpdCBjYW4gYWN0IGFzIGEgbWVyY3VyaWFsIHJlcG9zaXRvcnkuXG4gKlxuICogQHBhcmFtIGZpeHR1cmVOYW1lIFRoZSBuYW1lIG9mIHRoZSBzdWJkaXJlY3Rvcnkgb2YgdGhlIGZpeHR1cmVzLyBkaXJlY3Rvcnkgd2l0aGluIHRoZVxuICogbnVjbGlkZS10ZXN0LWhlbHBlcnMgcGFja2FnZSBkaXJlY3RvcnkgdGhhdCBzaG91bGQgYmUgY29waWVkLiAgTXVzdCBjb250YWluIGEgLmhnLXJlbmFtZSBmb2xkZXIuXG4gKiBAcmV0dXJucyB0aGUgcGF0aCB0byB0aGUgdGVtcG9yYXJ5IGRpcmVjdG9yeSB0aGF0IHRoaXMgZnVuY3Rpb24gY3JlYXRlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvcHlNZXJjdXJpYWxGaXh0dXJlKGZpeHR1cmVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCByZXBvID0gYXdhaXQgZml4dHVyZXMuY29weUZpeHR1cmUoZml4dHVyZU5hbWUsIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9zcGVjJykpO1xuICBjb25zdCBwYXRoVG9IZyA9IHBhdGguam9pbihyZXBvLCAnLmhnLXJlbmFtZScpO1xuICBpbnZhcmlhbnQoZXhpc3RzU3luYyhwYXRoVG9IZyksIGBEaXJlY3Rvcnk6ICR7cGF0aFRvSGd9IHdhcyBub3QgZm91bmQuYCk7XG4gIG1vdmVTeW5jKHBhdGhUb0hnLCBwYXRoLmpvaW4ocmVwbywgJy5oZycpKTtcbiAgcmV0dXJuIGFic29sdXRlKHJlcG8pO1xufVxuXG4vKipcbiAqIFNldCB0aGUgcHJvamVjdC4gIElmIHRoZXJlIGFyZSBvbmUgb3IgbW9yZSBwcm9qZWN0cyBzZXQgcHJldmlvdXNseSwgdGhpcyByZXBsYWNlcyB0aGVtIGFsbCB3aXRoXG4gKiB0aGUgb25lKHMpIHByb3ZpZGVkIGFzIHRoZSBhcmd1bWVudCBgcHJvamVjdFBhdGhgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0TG9jYWxQcm9qZWN0KHByb2plY3RQYXRoOiBzdHJpbmcgfCBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gIGlmIChBcnJheS5pc0FycmF5KHByb2plY3RQYXRoKSkge1xuICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhwcm9qZWN0UGF0aCk7XG4gIH0gZWxzZSB7XG4gICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtwcm9qZWN0UGF0aF0pO1xuICB9XG59XG5cbi8qXG4gKiBDb3BpZXMgYSBzcGVjaWZpZWQgc3ViZGlyZWN0b3J5IG9mIGludGVncmF0aW9uLXRlc3QtaGVscGVycy9zcGVjL2ZpeHR1cmVzXG4gKiB0byBhIHRlbXBvcmFyeSBsb2NhdGlvbi5cbiAqXG4gKiBAcGFyYW0gZml4dHVyZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHN1YmRpcmVjdG9yeSBvZiB0aGUgZml4dHVyZXMvIGRpcmVjdG9yeSB3aXRoaW4gdGhlXG4gKiBudWNsaWRlLXRlc3QtaGVscGVycyBwYWNrYWdlIGRpcmVjdG9yeSB0aGF0IHNob3VsZCBiZSBjb3BpZWQuXG4gKiBAcmV0dXJucyB0aGUgcGF0aCB0byB0aGUgdGVtcG9yYXJ5IGRpcmVjdG9yeSB0aGF0IHRoaXMgZnVuY3Rpb24gY3JlYXRlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvcHlGaXh0dXJlKGZpeHR1cmVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBmaXh0dXJlUGF0aCA9IGF3YWl0IGZpeHR1cmVzLmNvcHlGaXh0dXJlKGZpeHR1cmVOYW1lLCBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vc3BlYycpKTtcbiAgcmV0dXJuIGFic29sdXRlKGZpeHR1cmVQYXRoKTtcbn1cbiJdfQ==