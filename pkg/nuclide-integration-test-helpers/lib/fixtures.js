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
  var repo = yield _nuclideTestHelpers.fixtures.copyFixture(fixtureName, _path2['default'].join(__dirname, '../spec'));
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
  var fixturePath = yield _nuclideTestHelpers.fixtures.copyFixture(fixtureName, _path2['default'].join(__dirname, '../spec'));
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

var _nuclideTestHelpers = require('../../nuclide-test-helpers');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function setLocalProject(projectPath) {
  if (Array.isArray(projectPath)) {
    atom.project.setPaths(projectPath);
  } else {
    atom.project.setPaths([projectPath]);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpeHR1cmVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztJQTBCc0Isb0JBQW9CLHFCQUFuQyxXQUFvQyxXQUFtQixFQUFtQjtBQUMvRSxNQUFNLElBQUksR0FBRyxNQUFNLDZCQUFTLFdBQVcsQ0FBQyxXQUFXLEVBQUUsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ3RGLE1BQU0sUUFBUSxHQUFHLGtCQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDL0MsMkJBQVUsd0JBQVcsUUFBUSxDQUFDLGtCQUFnQixRQUFRLHFCQUFrQixDQUFDO0FBQ3pFLHdCQUFTLFFBQVEsRUFBRSxrQkFBSyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDM0MsU0FBTyxzQkFBUyxJQUFJLENBQUMsQ0FBQztDQUN2Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFzQnFCLFdBQVcscUJBQTFCLFdBQTJCLFdBQW1CLEVBQW1CO0FBQ3RFLE1BQU0sV0FBVyxHQUFHLE1BQU0sNkJBQVMsV0FBVyxDQUFDLFdBQVcsRUFBRSxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDN0YsU0FBTyxzQkFBUyxXQUFXLENBQUMsQ0FBQztDQUM5Qjs7Ozs7Ozs7Ozs7Ozs7OztzQkE5Q3FCLFFBQVE7Ozs7c0JBQ2UsU0FBUzs7a0NBQy9CLDRCQUE0Qjs7b0JBQ2xDLE1BQU07Ozs7QUF3QmhCLFNBQVMsZUFBZSxDQUFDLFdBQW1DLEVBQVE7QUFDekUsTUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO0FBQzlCLFFBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQ3BDLE1BQU07QUFDTCxRQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7R0FDdEM7Q0FDRiIsImZpbGUiOiJmaXh0dXJlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7YWJzb2x1dGUsIGV4aXN0c1N5bmMsIG1vdmVTeW5jfSBmcm9tICdmcy1wbHVzJztcbmltcG9ydCB7Zml4dHVyZXN9IGZyb20gJy4uLy4uL251Y2xpZGUtdGVzdC1oZWxwZXJzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vKlxuICogQ29waWVzIGEgc3BlY2lmaWVkIHN1YmRpcmVjdG9yeSBvZiBpbnRlZ3JhdGlvbi10ZXN0LWhlbHBlcnMvc3BlYy9maXh0dXJlcyB0byBhIHRlbXBvcmFyeVxuICogbG9jYXRpb24uICBUaGUgZml4dHVyZU5hbWUgcGFyYW1ldGVyIG11c3QgY29udGFpbiBhIGRpcmVjdG9yeSBuYW1lZCAuaGctcmVuYW1lLiAgQWZ0ZXIgdGhlXG4gKiBkaXJlY3Rvcnkgc3BlY2lmaWVkIGJ5IGZpeHR1cmVOYW1lIGlzIGNvcGllZCwgaXRzIC5oZy1yZW5hbWUgZm9sZGVyIHdpbGwgYmUgcmVuYW1lZCB0byAuaGcsIHNvXG4gKiB0aGF0IGl0IGNhbiBhY3QgYXMgYSBtZXJjdXJpYWwgcmVwb3NpdG9yeS5cbiAqXG4gKiBAcGFyYW0gZml4dHVyZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHN1YmRpcmVjdG9yeSBvZiB0aGUgZml4dHVyZXMvIGRpcmVjdG9yeSB3aXRoaW4gdGhlXG4gKiBudWNsaWRlLXRlc3QtaGVscGVycyBwYWNrYWdlIGRpcmVjdG9yeSB0aGF0IHNob3VsZCBiZSBjb3BpZWQuICBNdXN0IGNvbnRhaW4gYSAuaGctcmVuYW1lIGZvbGRlci5cbiAqIEByZXR1cm5zIHRoZSBwYXRoIHRvIHRoZSB0ZW1wb3JhcnkgZGlyZWN0b3J5IHRoYXQgdGhpcyBmdW5jdGlvbiBjcmVhdGVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29weU1lcmN1cmlhbEZpeHR1cmUoZml4dHVyZU5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHJlcG8gPSBhd2FpdCBmaXh0dXJlcy5jb3B5Rml4dHVyZShmaXh0dXJlTmFtZSwgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3NwZWMnKSk7XG4gIGNvbnN0IHBhdGhUb0hnID0gcGF0aC5qb2luKHJlcG8sICcuaGctcmVuYW1lJyk7XG4gIGludmFyaWFudChleGlzdHNTeW5jKHBhdGhUb0hnKSwgYERpcmVjdG9yeTogJHtwYXRoVG9IZ30gd2FzIG5vdCBmb3VuZC5gKTtcbiAgbW92ZVN5bmMocGF0aFRvSGcsIHBhdGguam9pbihyZXBvLCAnLmhnJykpO1xuICByZXR1cm4gYWJzb2x1dGUocmVwbyk7XG59XG5cbi8qKlxuICogU2V0IHRoZSBwcm9qZWN0LiAgSWYgdGhlcmUgYXJlIG9uZSBvciBtb3JlIHByb2plY3RzIHNldCBwcmV2aW91c2x5LCB0aGlzIHJlcGxhY2VzIHRoZW0gYWxsIHdpdGhcbiAqIHRoZSBvbmUocykgcHJvdmlkZWQgYXMgdGhlIGFyZ3VtZW50IGBwcm9qZWN0UGF0aGAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRMb2NhbFByb2plY3QocHJvamVjdFBhdGg6IHN0cmluZyB8IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkocHJvamVjdFBhdGgpKSB7XG4gICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKHByb2plY3RQYXRoKTtcbiAgfSBlbHNlIHtcbiAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW3Byb2plY3RQYXRoXSk7XG4gIH1cbn1cblxuLypcbiAqIENvcGllcyBhIHNwZWNpZmllZCBzdWJkaXJlY3Rvcnkgb2YgaW50ZWdyYXRpb24tdGVzdC1oZWxwZXJzL3NwZWMvZml4dHVyZXNcbiAqIHRvIGEgdGVtcG9yYXJ5IGxvY2F0aW9uLlxuICpcbiAqIEBwYXJhbSBmaXh0dXJlTmFtZSBUaGUgbmFtZSBvZiB0aGUgc3ViZGlyZWN0b3J5IG9mIHRoZSBmaXh0dXJlcy8gZGlyZWN0b3J5IHdpdGhpbiB0aGVcbiAqIG51Y2xpZGUtdGVzdC1oZWxwZXJzIHBhY2thZ2UgZGlyZWN0b3J5IHRoYXQgc2hvdWxkIGJlIGNvcGllZC5cbiAqIEByZXR1cm5zIHRoZSBwYXRoIHRvIHRoZSB0ZW1wb3JhcnkgZGlyZWN0b3J5IHRoYXQgdGhpcyBmdW5jdGlvbiBjcmVhdGVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29weUZpeHR1cmUoZml4dHVyZU5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IGZpeHR1cmVQYXRoID0gYXdhaXQgZml4dHVyZXMuY29weUZpeHR1cmUoZml4dHVyZU5hbWUsIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9zcGVjJykpO1xuICByZXR1cm4gYWJzb2x1dGUoZml4dHVyZVBhdGgpO1xufVxuIl19