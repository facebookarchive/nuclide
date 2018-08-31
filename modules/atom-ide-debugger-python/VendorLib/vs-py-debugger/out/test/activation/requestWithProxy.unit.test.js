// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const requestWithProxy_1 = require("../../client/activation/requestWithProxy");
suite('Activation - RequestWithProxy', () => {
    test('Supports download via proxy', () => __awaiter(this, void 0, void 0, function* () {
        let proxyValue = 'https://myproxy.net:4242';
        let requestWithProxy = new requestWithProxy_1.RequestWithProxy(proxyValue);
        let opts = requestWithProxy.requestOptions;
        assert.notEqual(opts, undefined, 'Expected to get options back from .getRequestOptions but got undefined');
        assert.equal(opts.proxy, proxyValue, `Expected to see proxy service uri set to "${proxyValue}" but got "${opts.proxy}" instead.`);
        proxyValue = '';
        requestWithProxy = new requestWithProxy_1.RequestWithProxy(proxyValue);
        opts = requestWithProxy.requestOptions;
        assert.equal(opts, undefined, 'Expected to get no options back from .getRequestOptions but got some options anyway!');
    }));
});

//# sourceMappingURL=requestWithProxy.unit.test.js.map
