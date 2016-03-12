/*global module:true*/
/*jslint nomen:true*/
/**
 * @module Utility
 */
(function (context, undefined) {
    'use strict';

    var DEFAULT_TRUNCATE_SYMBOL = '...',
        URL_REGEX               = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g; // Simple regexp

    function __appendEllipsis(string, options, content){
        if(content.length === string.length || !options.ellipsis){return content;}
        content += options.ellipsis;
        return content;
    }
    /**
     * Truncate HTML string and keep tag safe.
     *
     * @method truncate
     * @param {String} string string needs to be truncated
     * @param {Number} maxLength length of truncated string
     * @param {Object} options (optional)
     * @param {Boolean} [options.keepImageTag] flag to specify if keep image tag, false by default
     * @param {Boolean|String} [options.ellipsis] omission symbol for truncated string, '...' by default
     * @return {String} truncated string
     */
    function truncate(string, maxLength, options) {
        var content = '',         // truncated text storage
            matches = true,
            remainingLength = maxLength,
            result,
            index;

        options          = options || {};
        options.ellipsis = (typeof options.ellipsis === "undefined") ? DEFAULT_TRUNCATE_SYMBOL : options.ellipsis;

        if(!string || string.length === 0){
            return '';
        }

        matches = true;
        while(matches){
            URL_REGEX.lastIndex = content.length;
            matches = URL_REGEX.exec(string);

            if(!matches || (matches.index - content.length) >= remainingLength){
                content += string.substring(content.length, maxLength);
                return __appendEllipsis(string, options, content, maxLength);
            }

            result  = matches[0];
            index   = matches.index;
            content += string.substring(content.length, index + result.length);
            remainingLength -= index + result.length;

            if(remainingLength <= 0){
                break;
            }
        }

        return __appendEllipsis(string, options, content, maxLength);
    }

    if ('undefined' !== typeof module && module.exports) {
        module.exports = truncate;
    } else {
        context.truncate = truncate;
    }
}(String));
