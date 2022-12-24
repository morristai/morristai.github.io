---
title: "Pandas cut與qcut函數"
date: 2017-08-05T11:46:56+08:00
draft: false
tags: ["pandas", "cut", "qcut"]
---

如果我們今天有一些連續性的數值，可以使用`cut`及`qcut`進行離散化。
`cut`函数是利用數值區間將數值分類，`qcut`則是用分位數。
換句話說，`cut`用在長度相等的類別，`qcut`用在大小相等的類別。
> ## cut函數
假設我們有一些人的年齡\
**ages** = `[20, 22, 25, 27, 21, 23, 37, 31, 61, 45, 41, 32, 101]`\
我們如果想要離散化這些數列，分成“18到25”、“25到35”、“35到60”以及“60以上”，可以使用`cut`函數
{{< highlight python>}}
bins = [18, 25, 35, 60, 100]
cats = pd.cut(ages, bins)
cats
output:
[(18, 25], (18, 25], (18, 25], (25, 35], (18, 25], ..., (60, 100], (35, 60], (35, 60], (25, 35], NaN]
Length: 13
Categories (4, interval[int64]): [(18, 25] < (25, 35] < (35, 60] < (60, 100]]
{{< / highlight >}}
第一個list是指每個年齡分別在哪個範圍內，如果超出了就變成`NaN`缺失值，cats有兩個屬性：
{{< highlight python>}}
cats.labels
output:
array([ 0,  0,  0,  1,  0,  0,  2,  1,  3,  2,  2,  1, -1], dtype=int8)
{{< / highlight >}}
我們也可以賦予範圍標籤，比如：
{{< highlight python>}}
group_names = ['Youth', 'YoungAdult', 'MiddleAged', 'Senior']
pd.cut(ages, bins, labels=group_names)
output:
[Youth, Youth, Youth, YoungAdult, Youth, ..., Senior, MiddleAged, MiddleAged, YoungAdult, NaN]
Length: 13
Categories (4, object): [MiddleAged < Senior < YoungAdult < Youth]
{{< / highlight >}}
> ## qcut函數
{{< highlight python>}}
data = np.random.randn(1000) #高斯分佈
cats = pd.qcut(data, 4) #按四分位數分類，也可以用[0, .25, .5, .75, 1.]
cats
output:
[(0.624, 3.928], (-0.691, -0.0144], (-0.691, -0.0144], (-0.0144, 0.624], (0.624, 3.928], ..., (-0.0144, 0.624], (-0.0144, 0.624], [-2.949, -0.691], (-0.0144, 0.624], (0.624, 3.928]] Length: 1000 Categories (4, object): [[-2.949, -0.691] < (-0.691, -0.0144] < (-0.0144, 0.624] < (0.624, 3.928]]
pd.value_counts(cats) #計算每個區間的數值個數
output:
(0.624, 3.928]       250 
(-0.0144, 0.624]     250 
(-0.691, -0.0144]    250 
[-2.949, -0.691]     250 
dtype: int64
{{< / highlight >}}
會發現`qcut`把所有數值平均分配了，當然如果不想用四分位的話還可以自行輸入list，只要範圍介在0~1，例如`[0, 0.1, 0.5, 0.9, 1.]`