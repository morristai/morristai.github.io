---
title: "淺談Python的複製"
date: 2017-08-27T11:46:56+08:00
draft: false
tags: ["python", "copy"]
---

這裡用三個不同list來示範不同copy的差別:
{{< highlight python>}}
import copy
a = [1, 2, 3]
b = [4, 5, 6]
c = [a, b]
{{< / highlight >}}

1. Using normal assignment operatings to copy:
{{< highlight python>}}
d = c
print (id(c) == id(d))          # True - d和c是相同object
print (id(c[0]) == id(d[0]))    # True - d[0]和c[0]是相同object
{{< / highlight >}}
2. Using a shallow copy:
{{< highlight python>}}
d = copy.copy(c)
print (id(c) == id(d))          # False - d是新的object，跟c不同
print (id(c[0]) == id(d[0]))    # True - d[0]和c[0]是相同object
{{< / highlight >}}
3. Using a deep copy:
{{< highlight python>}}
d = copy.deepcopy(c)
print (id(c) == id(d))          # False - d是新的object，跟c不同
print (id(c[0]) == id(d[0]))    # False - d[0]是新的object，跟c[0]不同

{{< / highlight >}}