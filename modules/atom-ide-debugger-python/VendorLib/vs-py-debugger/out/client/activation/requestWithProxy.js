// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
// Simple wrapper for request to allow for the use of a proxy server being
// specified in the request options.
class RequestWithProxy {
    constructor(proxyUri) {
        this.proxyUri = proxyUri;
    }
    get requestOptions() {
        if (this.proxyUri && this.proxyUri.length > 0) {
            return {
                proxy: this.proxyUri
            };
        }
        else {
            return;
        }
    }
    downloadFile(uri) {
        const requestOptions = this.requestOptions;
        return request(uri, requestOptions);
    }
}
exports.RequestWithProxy = RequestWithProxy;

//# sourceMappingURL=requestWithProxy.js.map
