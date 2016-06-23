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

exports.sanitizeNuclideUri = sanitizeNuclideUri;
exports.getOpenFileEditorForRemoteProject = getOpenFileEditorForRemoteProject;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var NUCLIDE_PROTOCOL_PREFIX = 'nuclide:/';
var NUCLIDE_PROTOCOL_PREFIX_LENGTH = NUCLIDE_PROTOCOL_PREFIX.length;

/**
 * Clean a nuclide URI from the prepended absolute path prefixes and fix
 * the broken uri, in the sense that it's nuclide:/server/path/to/dir instead of
 * nuclide://server/path/to/dir because Atom called path.normalize() on the directory uri.
 */

function sanitizeNuclideUri(uri) {
  // Remove the leading absolute path prepended to the file paths
  // between atom reloads.
  var protocolIndex = uri.indexOf(NUCLIDE_PROTOCOL_PREFIX);
  if (protocolIndex > 0) {
    uri = uri.substring(protocolIndex);
  }
  // Add the missing slash, if removed through a path.normalize() call.
  if (uri.startsWith(NUCLIDE_PROTOCOL_PREFIX) && uri[NUCLIDE_PROTOCOL_PREFIX_LENGTH] !== '/' /*protocol missing last slash*/) {

      uri = uri.substring(0, NUCLIDE_PROTOCOL_PREFIX_LENGTH) + '/' + uri.substring(NUCLIDE_PROTOCOL_PREFIX_LENGTH);
    }
  return uri;
}

function* getOpenFileEditorForRemoteProject(connectionConfig) {
  for (var _pane of atom.workspace.getPanes()) {
    var paneItems = _pane.getItems();
    for (var paneItem of paneItems) {
      if (!atom.workspace.isTextEditor(paneItem) || !paneItem.getURI()) {
        // Ignore non-text editors and new editors with empty uris / paths.
        continue;
      }
      var _uri = sanitizeNuclideUri(paneItem.getURI());

      var _default$parse = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parse(_uri);

      var fileHostname = _default$parse.hostname;
      var _filePath = _default$parse.path;

      if (fileHostname === connectionConfig.host) {
        (0, (_assert2 || _assert()).default)(fileHostname);
        yield {
          pane: _pane,
          editor: paneItem,
          uri: _uri,
          filePath: _filePath
        };
      }
    }
  }
}