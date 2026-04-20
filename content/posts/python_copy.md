---
title: "A Brief Look at Copying in Python"
date: 2017-08-27T11:46:56+08:00
draft: false
tags: ["python", "copy"]
---

Here are three different lists to demonstrate the differences between various copy methods:
```python
import copy
a = [1, 2, 3]
b = [4, 5, 6]
c = [a, b]
```

1. Using normal assignment operations to copy:
```python
d = c
print (id(c) == id(d))          # True - d and c are the same object
print (id(c[0]) == id(d[0]))    # True - d[0] and c[0] are the same object
```
2. Using a shallow copy:
```python
d = copy.copy(c)
print (id(c) == id(d))          # False - d is a new object, different from c
print (id(c[0]) == id(d[0]))    # True - d[0] and c[0] are still the same object
```
3. Using a deep copy:
```python
d = copy.deepcopy(c)
print (id(c) == id(d))          # False - d is a new object, different from c
print (id(c[0]) == id(d[0]))    # False - d[0] is a new object, different from c[0]

```
