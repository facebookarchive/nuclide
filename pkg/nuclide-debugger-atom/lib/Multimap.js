var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// TODO: pull this into nuclide-commons.

var Multimap = (function () {
  function Multimap() {
    _classCallCheck(this, Multimap);

    this._storage = new Map();
  }

  _createClass(Multimap, [{
    key: 'has',
    value: function has(key) {
      return this._storage.has(key);
    }
  }, {
    key: 'hasEntry',
    value: function hasEntry(key, value) {
      var values = this._storage.get(key);
      if (values) {
        return values.has(value);
      }
      return false;
    }
  }, {
    key: 'get',
    value: function get(key) {
      var set = this._storage.get(key);
      return new Set(set) || new Set();
    }
  }, {
    key: 'delete',
    value: function _delete(key, value) {
      var set = this._storage.get(key);
      if (set) {
        var deleted = set['delete'](value);
        if (set.size === 0) {
          this._storage['delete'](key);
        }
        return deleted;
      }
      return false;
    }
  }, {
    key: 'deleteAll',
    value: function deleteAll(key) {
      return this._storage['delete'](key);
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      var set = this._storage.get(key);
      if (set) {
        set.add(value);
      } else {
        this._storage.set(key, new Set([value]));
      }
      return this;
    }
  }, {
    key: 'forEach',
    value: function forEach(callback) {
      var _this = this;

      this._storage.forEach(function (values, key) {
        return values.forEach(function (value) {
          return callback(value, key, _this);
        });
      });
    }
  }]);

  return Multimap;
})();

module.exports = Multimap;

/**
 * Invariant: the Set values are never empty.
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk11bHRpbWFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0lBWU0sUUFBUTtBQU1ELFdBTlAsUUFBUSxHQU1FOzBCQU5WLFFBQVE7O0FBT1YsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0dBQzNCOztlQVJHLFFBQVE7O1dBVVQsYUFBQyxHQUFNLEVBQVc7QUFDbkIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUMvQjs7O1dBRU8sa0JBQUMsR0FBTSxFQUFFLEtBQVEsRUFBVztBQUNsQyxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxVQUFJLE1BQU0sRUFBRTtBQUNWLGVBQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUMxQjtBQUNELGFBQU8sS0FBSyxDQUFDO0tBQ2Q7OztXQUVFLGFBQUMsR0FBTSxFQUFVO0FBQ2xCLFVBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLGFBQU8sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztLQUNsQzs7O1dBRUssaUJBQUMsR0FBTSxFQUFFLEtBQVEsRUFBVztBQUNoQyxVQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQyxVQUFJLEdBQUcsRUFBRTtBQUNQLFlBQU0sT0FBTyxHQUFHLEdBQUcsVUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xDLFlBQUksR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7QUFDbEIsY0FBSSxDQUFDLFFBQVEsVUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzNCO0FBQ0QsZUFBTyxPQUFPLENBQUM7T0FDaEI7QUFDRCxhQUFPLEtBQUssQ0FBQztLQUNkOzs7V0FFUSxtQkFBQyxHQUFNLEVBQVc7QUFDekIsYUFBTyxJQUFJLENBQUMsUUFBUSxVQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEM7OztXQUVFLGFBQUMsR0FBTSxFQUFFLEtBQVEsRUFBa0I7QUFDcEMsVUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkMsVUFBSSxHQUFHLEVBQUU7QUFDUCxXQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ2hCLE1BQU07QUFDTCxZQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDMUM7QUFDRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFTSxpQkFBQyxRQUF5RCxFQUFROzs7QUFDdkUsVUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLEVBQUUsR0FBRztlQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLO2lCQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxRQUFPO1NBQUEsQ0FBQztPQUFBLENBQUMsQ0FBQztLQUM3Rjs7O1NBdkRHLFFBQVE7OztBQTBEZCxNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyIsImZpbGUiOiJNdWx0aW1hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8vIFRPRE86IHB1bGwgdGhpcyBpbnRvIG51Y2xpZGUtY29tbW9ucy5cbmNsYXNzIE11bHRpbWFwPEssIFY+IHtcbiAgLyoqXG4gICAqIEludmFyaWFudDogdGhlIFNldCB2YWx1ZXMgYXJlIG5ldmVyIGVtcHR5LlxuICAgKi9cbiAgX3N0b3JhZ2U6IE1hcDxLLCBTZXQ8Vj4+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3N0b3JhZ2UgPSBuZXcgTWFwKCk7XG4gIH1cblxuICBoYXMoa2V5OiBLKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JhZ2UuaGFzKGtleSk7XG4gIH1cblxuICBoYXNFbnRyeShrZXk6IEssIHZhbHVlOiBWKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdmFsdWVzID0gdGhpcy5fc3RvcmFnZS5nZXQoa2V5KTtcbiAgICBpZiAodmFsdWVzKSB7XG4gICAgICByZXR1cm4gdmFsdWVzLmhhcyh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldChrZXk6IEspOiBTZXQ8Vj4ge1xuICAgIGNvbnN0IHNldCA9IHRoaXMuX3N0b3JhZ2UuZ2V0KGtleSk7XG4gICAgcmV0dXJuIG5ldyBTZXQoc2V0KSB8fCBuZXcgU2V0KCk7XG4gIH1cblxuICBkZWxldGUoa2V5OiBLLCB2YWx1ZTogVik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHNldCA9IHRoaXMuX3N0b3JhZ2UuZ2V0KGtleSk7XG4gICAgaWYgKHNldCkge1xuICAgICAgY29uc3QgZGVsZXRlZCA9IHNldC5kZWxldGUodmFsdWUpO1xuICAgICAgaWYgKHNldC5zaXplID09PSAwKSB7XG4gICAgICAgIHRoaXMuX3N0b3JhZ2UuZGVsZXRlKGtleSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVsZXRlZDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZGVsZXRlQWxsKGtleTogSyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdG9yYWdlLmRlbGV0ZShrZXkpO1xuICB9XG5cbiAgc2V0KGtleTogSywgdmFsdWU6IFYpOiBNdWx0aW1hcDxLLCBWPiB7XG4gICAgY29uc3Qgc2V0ID0gdGhpcy5fc3RvcmFnZS5nZXQoa2V5KTtcbiAgICBpZiAoc2V0KSB7XG4gICAgICBzZXQuYWRkKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc3RvcmFnZS5zZXQoa2V5LCBuZXcgU2V0KFt2YWx1ZV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBmb3JFYWNoKGNhbGxiYWNrOiAodmFsdWU6IFYsIGtleTogSywgb2JqOiBNdWx0aW1hcDxLLCBWPikgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX3N0b3JhZ2UuZm9yRWFjaCgodmFsdWVzLCBrZXkpID0+IHZhbHVlcy5mb3JFYWNoKHZhbHVlID0+IGNhbGxiYWNrKHZhbHVlLCBrZXksIHRoaXMpKSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNdWx0aW1hcDtcbiJdfQ==