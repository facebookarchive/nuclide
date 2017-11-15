"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EnumEx {
    static getNamesAndValues(e) {
        return EnumEx.getNames(e).map(n => ({ name: n, value: e[n] }));
    }
    static getNames(e) {
        return EnumEx.getObjValues(e).filter(v => typeof v === "string");
    }
    static getValues(e) {
        return EnumEx.getObjValues(e).filter(v => typeof v === "number");
    }
    static getObjValues(e) {
        return Object.keys(e).map(k => e[k]);
    }
}
exports.EnumEx = EnumEx;
//# sourceMappingURL=enumUtils.js.map