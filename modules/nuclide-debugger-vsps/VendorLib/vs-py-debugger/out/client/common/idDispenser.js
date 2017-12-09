"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IdDispenser {
    constructor() {
        this._freedInts = [];
        this._curValue = 0;
    }
    Allocate() {
        if (this._freedInts.length > 0) {
            let res = this._freedInts[this._freedInts.length - 1];
            this._freedInts.splice(this._freedInts.length - 1, 1);
            return res;
        }
        else {
            let res = this._curValue++;
            return res;
        }
    }
    Free(id) {
        if (id + 1 === this._curValue) {
            this._curValue--;
        }
        else {
            this._freedInts.push(id);
        }
    }
}
exports.IdDispenser = IdDispenser;
//# sourceMappingURL=idDispenser.js.map