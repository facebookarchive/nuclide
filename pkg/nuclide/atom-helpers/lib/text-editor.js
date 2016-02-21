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

exports.isTextEditor = isTextEditor;
exports.createTextEditor = createTextEditor;
exports.existingEditorForUri = existingEditorForUri;

var loadBufferForUri = _asyncToGenerator(function* (uri) {
  var buffer = bufferForUri(uri);
  try {
    yield buffer.load();
    return buffer;
  } catch (error) {
    atom.project.removeBuffer(buffer);
    throw error;
  }
}

/**
 * Returns an existing buffer for that uri, or create one if not existing.
 */
);

exports.loadBufferForUri = loadBufferForUri;
exports.bufferForUri = bufferForUri;
exports.existingBufferForUri = existingBufferForUri;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

// TODO(most): move to remote-connection/lib/RemoteTextBuffer.js

var _remoteProjectsLibNuclideTextBuffer = require('../../remote-projects/lib/NuclideTextBuffer');

var _remoteProjectsLibNuclideTextBuffer2 = _interopRequireDefault(_remoteProjectsLibNuclideTextBuffer);

var _remoteUri = require('../../remote-uri');

var _remoteConnection = require('../../remote-connection');

function isTextEditor(item) {
  if (item == null) {
    return false;
  } else if (typeof atom.workspace.buildTextEditor === 'function') {
    // If buildTextEditor is present, then accessing the TextEditor constructor will trigger a
    // deprecation warning. Atom recommends testing for the existence of the public method of
    // TextEditor that you are using as a proxy for whether the object is a TextEditor:
    // https://github.com/atom/atom/commit/4d2d4c3. This is a fairly weak heuristic, so we test
    // for a larger set of methods that are more likely unique to TextEditor as a better heuristic:
    return typeof item.screenPositionForBufferPosition === 'function' && typeof item.scanInBufferRange === 'function' && typeof item.scopeDescriptorForBufferPosition === 'function';
  } else {
    var _require = require('atom');

    var _TextEditor = _require.TextEditor;

    return item instanceof _TextEditor;
  }
}

function createTextEditor(textEditorParams) {
  // Note that atom.workspace.buildTextEditor was introduced after the release of Atom 1.0.19.
  // As of this change, calling the constructor of TextEditor directly is deprecated. Therefore,
  // we must choose the appropriate code path based on which API is available.
  if (atom.workspace.buildTextEditor) {
    return atom.workspace.buildTextEditor(textEditorParams);
  } else {
    var _require2 = require('atom');

    var _TextEditor2 = _require2.TextEditor;

    return new _TextEditor2(textEditorParams);
  }
}

/**
 * Returns a text editor that has the given path open, or null if none exists. If there are multiple
 * text editors for this path, one is chosen arbitrarily.
 */

function existingEditorForUri(path) {
  // This isn't ideal but realistically iterating through even a few hundred editors shouldn't be a
  // real problem. And if you have more than a few hundred you probably have bigger problems.
  for (var editor of atom.workspace.getTextEditors()) {
    if (editor.getPath() === path) {
      return editor;
    }
  }

  return null;
}

function bufferForUri(uri) {
  var buffer = existingBufferForUri(uri);
  if (buffer != null) {
    return buffer;
  }
  if ((0, _remoteUri.isLocal)(uri)) {
    buffer = new _atom.TextBuffer({ filePath: uri });
  } else {
    var connection = _remoteConnection.RemoteConnection.getForUri(uri);
    if (connection == null) {
      throw new Error('RemoteConnection cannot be found for uri: ' + uri);
    }
    buffer = new _remoteProjectsLibNuclideTextBuffer2['default'](connection, { filePath: uri });
  }
  atom.project.addBuffer(buffer);
  (0, _assert2['default'])(buffer);
  return buffer;
}

/**
 * Returns an exsting buffer for that uri, or null if not existing.
 */

