---
title: "在Go實踐bisect"
date: 2020-05-05T11:46:56+08:00
draft: false
tags: ["go", "bisect"]
---

在Python我們習慣用`bisect`二元查找List裡的元素，在Go裡`sort.Search()`同樣可以提供我們相同的目的。
跟Python相同，在查找之前要先對目標陣列進行排序。([關於Sort的教學](https://yourbasic.org/golang/how-to-sort-in-go/))
{{< highlight go>}}
arr := []int{9, 2, 1, 3, 6, 4, 5, 5}
sort.Ints(arr)
{{< / highlight >}}

排序完成後，我們使用sort.Search()，第一個參數為查找目標，第二個為搜尋條件的函式。
這裡我們輸入slice: [1 2 3 4 5 5 6 9]，查找最靠近左邊的5，程式返回索引4。
{{< highlight go>}}
// func Search(n int, f func(int) bool) int
i := sort.Search(len(arr), func(i int) bool { return arr[i] >= 5 })
fmt.Println(i) // output: 4
{{< / highlight >}}

但是在Python的bisect.left()中，可以指定查找範圍。(`bisect.bisect_left(a, x, lo=0, hi=len(a))`)
我在網路上找到熱心網友實作出指定範圍的功能([參考連結](https://codeblog.shank.in/posts/golang-equivalent-of-pythons-bisect_left-and-bisect_right/)):

{{< highlight go>}}
func BisectLeft(a []int, v int) int {
    // 自由調整查找範圍
	return bisectLeftRange(a, v, 0, len(a))
}

func bisectLeftRange(a []int, v int, lo, hi int) int {
    // 查找範圍會等於lo+1到hi的所有元素，如果想直接覆蓋a可以寫成arr=arr[lo:hi]
	s := a[lo:hi]
	return sort.Search(len(s), func(i int) bool {
		return s[i] >= v
	})
}

func BisectRight(a []int, v int) int {
    // 自由調整查找範圍
	return bisectRightRange(a, v, 0, len(a))
}

func bisectRightRange(a []int, v int, lo, hi int) int {
	s := a[lo:hi]
	return sort.Search(len(s), func(i int) bool {
		return s[i] > v
	})
}
{{< / highlight >}}

這樣一來我們只需要像Python一樣調用`bisect.left()`或`bisect.right()`就可以指定查找範圍了。
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

有錯誤歡迎指正~