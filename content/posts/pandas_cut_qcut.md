---
title: "Pandas cut and qcut Functions"
date: 2017-08-05T11:46:56+08:00
draft: false
tags: ["pandas", "cut", "qcut"]
---

When we have continuous numerical values, we can discretize them using `cut` and `qcut`.
The `cut` function bins values by numeric intervals, while `qcut` bins them by quantiles.
In other words, `cut` produces bins of equal length, while `qcut` produces bins of equal size.
> ## The cut function
Suppose we have the ages of a group of people:\
**ages** = `[20, 22, 25, 27, 21, 23, 37, 31, 61, 45, 41, 32, 101]`\
If we want to discretize this list into "18 to 25", "25 to 35", "35 to 60", and "60 and above", we can use the `cut` function:
```python
bins = [18, 25, 35, 60, 100]
cats = pd.cut(ages, bins)
cats
output:
[(18, 25], (18, 25], (18, 25], (25, 35], (18, 25], ..., (60, 100], (35, 60], (35, 60], (25, 35], NaN]
Length: 13
Categories (4, interval[int64]): [(18, 25] < (25, 35] < (35, 60] < (60, 100]]
```
The first list shows which bin each age falls into. Values outside the bins become `NaN`. `cats` has two attributes:
```python
cats.labels
output:
array([ 0,  0,  0,  1,  0,  0,  2,  1,  3,  2,  2,  1, -1], dtype=int8)
```
We can also assign labels to each range, for example:
```python
group_names = ['Youth', 'YoungAdult', 'MiddleAged', 'Senior']
pd.cut(ages, bins, labels=group_names)
output:
[Youth, Youth, Youth, YoungAdult, Youth, ..., Senior, MiddleAged, MiddleAged, YoungAdult, NaN]
Length: 13
Categories (4, object): [MiddleAged < Senior < YoungAdult < Youth]
```
> ## The qcut function
```python
data = np.random.randn(1000) # Gaussian distribution
cats = pd.qcut(data, 4) # Bin by quartiles; you can also pass [0, .25, .5, .75, 1.]
cats
output:
[(0.624, 3.928], (-0.691, -0.0144], (-0.691, -0.0144], (-0.0144, 0.624], (0.624, 3.928], ..., (-0.0144, 0.624], (-0.0144, 0.624], [-2.949, -0.691], (-0.0144, 0.624], (0.624, 3.928]] Length: 1000 Categories (4, object): [[-2.949, -0.691] < (-0.691, -0.0144] < (-0.0144, 0.624] < (0.624, 3.928]]
pd.value_counts(cats) # Count the number of values in each bin
output:
(0.624, 3.928]       250 
(-0.0144, 0.624]     250 
(-0.691, -0.0144]    250 
[-2.949, -0.691]     250 
dtype: int64
```
You'll notice that `qcut` distributes all values evenly. If you don't want quartiles, you can pass your own list — any values between 0 and 1 will work, for example `[0, 0.1, 0.5, 0.9, 1.]`.
