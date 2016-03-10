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
    return item instanceof _atom.TextEditor;
  }
}

function createTextEditor(textEditorParams) {
  // Note that atom.workspace.buildTextEditor was introduced after the release of Atom 1.0.19.
  // As of this change, calling the constructor of TextEditor directly is deprecated. Therefore,
  // we must choose the appropriate code path based on which API is available.
  if (atom.workspace.buildTextEditor) {
    return atom.workspace.buildTextEditor(textEditorParams);
  } else {
    return new _atom.TextEditor(textEditorParams);
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
//# sourceMappingURL=data:application/json;base64,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OiJ0ZXh0LWVkaXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtUZXh0QnVmZmVyLCBUZXh0RWRpdG9yfSBmcm9tICdhdG9tJztcbi8vIFRPRE8obW9zdCk6IG1vdmUgdG8gcmVtb3RlLWNvbm5lY3Rpb24vbGliL1JlbW90ZVRleHRCdWZmZXIuanNcbmltcG9ydCBOdWNsaWRlVGV4dEJ1ZmZlciBmcm9tICcuLi8uLi9yZW1vdGUtcHJvamVjdHMvbGliL051Y2xpZGVUZXh0QnVmZmVyJztcbmltcG9ydCB7aXNMb2NhbH0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzVGV4dEVkaXRvcihpdGVtOiA/YW55KTogYm9vbGVhbiB7XG4gIGlmIChpdGVtID09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIElmIGJ1aWxkVGV4dEVkaXRvciBpcyBwcmVzZW50LCB0aGVuIGFjY2Vzc2luZyB0aGUgVGV4dEVkaXRvciBjb25zdHJ1Y3RvciB3aWxsIHRyaWdnZXIgYVxuICAgIC8vIGRlcHJlY2F0aW9uIHdhcm5pbmcuIEF0b20gcmVjb21tZW5kcyB0ZXN0aW5nIGZvciB0aGUgZXhpc3RlbmNlIG9mIHRoZSBwdWJsaWMgbWV0aG9kIG9mXG4gICAgLy8gVGV4dEVkaXRvciB0aGF0IHlvdSBhcmUgdXNpbmcgYXMgYSBwcm94eSBmb3Igd2hldGhlciB0aGUgb2JqZWN0IGlzIGEgVGV4dEVkaXRvcjpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2NvbW1pdC80ZDJkNGMzLiBUaGlzIGlzIGEgZmFpcmx5IHdlYWsgaGV1cmlzdGljLCBzbyB3ZSB0ZXN0XG4gICAgLy8gZm9yIGEgbGFyZ2VyIHNldCBvZiBtZXRob2RzIHRoYXQgYXJlIG1vcmUgbGlrZWx5IHVuaXF1ZSB0byBUZXh0RWRpdG9yIGFzIGEgYmV0dGVyIGhldXJpc3RpYzpcbiAgICByZXR1cm4gdHlwZW9mIGl0ZW0uc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbiA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgdHlwZW9mIGl0ZW0uc2NhbkluQnVmZmVyUmFuZ2UgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIHR5cGVvZiBpdGVtLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uID09PSAnZnVuY3Rpb24nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBpdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvcjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGV4dEVkaXRvcih0ZXh0RWRpdG9yUGFyYW1zOiBhdG9tJFRleHRFZGl0b3JQYXJhbXMpOiBUZXh0RWRpdG9yIHtcbiAgLy8gTm90ZSB0aGF0IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvciB3YXMgaW50cm9kdWNlZCBhZnRlciB0aGUgcmVsZWFzZSBvZiBBdG9tIDEuMC4xOS5cbiAgLy8gQXMgb2YgdGhpcyBjaGFuZ2UsIGNhbGxpbmcgdGhlIGNvbnN0cnVjdG9yIG9mIFRleHRFZGl0b3IgZGlyZWN0bHkgaXMgZGVwcmVjYXRlZC4gVGhlcmVmb3JlLFxuICAvLyB3ZSBtdXN0IGNob29zZSB0aGUgYXBwcm9wcmlhdGUgY29kZSBwYXRoIGJhc2VkIG9uIHdoaWNoIEFQSSBpcyBhdmFpbGFibGUuXG4gIGlmIChhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IpIHtcbiAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKHRleHRFZGl0b3JQYXJhbXMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgVGV4dEVkaXRvcih0ZXh0RWRpdG9yUGFyYW1zKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSB0ZXh0IGVkaXRvciB0aGF0IGhhcyB0aGUgZ2l2ZW4gcGF0aCBvcGVuLCBvciBudWxsIGlmIG5vbmUgZXhpc3RzLiBJZiB0aGVyZSBhcmUgbXVsdGlwbGVcbiAqIHRleHQgZWRpdG9ycyBmb3IgdGhpcyBwYXRoLCBvbmUgaXMgY2hvc2VuIGFyYml0cmFyaWx5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhpc3RpbmdFZGl0b3JGb3JVcmkocGF0aDogTnVjbGlkZVVyaSk6ID9hdG9tJFRleHRFZGl0b3Ige1xuICAvLyBUaGlzIGlzbid0IGlkZWFsIGJ1dCByZWFsaXN0aWNhbGx5IGl0ZXJhdGluZyB0aHJvdWdoIGV2ZW4gYSBmZXcgaHVuZHJlZCBlZGl0b3JzIHNob3VsZG4ndCBiZSBhXG4gIC8vIHJlYWwgcHJvYmxlbS4gQW5kIGlmIHlvdSBoYXZlIG1vcmUgdGhhbiBhIGZldyBodW5kcmVkIHlvdSBwcm9iYWJseSBoYXZlIGJpZ2dlciBwcm9ibGVtcy5cbiAgZm9yIChjb25zdCBlZGl0b3Igb2YgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKSkge1xuICAgIGlmIChlZGl0b3IuZ2V0UGF0aCgpID09PSBwYXRoKSB7XG4gICAgICByZXR1cm4gZWRpdG9yO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZEJ1ZmZlckZvclVyaSh1cmk6IE51Y2xpZGVVcmkpOiBQcm9taXNlPGF0b20kVGV4dEJ1ZmZlcj4ge1xuICBjb25zdCBidWZmZXIgPSBidWZmZXJGb3JVcmkodXJpKTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBidWZmZXIubG9hZCgpO1xuICAgIHJldHVybiBidWZmZXI7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYXRvbS5wcm9qZWN0LnJlbW92ZUJ1ZmZlcihidWZmZXIpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBleGlzdGluZyBidWZmZXIgZm9yIHRoYXQgdXJpLCBvciBjcmVhdGUgb25lIGlmIG5vdCBleGlzdGluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlckZvclVyaSh1cmk6IE51Y2xpZGVVcmkpOiBhdG9tJFRleHRCdWZmZXIge1xuICBsZXQgYnVmZmVyID0gZXhpc3RpbmdCdWZmZXJGb3JVcmkodXJpKTtcbiAgaWYgKGJ1ZmZlciAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuICBpZiAoaXNMb2NhbCh1cmkpKSB7XG4gICAgYnVmZmVyID0gbmV3IFRleHRCdWZmZXIoe2ZpbGVQYXRoOiB1cml9KTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBjb25uZWN0aW9uID0gUmVtb3RlQ29ubmVjdGlvbi5nZXRGb3JVcmkodXJpKTtcbiAgICBpZiAoY29ubmVjdGlvbiA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlbW90ZUNvbm5lY3Rpb24gY2Fubm90IGJlIGZvdW5kIGZvciB1cmk6ICR7dXJpfWApO1xuICAgIH1cbiAgICBidWZmZXIgPSBuZXcgTnVjbGlkZVRleHRCdWZmZXIoY29ubmVjdGlvbiwge2ZpbGVQYXRoOiB1cml9KTtcbiAgfVxuICBhdG9tLnByb2plY3QuYWRkQnVmZmVyKGJ1ZmZlcik7XG4gIGludmFyaWFudChidWZmZXIpO1xuICByZXR1cm4gYnVmZmVyO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gZXhzdGluZyBidWZmZXIgZm9yIHRoYXQgdXJpLCBvciBudWxsIGlmIG5vdCBleGlzdGluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4aXN0aW5nQnVmZmVyRm9yVXJpKHVyaTogTnVjbGlkZVVyaSk6ID9hdG9tJFRleHRCdWZmZXIge1xuICByZXR1cm4gYXRvbS5wcm9qZWN0LmZpbmRCdWZmZXJGb3JQYXRoKHVyaSk7XG59XG4iXX0=