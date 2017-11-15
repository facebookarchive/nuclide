"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Helpers {
    static parseIOMessage(message) {
        if (!Helpers.isValidMessag(message)) {
            return;
        }
        const msg_id = message.parent_header.msg_id;
        if (!msg_id) {
            return;
        }
        let result = Helpers.parseDisplayIOMessage(message);
        if (!result) {
            result = Helpers.parseResultIOMessage(message);
        }
        if (!result) {
            result = Helpers.parseErrorIOMessage(message);
        }
        if (!result) {
            result = Helpers.parseStreamIOMessage(message);
        }
        return result;
    }
    ;
    static isValidMessag(message) {
        if (!message) {
            return false;
        }
        if (!message.content) {
            return false;
        }
        if (message.content.execution_state === 'starting') {
            return false;
        }
        if (!message.parent_header) {
            return false;
        }
        if (typeof message.parent_header.msg_id !== 'string') {
            return false;
        }
        if (typeof message.parent_header.msg_type !== 'string') {
            return false;
        }
        if (!message.header) {
            return false;
        }
        if (typeof message.header.msg_id !== 'string') {
            return false;
        }
        if (typeof message.header.msg_type !== 'string') {
            return false;
        }
        return true;
    }
    ;
    static parseDisplayIOMessage(message) {
        if (message.header.msg_type === 'display_data') {
            return Helpers.parseDataMime(message.content.data);
        }
        return;
    }
    static parseResultIOMessage(message) {
        const msg_type = message.header.msg_type;
        if (msg_type === 'execute_result' || msg_type === 'pyout' || msg_type === 'execution_result') {
            return Helpers.parseDataMime(message.content.data);
        }
        return null;
    }
    static parseDataMime(data) {
        if (!data) {
            return null;
        }
        const mime = Helpers.getMimeType(data);
        if (typeof mime !== 'string') {
            return null;
        }
        let result;
        if (mime === 'text/plain') {
            result = {
                data: {
                    'text/plain': data[mime]
                },
                type: 'text',
                stream: 'pyout'
            };
            result.data['text/plain'] = result.data['text/plain'].trim();
        }
        else {
            result = {
                data: {},
                type: mime,
                stream: 'pyout'
            };
            result.data[mime] = data[mime];
        }
        return result;
    }
    static getMimeType(data) {
        const imageMimes = Object.getOwnPropertyNames(data).filter(mime => {
            return mime.startsWith('image/');
        });
        let mime;
        if (data.hasOwnProperty('text/html')) {
            mime = 'text/html';
        }
        else if (data.hasOwnProperty('image/svg+xml')) {
            mime = 'image/svg+xml';
        }
        else if (!(imageMimes.length === 0)) {
            mime = imageMimes[0];
        }
        else if (data.hasOwnProperty('text/markdown')) {
            mime = 'text/markdown';
        }
        else if (data.hasOwnProperty('application/pdf')) {
            mime = 'application/pdf';
        }
        else if (data.hasOwnProperty('text/latex')) {
            mime = 'text/latex';
        }
        else if (data.hasOwnProperty('application/javascript')) {
            mime = 'application/javascript';
        }
        else if (data.hasOwnProperty('application/json')) {
            mime = 'application/json';
        }
        else if (data.hasOwnProperty('text/plain')) {
            mime = 'text/plain';
        }
        return mime;
    }
    static parseErrorIOMessage(message) {
        const msg_type = message.header.msg_type;
        if (msg_type === 'error' || msg_type === 'pyerr') {
            return Helpers.parseErrorMessage(message);
        }
        return null;
    }
    static parseErrorMessage(message) {
        let errorString;
        const ename = typeof message.content.ename === 'string' ? message.content.ename : '';
        const evalue = typeof message.content.evalue === 'string' ? message.content.evalue : '';
        const errorMessage = ename + ': ' + evalue;
        errorString = errorMessage;
        try {
            errorString = message.content.traceback.join('\n');
        }
        catch (err) {
        }
        return {
            data: {
                'text/plain': errorString,
            },
            message: errorMessage,
            type: 'text',
            stream: 'error'
        };
    }
    static parseStreamIOMessage(message) {
        let result;
        if (message.header.msg_type === 'stream') {
            result = {
                data: {
                    'text/plain': typeof message.content.text === 'string' ? message.content.text : message.content.data
                },
                type: 'text',
                stream: message.content.name
            };
        }
        else if (message.idents === 'stdout' || message.idents === 'stream.stdout' || message.content.name === 'stdout') {
            result = {
                data: {
                    'text/plain': typeof message.content.text === 'string' ? message.content.text : message.content.data
                },
                type: 'text',
                stream: 'stdout'
            };
        }
        else if (message.idents === 'stderr' || message.idents === 'stream.stderr' || message.content.name === 'stderr') {
            result = {
                data: {
                    'text/plain': typeof message.content.text === 'string' ? message.content.text : message.content.data
                },
                type: 'text',
                stream: 'stderr'
            };
        }
        if (result) {
            result.data['text/plain'] = result.data['text/plain'].trim();
        }
        return result;
    }
}
exports.Helpers = Helpers;
//# sourceMappingURL=helpers.js.map