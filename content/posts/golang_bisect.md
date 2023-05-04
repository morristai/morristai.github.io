---
title: "Practicing bisect in Go"
date: 2020-05-05T11:46:56+08:00
draft: false
tags: ["go", "binary search"]
---

In Python, we are used to using `bisect` to search for elements in the List. In Go, `sort.Search()` can also provide us with the same purpose.
As in Python, the target array is sorted before searching.

{{< highlight go>}}
arr := []int{9, 2, 1, 3, 6, 4, 5, 5}
sort. Ints(arr)
{{< / highlight >}}

After sorting, we use sort.Search(), the first parameter is the search target, and the second is the function of the search condition.
Here we input slice: [1 2 3 4 5 5 6 9], find the 5 closest to the left, and the program returns the index 4.

{{< highlight go>}}
// func Search(n int, f func(int) bool) int
i := sort.Search(len(arr), func(i int) bool { return arr[i] >= 5 })
fmt.Println(i) // output: 4
{{< / highlight >}}

But in Python's `bisect.left()`, you can specify the search range. (`bisect. bisect_left(a, x, lo=0, hi=len(a))`)
I found on the Internet that enthusiastic netizens implement the function of specifying the range ([reference link](https://codeblog.shank.in/posts/golang-equivalent-of-pythons-bisect_left-and-bisect_right/)):

{{< highlight go>}}
func BisectLeft(a []int, v int) int {
    // Freely adjust the search range
	return bisectLeftRange(a, v, 0, len(a))
}

func bisectLeftRange(a []int, v int, lo, hi int) int {
    // The search range will be equal to all elements from lo+1 to hi. If you want to directly cover a, you can write it as arr=arr[lo:hi]
	s := a[lo:hi]
	return sort.Search(len(s), func(i int) bool {
		return s[i] >= v
	})
}

func BisectRight(a []int, v int) int {
    // Freely adjust the search range
	return bisectRightRange(a, v, 0, len(a))
}

func bisectRightRange(a []int, v int, lo, hi int) int {
	s := a[lo:hi]
	return sort.Search(len(s), func(i int) bool {
		return s[i] > v
	})
}
{{< / highlight >}}

In this way, we only need to call `bisect.left()` or `bisect.right()` like Python to specify the search range.
{{< highlight go>}}
func BinarySearch(a []int, v int) int {
	pos := BisectLeft(a, v)
	if pos == len(a) {
        // the value sought is higher than the 
        // max value in the slice
		return -1

	} else if a[pos] != v {
        // the value sought is not found
        // this is becuase the BisectLeft would return 
        // the insertion position for the value, 
        // irrespective of whether this value was found in the
        // slice or not
		return -1

	} else {
        // the value is 
		return pos
	}
}
{{< / highlight >}}

Ref:  [The 3 ways to sort in Go](https://yourbasic.org/golang/how-to-sort-in-go/)
