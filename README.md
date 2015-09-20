# SemiShuffle

An array-like object with automatic looping and controllable entropy. Useful for stuff like semi-random shuffled music playlists (wherein you'll want the last-played song to go *near* the end of the list, but not necessarily in the same order as before).

## How It Works

An internal array is maintained, comprising a number of "real" items and a variable number of blank spots. 

```js
[ 1, 2, 3, 4, 5, 6, blank, blank, blank ]
```

When **instance.next()** is executed, the first (real) entry from the array is removed

```js
[ 2, 3, 4, 5, 6, blank, blank, blank ]
```

and replaces a random blank spot near the end of the array. 

```js
[ 2, 3, 4, 5, 6, blank, 1, blank ]
```

An additional blank spot is created at the end.

```js
[ 2, 3, 4, 5, 6, blank, 1, blank, blank ]
```

This process repeats through the first cycle of the items, at which point it's likely a reasonable level of entropy has occurred.

```js
[ 3, 4, 5, 6, blank, 1, blank, 2, blank ]
[ 4, 5, 6, blank, 1, blank, 2, 3, blank ]
[ 5, 6, blank, 1, 4, 2, 3, blank, blank ]
[ 6, blank, 1, 4, 2, 3, blank, 5, blank ]
[ blank, 1, 4, 2, 3, 6, 5, blank, blank ]
```

If a blank spot ever makes it to the head of the array, it's just automatically cycled back to the end.

## Usage

* **new SemiShuffle(items, options)**

Creates a new instance, starting with an array of items and an optional options hash. Default options include:

```js
{
  // Shuffle initial array upon instantiation?
  shuffleOnInsert: true,
  
  // Initial level of blank spots
  variance: .25
}
```

* **.variance** -- getter/setter

Changes the number of blank spots in the array. 

If the variance value is set >= 1, you're specifiying a whole, specific number of blank spots to use in the array.

If the variance value is set < 1, you're specifying a ratio compared to the number of real items in the collection. (10 item array * .3 variance = 3 blank spots)

If the number of blank spots would change as a result of this, they'll be either added on to the end of the array, or removed from nearest to the beginning.

* **.next(optionalCount)**

Retrieves the next item in the array, and then replaces it back in one of the open blank spots. (Afterwards, adds an additional blank spot to the end of the array.) Passing in an optional number of items will do this process N times and return an array of the results.

* **.length**
* **.pop()**
* **.push(item)**
* **.shift()**
* **.unshift(item)**

Work like normal arrays, removing the specified item from the array (or adding it). Rebalances blank spots if necessary. **.pop** and **.shift()** will always return a real item (or `undefined`), never a blank.

* **.reverse()**

Works like a normal array, except it's non-mutative now, because Array.reverse being mutative is kinda dumb.

* **.toArray()**

Returns a standard array of items in the current order.

* **.peek(optionalCount)**

Returns the next item, without being mutative. Passing in an optional number of items will return the an array containing the next N items.

* **.add(item)**
* **.addArray(arrayOfItems)**

Adds the item (or each item in the array) to a random spot in the array.

* **.shuffle()**

Fisher-Yates shuffles the existing array, and resets the position of all blank spots to the end.

## Static Methods

* **SemiShuffle.create(items, options)**

In case you're not into that whole **new ClassName** thing, we'll do it for you!

* **SemiShuffle.shuffle(array)**

Fisher-Yates shuffles any array for you.

## Private Variables/Methods

ES6 classes don't really do private, closure-style variables. Anything prefixed by an underscore you probably shouldn't mess with if you want things to, like, work.