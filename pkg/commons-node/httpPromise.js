'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fs from 'fs';
import http from 'http';
import https from 'https';
import url from 'url';
import request from 'request';

/**
 * This is not complete: see https://www.npmjs.com/package/request for details.
 */
type RequestOptions = {
  auth?: {
    user: string;
    pass: string;
    sendImmediately?: boolean;
    bearer?: string;
  };

  headers?: {[name: string]: string};

  /** Entity body for PATCH, POST and PUT requests. */
  body?: string;

  /** Use this for application/x-www-form-urlencoded (URL-Encoded Forms). */
  form?: Object;

  /** Use this for multipart/form-data (Multipart Form Uploads). */
  formData?: Object;

  /** Type of HTTP method: 'GET', 'POST', 'PUT', etc. */
  method?: string;

  /** See docs. */
  multipart?: mixed;

  /** See docs. */
  oauth?: mixed;

  /** See docs. */
  preambleCRLF?: boolean;

  /** See docs. */
  postambleCRLF?: boolean;
};

// Although rfc forbids the usage of white space in content type
// (http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.7), it's still
// a common practice to use that so we need to deal with it in regex.
const contentTypeRe = /\s*\w+\/\w+\s*;\s*charset\s*=\s*([^\s]+)\s*/;

function getProtocolModule(urlString: string): any {
  const {protocol} = url.parse(urlString);
  if (protocol === 'http:') {
    return http;
  } else if (protocol === 'https:') {
    return https;
  } else {
    throw Error(`Protocol ${protocol} not supported`);
  }
}

function getResponseBodyCharset(response: any): ?string {
  const contentType = response.headers['content-type'];
  if (!contentType) {
    return null;
  }
  const match = contentTypeRe.exec(contentType);
  return match ? match[1] : null;
}

export default {

  /**
   * Send Http(s) GET request to given url and return the body as string.
   */
  get(urlString: string, headers: ?Object, rejectUnauthorized: bool = true): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      const options: Object = url.parse(urlString);
      if (!options.hostname) {
        reject(new Error(`Unable to determine the domain name of ${urlString}`));
      }
      if (headers) {
        options.headers = headers;
      }
      options.rejectUnauthorized = rejectUnauthorized;
      getProtocolModule(urlString).get(options, response => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(`Bad status ${response.statusCode}`);
        } else {
          const charset = getResponseBodyCharset(response);
          if (charset) {
            response.setEncoding(charset);
          }
          response.on('data', data => { body += data; });
          response.on('end', () => resolve(body));
        }
      }).on('error', reject);
    });
  },

  /**
   * Provides a limited version of `require('request').del()` so we have a basic Promise-based API
   * for making DELETE requests.
   */
  delete(
    uri: string,
    options: RequestOptions,
  ): Promise<{response: http$IncomingMessage; body: string}> {
    return makeRequest(uri, options, 'DELETE');
  },

  /**
   * Provides a limited version of `require('request').get()` so we have a basic Promise-based API
   * for making GET requests.
   *
   * Currently named "doGet" because "get" was created first. We probably want to replace all
   * existing uses of "get", replace them with "doGet()", and then rename "doGet()" to "get()".
   * The implementation of "doGet" is simpler, follows redirects, and has more features than "get".
   *
   * The major downside of using request instead of our hand-rolled implementation is that it has
   * a lot of dependencies of its own.
   */
  doGet(
    uri: string,
    options: RequestOptions,
  ): Promise<{response: http$IncomingMessage; body: string}> {
    return makeRequest(uri, options, 'GET');
  },

  /**
   * Provides a limited version of `require('request').head()` so we have a basic Promise-based API
   * for making HEAD requests.
   */
  head(
    uri: string,
    options: RequestOptions,
  ): Promise<{response: http$IncomingMessage; body: string}> {
    return makeRequest(uri, options, 'HEAD');
  },

  /**
   * Provides a limited version of `require('request').patch()` so we have a basic Promise-based API
   * for making PATCH requests.
   */
  patch(
    uri: string,
    options: RequestOptions,
  ): Promise<{response: http$IncomingMessage; body: string}> {
    return makeRequest(uri, options, 'PATCH');
  },

  /**
   * Provides a limited version of `require('request').post()` so we have a basic Promise-based API
   * for making POST requests.
   */
  post(
    uri: string,
    options: RequestOptions,
  ): Promise<{response: http$IncomingMessage; body: string}> {
    return makeRequest(uri, options, 'POST');
  },

  /**
   * Provides a limited version of `require('request').put()` so we have a basic Promise-based API
   * for making PUT requests.
   */
  put(
    uri: string,
    options: RequestOptions,
  ): Promise<{response: http$IncomingMessage; body: string}> {
    return makeRequest(uri, options, 'PUT');
  },

  /**
   * Send Http(s) GET request to given url and save the body to dest file.
   */
  download(urlString: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      getProtocolModule(urlString).get(urlString, response => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(`Bad status ${response.statusCode}`);
        } else {
          response.on('error', reject);
          response.pipe(file);
          file.on('error', reject);
          file.on('finish', () => file.close(resolve));
        }
      }).on('error', reject);
    });
  },
};

/**
 * Makes a request using the [`request`](https://www.npmjs.com/package/request) module,
 * which follows redirects and takes care of http vs. https by default.
 */
function makeRequest(
  uri: string,
  options: RequestOptions,
  method: string,
): Promise<{response: http$IncomingMessage; body: string}> {
  if (options.method !== method) {
    options = {...options};
    options.method = method;
  }
  return new Promise((resolve, reject) => {
    request(uri, options, (error, response, body) => {
      if (error != null) {
        reject(error);
      } else {
        resolve({response, body});
      }
    });
  });
}
