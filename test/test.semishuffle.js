var SemiShuffle = require("../src/semishuffle")
var expect = require("chai").expect

describe("SemiShuffle", function(){

  describe("Instantiation", function(){

    it("should instantiate a new object", function(){

      expect(SemiShuffle).to.be.a("function")

      expect(new SemiShuffle()).to.be.an("object")
      expect(new SemiShuffle().toArray()).to.deep.equal([])

    })

    it("should accept an array of items", function(){

      var s = new SemiShuffle(["a", "b", "c"])
      expect(s.length).to.equal(3)
      expect(s.toArray()).to.have.members(["a", "b", "c"])

    })

    it("should shuffle or not shuffle based on options", function(){

      var shuffled
      var shuffleMatch = false
      for (var i = 0; i < 100; i++) {
        shuffled = new SemiShuffle(["a", "b", "c", "d"])
        if (shuffled.toArray()[0] !== "a") {
          shuffleMatch = true
          break
        }
      }
      expect(shuffleMatch).to.equal(true)


      var notShuffled
      var notShuffleMatch = true
      for (var i = 0; i < 100; i++) {
        notShuffled = new SemiShuffle(["a", "b", "c", "d"], {
          shuffleOnInsert: false
        })
        if (notShuffled.toArray()[0] !== "a") {
          notShuffleMatch = false
          break
        }
      }
      expect(notShuffleMatch).to.equal(true)

    })

    it("should have variable variance based on options", function(){

      var s = new SemiShuffle(["a", "b", "c"], {
        variance: 4
      })
      expect(s.length).to.equal(3)
      expect(s.toArray()).to.have.members(["a", "b", "c"])
      expect(s._items.length).to.equal(7)
      expect(s._items[3]).to.deep.equal({ _blank: true })

      var s = new SemiShuffle(["a", "b", "c"], {
        variance: .5
      })
      expect(s.length).to.equal(3)
      expect(s.toArray()).to.have.members(["a", "b", "c"])
      expect(s._items.length).to.equal(5)
      expect(s._items[3]).to.deep.equal({ _blank: true })

    })

  })

  describe("Standard array methods", function(){

    var s
    beforeEach(function(){
      s = new SemiShuffle([10, 20, 30, 40, 50, 60], {
        shuffleOnInsert: false
      })
    })

    it(".push", function(){
      s.push(70)
      expect(s.length).to.equal(7)
      expect(s.toArray()[6]).to.equal(70)
    })

    it(".pop", function(){
      var popped = s.pop()
      expect(s.length).to.equal(5)
      expect(popped).to.equal(60)
    })

    it(".unshift", function(){
      s.unshift(70)
      expect(s.length).to.equal(7)
      expect(s.toArray()[0]).to.equal(70)
    })

    it(".shift", function(){
      var shifted = s.shift()
      expect(s.length).to.equal(5)
      expect(shifted).to.equal(10)
    })

    it(".reverse", function(){
      expect(s.reverse()).to.deep.equal([60, 50, 40, 30, 20, 10])

      // Fixing the standard array.reverse mutability bs
      expect(s.toArray()).to.deep.equal([10, 20, 30, 40, 50, 60])
    })

  })

  describe("Post-instantiation append methods", function(){

    var s
    beforeEach(function(){
      s = new SemiShuffle([10, 20, 30, 40, 50, 60])
    })

    it(".add", function(){
      s.add(70)
      expect(s.length).to.equal(7)
      expect(s.toArray()).to.have.members([10, 20, 30, 40, 50, 60, 70])
    })

    it(".addArray", function(){
      s.addArray([70, 80, 90])
      expect(s.length).to.equal(9)
      expect(s.toArray()).to.have.members([10, 20, 30, 40, 50, 60, 70, 80, 90])
    })

  })

  describe("Variance getter/setter", function(){

    var s
    beforeEach(function(){
      s = new SemiShuffle([10, 20, 30, 40, 50, 60, 70, 80])
    })

    it("get variance", function(){
      expect(s.variance).to.equal(.25) // default
    })

    it("set variance", function(){
      s.variance = 4
      expect(s.length).to.equal(8)
      expect(s._items.length).to.equal(12)

      s.variance = .6
      expect(s.length).to.equal(8)
      expect(s._items.length).to.equal(13)
    })

  })

  describe("Shuffle method", function(){

    var s
    beforeEach(function(){
      s = new SemiShuffle([10, 20, 30, 40, 50, 60], {
        variance: 2
      })
    })

    it(".shuffle", function(){
      expect(s.length).to.equal(6)
      expect(s._items.length).to.equal(8)
      expect(s._items[6]).to.deep.equal({ _blank: true })
      expect(s._items[7]).to.deep.equal({ _blank: true })

      s.shuffle()
      
      expect(s.length).to.equal(6)
      expect(s._items.length).to.equal(8)
      expect(s._items[6]).to.deep.equal({ _blank: true })
      expect(s._items[7]).to.deep.equal({ _blank: true })
    })

  })

  describe("Looping methods", function(){

    var s
    beforeEach(function(){
      s = new SemiShuffle([10, 20, 30, 40, 50, 60], {
        shuffleOnInsert: false,
        variance: 6
      })
    })

    it(".next", function(){
      expect(s.next()).to.equal(10)
      
      var next
      var blankFound = false 
      var constantLength = true
      for (var i = 0; i < 1000; i++) {
        
        next = s.next()
        
        if (next.blank) {
          blankFound = true
        }

        if (s._items.length !== 12) {
          constantLength = false
        }
      }

      expect(blankFound).to.equal(false)
      expect(constantLength).to.equal(true)
    })

    it(".next(count)", function(){
      var next = s.next(4)
      expect(next).to.deep.equal([10, 20, 30, 40])

      var next = s.next(12)
      expect(next.length).to.equal(12)
      expect(next).to.not.contain({ _blank: true })
    })

    it(".peek", function(){
      expect(s.peek()).to.equal(10)
      expect(s.next()).to.equal(10)
      expect(s.peek()).to.equal(20)
    })

    it(".peek(count)", function(){
      expect(s.peek(10)).to.deep.equal([10, 20, 30, 40, 50, 60])

      expect(s.peek(4)).to.deep.equal([10, 20, 30, 40])
      expect(s.next(2)).to.deep.equal([10, 20])
      expect(s.peek(4)).to.deep.equal([30, 40, 50, 60])
    })

  })

  describe("Static methods", function(){

    it(".create", function(){

      var s = SemiShuffle.create([10, 20, 30, 40], {
        variance: 4,
        shuffleOnInsert: false
      })

      expect(s.length).to.equal(4)
      expect(s._items.length).to.equal(8)

    })

    it(".shuffle", function(){

      var staticArray = [ "a", "b", "c", "d", "e", "f", "g", "h" ]
      SemiShuffle.shuffle(staticArray)
      expect(staticArray).to.deep.equal([ "a", "b", "c", "d", "e", "f", "g", "h" ])

      var shuffleMatch = false
      var array = [ "here", "are", "some", "words" ]
      for (var i = 0; i < 1000; i++) {
        array = SemiShuffle.shuffle(array)
        if (array[0] !== "here") {
          shuffleMatch = true
          break
        }
      }

      expect(shuffleMatch).to.equal(true)

    })

  })

})