function existingBufferForUri(uri) {
  return atom.project.findBufferForPath(uri);
}
//# sourceMappingURL=data:application/json;base64,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Q0FDZjs7Ozs7O0FBS00sU0FBUyxvQkFBb0IsQ0FBQyxHQUFlLEVBQW9CO0FBQ3RFLFNBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUM1QyIsImZpbGUiOiJ0ZXh0LWVkaXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtUZXh0QnVmZmVyfSBmcm9tICdhdG9tJztcbi8vIFRPRE8obW9zdCk6IG1vdmUgdG8gcmVtb3RlLWNvbm5lY3Rpb24vbGliL1JlbW90ZVRleHRCdWZmZXIuanNcbmltcG9ydCBOdWNsaWRlVGV4dEJ1ZmZlciBmcm9tICcuLi8uLi9yZW1vdGUtcHJvamVjdHMvbGliL051Y2xpZGVUZXh0QnVmZmVyJztcbmltcG9ydCB7aXNMb2NhbH0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzVGV4dEVkaXRvcihpdGVtOiA/YW55KTogYm9vbGVhbiB7XG4gIGlmIChpdGVtID09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIElmIGJ1aWxkVGV4dEVkaXRvciBpcyBwcmVzZW50LCB0aGVuIGFjY2Vzc2luZyB0aGUgVGV4dEVkaXRvciBjb25zdHJ1Y3RvciB3aWxsIHRyaWdnZXIgYVxuICAgIC8vIGRlcHJlY2F0aW9uIHdhcm5pbmcuIEF0b20gcmVjb21tZW5kcyB0ZXN0aW5nIGZvciB0aGUgZXhpc3RlbmNlIG9mIHRoZSBwdWJsaWMgbWV0aG9kIG9mXG4gICAgLy8gVGV4dEVkaXRvciB0aGF0IHlvdSBhcmUgdXNpbmcgYXMgYSBwcm94eSBmb3Igd2hldGhlciB0aGUgb2JqZWN0IGlzIGEgVGV4dEVkaXRvcjpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2NvbW1pdC80ZDJkNGMzLiBUaGlzIGlzIGEgZmFpcmx5IHdlYWsgaGV1cmlzdGljLCBzbyB3ZSB0ZXN0XG4gICAgLy8gZm9yIGEgbGFyZ2VyIHNldCBvZiBtZXRob2RzIHRoYXQgYXJlIG1vcmUgbGlrZWx5IHVuaXF1ZSB0byBUZXh0RWRpdG9yIGFzIGEgYmV0dGVyIGhldXJpc3RpYzpcbiAgICByZXR1cm4gdHlwZW9mIGl0ZW0uc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbiA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgdHlwZW9mIGl0ZW0uc2NhbkluQnVmZmVyUmFuZ2UgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIHR5cGVvZiBpdGVtLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uID09PSAnZnVuY3Rpb24nO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHtUZXh0RWRpdG9yfSA9IHJlcXVpcmUoJ2F0b20nKTtcbiAgICByZXR1cm4gaXRlbSBpbnN0YW5jZW9mIFRleHRFZGl0b3I7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRleHRFZGl0b3IodGV4dEVkaXRvclBhcmFtczogYXRvbSRUZXh0RWRpdG9yUGFyYW1zKTogVGV4dEVkaXRvciB7XG4gIC8vIE5vdGUgdGhhdCBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3Igd2FzIGludHJvZHVjZWQgYWZ0ZXIgdGhlIHJlbGVhc2Ugb2YgQXRvbSAxLjAuMTkuXG4gIC8vIEFzIG9mIHRoaXMgY2hhbmdlLCBjYWxsaW5nIHRoZSBjb25zdHJ1Y3RvciBvZiBUZXh0RWRpdG9yIGRpcmVjdGx5IGlzIGRlcHJlY2F0ZWQuIFRoZXJlZm9yZSxcbiAgLy8gd2UgbXVzdCBjaG9vc2UgdGhlIGFwcHJvcHJpYXRlIGNvZGUgcGF0aCBiYXNlZCBvbiB3aGljaCBBUEkgaXMgYXZhaWxhYmxlLlxuICBpZiAoYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKSB7XG4gICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih0ZXh0RWRpdG9yUGFyYW1zKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCB7VGV4dEVkaXRvcn0gPSByZXF1aXJlKCdhdG9tJyk7XG4gICAgcmV0dXJuIG5ldyBUZXh0RWRpdG9yKHRleHRFZGl0b3JQYXJhbXMpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHRleHQgZWRpdG9yIHRoYXQgaGFzIHRoZSBnaXZlbiBwYXRoIG9wZW4sIG9yIG51bGwgaWYgbm9uZSBleGlzdHMuIElmIHRoZXJlIGFyZSBtdWx0aXBsZVxuICogdGV4dCBlZGl0b3JzIGZvciB0aGlzIHBhdGgsIG9uZSBpcyBjaG9zZW4gYXJiaXRyYXJpbHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGlzdGluZ0VkaXRvckZvclVyaShwYXRoOiBOdWNsaWRlVXJpKTogP2F0b20kVGV4dEVkaXRvciB7XG4gIC8vIFRoaXMgaXNuJ3QgaWRlYWwgYnV0IHJlYWxpc3RpY2FsbHkgaXRlcmF0aW5nIHRocm91Z2ggZXZlbiBhIGZldyBodW5kcmVkIGVkaXRvcnMgc2hvdWxkbid0IGJlIGFcbiAgLy8gcmVhbCBwcm9ibGVtLiBBbmQgaWYgeW91IGhhdmUgbW9yZSB0aGFuIGEgZmV3IGh1bmRyZWQgeW91IHByb2JhYmx5IGhhdmUgYmlnZ2VyIHByb2JsZW1zLlxuICBmb3IgKGNvbnN0IGVkaXRvciBvZiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpKSB7XG4gICAgaWYgKGVkaXRvci5nZXRQYXRoKCkgPT09IHBhdGgpIHtcbiAgICAgIHJldHVybiBlZGl0b3I7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkQnVmZmVyRm9yVXJpKHVyaTogTnVjbGlkZVVyaSk6IFByb21pc2U8YXRvbSRUZXh0QnVmZmVyPiB7XG4gIGNvbnN0IGJ1ZmZlciA9IGJ1ZmZlckZvclVyaSh1cmkpO1xuICB0cnkge1xuICAgIGF3YWl0IGJ1ZmZlci5sb2FkKCk7XG4gICAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBhdG9tLnByb2plY3QucmVtb3ZlQnVmZmVyKGJ1ZmZlcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGV4aXN0aW5nIGJ1ZmZlciBmb3IgdGhhdCB1cmksIG9yIGNyZWF0ZSBvbmUgaWYgbm90IGV4aXN0aW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVmZmVyRm9yVXJpKHVyaTogTnVjbGlkZVVyaSk6IGF0b20kVGV4dEJ1ZmZlciB7XG4gIGxldCBidWZmZXIgPSBleGlzdGluZ0J1ZmZlckZvclVyaSh1cmkpO1xuICBpZiAoYnVmZmVyICE9IG51bGwpIHtcbiAgICByZXR1cm4gYnVmZmVyO1xuICB9XG4gIGlmIChpc0xvY2FsKHVyaSkpIHtcbiAgICBidWZmZXIgPSBuZXcgVGV4dEJ1ZmZlcih7ZmlsZVBhdGg6IHVyaX0pO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBSZW1vdGVDb25uZWN0aW9uLmdldEZvclVyaSh1cmkpO1xuICAgIGlmIChjb25uZWN0aW9uID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUmVtb3RlQ29ubmVjdGlvbiBjYW5ub3QgYmUgZm91bmQgZm9yIHVyaTogJHt1cml9YCk7XG4gICAgfVxuICAgIGJ1ZmZlciA9IG5ldyBOdWNsaWRlVGV4dEJ1ZmZlcihjb25uZWN0aW9uLCB7ZmlsZVBhdGg6IHVyaX0pO1xuICB9XG4gIGF0b20ucHJvamVjdC5hZGRCdWZmZXIoYnVmZmVyKTtcbiAgaW52YXJpYW50KGJ1ZmZlcik7XG4gIHJldHVybiBidWZmZXI7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBleHN0aW5nIGJ1ZmZlciBmb3IgdGhhdCB1cmksIG9yIG51bGwgaWYgbm90IGV4aXN0aW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhpc3RpbmdCdWZmZXJGb3JVcmkodXJpOiBOdWNsaWRlVXJpKTogP2F0b20kVGV4dEJ1ZmZlciB7XG4gIHJldHVybiBhdG9tLnByb2plY3QuZmluZEJ1ZmZlckZvclBhdGgodXJpKTtcbn1cbiJdfQ==