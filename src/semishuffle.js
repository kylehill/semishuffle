;(function(){

  const shuffle = function(array) {

    let clonedArray = array.map(function(item){ return item })
    let outbound = []

    while (clonedArray.length) {
      const item = clonedArray.splice(Math.floor(Math.random() * clonedArray.length), 1)[0]
      outbound.push(item)
    }

    return outbound

  }

  const isBlank = function(item) {
    return (typeof(item) === "object" && item._blank === true)
  }

  class SemiShuffle{

    constructor(items = [], options = {}) {

      this._opts = {
        shuffleOnInsert: options.hasOwnProperty("shuffleOnInsert") ? options.shuffleOnInsert : true,
        variance: options.hasOwnProperty("variance") ? options.variance : .25
      }

      this._blanks = 0
      this._items = items
      this._itemCount = items.length

      if (this._opts.shuffleOnInsert) {
        this._items = shuffle(items)
      }

      this._rebalanceBlanks(this._opts.variance)

    }

    toArray() {
      return this._items.filter(function(item){
        return (isBlank(item) === false)
      })
    }

    get length() {
      return this._itemCount
    }

    get variance() {
      return this._opts.variance
    }

    set variance(variance = undefined) {
      if (variance === undefined) {
        return
      }

      this._opts.variance = variance
      
      this._rebalanceBlanks(this._opts.variance)
    }

    // Standard array methods
    shift(){
      const shiftedIndex = this._items.reduce(function(mem, item, index){
        if (mem !== false) { 
          return mem 
        }
        if (isBlank(item) === false) {
          return index
        }
        return false
      }, false)

      const shifted = this._items.splice(shiftedIndex, 1)[0]
      this._itemCount -= 1
      this._rebalanceBlanks()
      return shifted
    }

    unshift(item){
      this._items.unshift(item)
      this._itemCount += 1
      this._rebalanceBlanks()
      return this._itemCount
    }

    pop(){
      const shiftedIndex = this._items.reduceRight(function(mem, item, index){
        if (mem !== false) { 
          return mem 
        }
        if (isBlank(item) === false) {
          return index
        }
        return false
      }, false)

      const shifted = this._items.splice(shiftedIndex, 1)[0]
      this._itemCount -= 1
      this._rebalanceBlanks()
      return shifted
    }

    push(item){
      this._items.push(item)
      this._itemCount += 1
      this._rebalanceBlanks()
      return this._itemCount
    }

    reverse() {
      return this._items.reduce(function(mem, item){
        if (isBlank(item)){
          return mem
        }
        mem.unshift(item)
        return mem
      }, [])
    }

    // Add new items to the array at random location
    add(item){
      const location = Math.floor(Math.random() * this._items.length)
      this._items.splice(location, 0, item)

      this._itemCount += 1
      this._rebalanceBlanks()
    }

    addArray(arrayOfItems){
      arrayOfItems.forEach(function(item){
        this.add(item)
      }, this)
    }

    // Get next item(s) and cycle back to end of array
    next(optionalCount = false){
      if (optionalCount !== false) {
        let outbound = []
        for (let i = 0; i < optionalCount; i++) {
          outbound.push(this.next())
        }

        return outbound
      }

      const firstItem = this._items.shift()
      if (isBlank(firstItem)) {
        this._items.push(firstItem)
        return this.next()
      }

      const newLocation = Math.ceil(Math.random() * this._blanks)
      let blankCounter = 0
      this._items = this._items.map(function(item){
        if (isBlank(item)) {
          blankCounter += 1          
          
          if (blankCounter === newLocation) {
            return firstItem
          }
          
          return item
        }
        return item
      })

      this._items.push({ _blank: true })
      return firstItem
    }

    // Look at the next item(s); non-mutative
    peek(optionalCount = false){
      if (optionalCount === false) {
        return this.toArray()[0]
      }

      return this.toArray().slice(0, optionalCount)
    }

    // Manually reshuffle the array (and reset blanks)
    shuffle() {
      this._items = this.toArray()
      this._blanks = 0

      this._items = shuffle(this._items)
      this._rebalanceBlanks()
    }

    // Private: used for rebalancing "blank" entries in the playlist 
    // when the length or variance changes
    _rebalanceBlanks() {
      
      let blankTarget
      if (this._opts.variance >= 1) {
        blankTarget = Math.floor(this._opts.variance)
      }
      else {
        blankTarget = Math.ceil(this._opts.variance * this._itemCount)
      }

      let currentBlankCount = this._blanks

      if (blankTarget > currentBlankCount) {
        for (let i = 0; i < (blankTarget - currentBlankCount); i++) {
          this._items.push({ _blank: true })
        }
      }
      
      if (blankTarget < currentBlankCount) {
        let toRemove = (blankTarget - currentBlankCount)
        this._items = this._items.filter(function(item){
          if (isBlank(item)) {
            if (toRemove) {
              toRemove -= 1
              return false
            }
            return true
          }
          return true
        })
      }

      this._blanks = blankTarget

    }

    static create(items, options) {
      return new this(items, options)
    }

    static shuffle(array) {
      return shuffle(array)
    }

  }

  if ("undefined" !== typeof(exports)) module.exports = SemiShuffle
  else if ("function" === typeof(define) && define.amd) {
    define("SemiShuffle", function() { return SemiShuffle })
  } else (function () { return this })().SemiShuffle = SemiShuffle

})()
