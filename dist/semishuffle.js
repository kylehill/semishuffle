"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

;(function () {

  var _shuffle = function _shuffle(array) {

    var clonedArray = array.map(function (item) {
      return item;
    });
    var outbound = [];

    while (clonedArray.length) {
      var item = clonedArray.splice(Math.floor(Math.random() * clonedArray.length), 1)[0];
      outbound.push(item);
    }

    return outbound;
  };

  var isBlank = function isBlank(item) {
    return typeof item === "object" && item._blank === true;
  };

  var SemiShuffle = (function () {
    function SemiShuffle() {
      var items = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, SemiShuffle);

      this._opts = {
        shuffleOnInsert: options.hasOwnProperty("shuffleOnInsert") ? options.shuffleOnInsert : true,
        variance: options.hasOwnProperty("variance") ? options.variance : .25
      };

      this._blanks = 0;
      this._items = items;
      this._itemCount = items.length;

      if (this._opts.shuffleOnInsert) {
        this._items = _shuffle(items);
      }

      this._rebalanceBlanks(this._opts.variance);
    }

    _createClass(SemiShuffle, [{
      key: "toArray",
      value: function toArray() {
        return this._items.filter(function (item) {
          return isBlank(item) === false;
        });
      }
    }, {
      key: "shift",

      // Standard array methods
      value: function shift() {
        var shiftedIndex = this._items.reduce(function (mem, item, index) {
          if (mem !== false) {
            return mem;
          }
          if (isBlank(item) === false) {
            return index;
          }
          return false;
        }, false);

        var shifted = this._items.splice(shiftedIndex, 1)[0];
        this._itemCount -= 1;
        this._rebalanceBlanks();
        return shifted;
      }
    }, {
      key: "unshift",
      value: function unshift(item) {
        this._items.unshift(item);
        this._itemCount += 1;
        this._rebalanceBlanks();
        return this._itemCount;
      }
    }, {
      key: "pop",
      value: function pop() {
        var shiftedIndex = this._items.reduceRight(function (mem, item, index) {
          if (mem !== false) {
            return mem;
          }
          if (isBlank(item) === false) {
            return index;
          }
          return false;
        }, false);

        var shifted = this._items.splice(shiftedIndex, 1)[0];
        this._itemCount -= 1;
        this._rebalanceBlanks();
        return shifted;
      }
    }, {
      key: "push",
      value: function push(item) {
        this._items.push(item);
        this._itemCount += 1;
        this._rebalanceBlanks();
        return this._itemCount;
      }
    }, {
      key: "reverse",
      value: function reverse() {
        return this._items.reduce(function (mem, item) {
          if (isBlank(item)) {
            return mem;
          }
          mem.unshift(item);
          return mem;
        }, []);
      }

      // Add new items to the array at random location
    }, {
      key: "add",
      value: function add(item) {
        var location = Math.floor(Math.random() * this._items.length);
        this._items.splice(location, 0, item);

        this._itemCount += 1;
        this._rebalanceBlanks();
      }
    }, {
      key: "addArray",
      value: function addArray(arrayOfItems) {
        arrayOfItems.forEach(function (item) {
          this.add(item);
        }, this);
      }

      // Get next item(s) and cycle back to end of array
    }, {
      key: "next",
      value: function next() {
        var optionalCount = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        if (optionalCount !== false) {
          var outbound = [];
          for (var i = 0; i < optionalCount; i++) {
            outbound.push(this.next());
          }

          return outbound;
        }

        var firstItem = this._items.shift();
        if (isBlank(firstItem)) {
          this._items.push(firstItem);
          return this.next();
        }

        var newLocation = Math.ceil(Math.random() * this._blanks);
        var blankCounter = 0;
        this._items = this._items.map(function (item) {
          if (isBlank(item)) {
            blankCounter += 1;

            if (blankCounter === newLocation) {
              return firstItem;
            }

            return item;
          }
          return item;
        });

        this._items.push({ _blank: true });
        return firstItem;
      }

      // Look at the next item(s); non-mutative
    }, {
      key: "peek",
      value: function peek() {
        var optionalCount = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        if (optionalCount === false) {
          return this.toArray()[0];
        }

        return this.toArray().slice(0, optionalCount);
      }

      // Manually reshuffle the array (and reset blanks)
    }, {
      key: "shuffle",
      value: function shuffle() {
        this._items = this.toArray();
        this._blanks = 0;

        this._items = _shuffle(this._items);
        this._rebalanceBlanks();
      }

      // Private: used for rebalancing "blank" entries in the playlist
      // when the length or variance changes
    }, {
      key: "_rebalanceBlanks",
      value: function _rebalanceBlanks() {
        var _this = this;

        var blankTarget = undefined;
        if (this._opts.variance >= 1) {
          blankTarget = Math.floor(this._opts.variance);
        } else {
          blankTarget = Math.ceil(this._opts.variance * this._itemCount);
        }

        var currentBlankCount = this._blanks;

        if (blankTarget > currentBlankCount) {
          for (var i = 0; i < blankTarget - currentBlankCount; i++) {
            this._items.push({ _blank: true });
          }
        }

        if (blankTarget < currentBlankCount) {
          (function () {
            var toRemove = blankTarget - currentBlankCount;
            _this._items = _this._items.filter(function (item) {
              if (isBlank(item)) {
                if (toRemove) {
                  toRemove -= 1;
                  return false;
                }
                return true;
              }
              return true;
            });
          })();
        }

        this._blanks = blankTarget;
      }
    }, {
      key: "length",
      get: function get() {
        return this._itemCount;
      }
    }, {
      key: "variance",
      get: function get() {
        return this._opts.variance;
      },
      set: function set() {
        var variance = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

        if (variance === undefined) {
          return;
        }

        this._opts.variance = variance;

        this._rebalanceBlanks(this._opts.variance);
      }
    }], [{
      key: "create",
      value: function create(items, options) {
        return new this(items, options);
      }
    }, {
      key: "shuffle",
      value: function shuffle(array) {
        return _shuffle(array);
      }
    }]);

    return SemiShuffle;
  })();

  if ("undefined" !== typeof exports) module.exports = SemiShuffle;else if ("function" === typeof define && define.amd) {
    define("SemiShuffle", function () {
      return SemiShuffle;
    });
  } else (function () {
    return this;
  })().SemiShuffle = SemiShuffle;
})();