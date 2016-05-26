'use strict';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * THIS IS FILE IS NOT TRANSPILED - USE ELECTRON COMPATIBLE JAVASCRIPT
 */

/* eslint-disable no-var */

require('../../nuclide-node-transpiler');

/**
 * Override XHR.open to allow this page to be located outside the devtools
 * tree, and resources to be selectively mapped back into the devtools tree.
 */
window.XMLHttpRequest.prototype.open = (function(original) {
  const unmappedUrlPrefixes = [
    'nuclide_',
  ];
  return function(method, url, async, user, password) {
    var newUrl;
    for (var i = 0; i < unmappedUrlPrefixes.length; i++) {
      if (url.startsWith(unmappedUrlPrefixes[i]) ||
          url.startsWith('./' + unmappedUrlPrefixes[i])) {
        newUrl = url;
      }
    }
    if (!newUrl) {
      newUrl = '../VendorLib/devtools/front_end/' + url;
    }
    return original.call(this, method, newUrl, async, user, password);
  };
})(window.XMLHttpRequest.prototype.open);

// Originally defined in Runtime.js
window.loadScriptsPromise = (function(original) {
  return function(urls, base) {
    if (base === undefined) {
      // Prevents the path to the current file to be prepended, so that
      // the overwritten XHR.open can properly prepend the new path prefix.
      base = './';
    }
    return original(urls, base);
  };
})(window.loadScriptsPromise);

// WebInspector.SourceMap indirectly needs this in order to load inline source maps.
window.InspectorFrontendHost = {
  loadNetworkResource(url, headers, streamId, callback) {
    const dataPrefix = 'data:application/json;base64,';
    if (url.startsWith(dataPrefix)) {
      const response = window.atob(url.slice(dataPrefix.length));
      window.WebInspector.Streams.streamWrite(streamId, response);
      callback({statusCode: 200});
    } else {
      callback({statusCode: 404});
    }
  },
};

window.Runtime.startApplication('nuclide_inspector');
