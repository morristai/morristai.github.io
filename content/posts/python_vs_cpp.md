---
title: "Common Python and C++11 usage comparison"
date: 2019-05-12T11:46:56+08:00
draft: false
authors: ["Morris"]
tags: ["python", "c++"]
---

[My Gist](https://gist.github.com/morristai/7c7c42c128177e8f4110cffa97e8fb7f)

## Define Variables

- Python
{{< highlight python>}}
a = 1
b = 0.0
c = 'xxx'
{{< / highlight >}}
- C++
{{< highlight cpp>}}
int a = 1;
auto a = 1;
double b = 0.0;
auto b = 0.0;
const char c[] = "xxx"; // C string (char array)
const char* c = "xxx";  // C string (pointer)
std::string c = "xxx";
std::string c("xxx");
std::string c{"xxx"};
{{< / highlight >}}

## Variable Scopes

- Python
{{< highlight python>}}
global_var1 = 1
def func(arg):
    local_var = 2
    global global_var2
    global_var2 = 'xxx' # global
if arg:
    local_var2 = 0.5 # scope: function
    ...
    # if arg evaluates to True,
    # local_var2 is still accessible here.
    return False
{{< / highlight >}}

- C++
{{< highlight cpp>}}
int global_var1 = 1; // global
static std::string global_var2; // global in the current file
bool func(bool arg){
int local_var = 2;
global_var2 = "xxx";
if(arg){
double local_var2 = 0.5; // scope: if block
....}
// local_var2 is undefined here}
{{< / highlight >}}

## Reference

- Python
{{< highlight python>}}
s1 = {"key1" : 100}
s2 = s1 # reference the same object
s2["key2"] = 200
print(s1["key1"])
# {"key1":100, "key2": 200}
s2 = {} # s1 is NOT changed, s1 and s2

# reference different objects now

{{< / highlight >}}

- C++
{{< highlight cpp>}}
std::unordered_map<std::string, int> s1 = {"key1" : 100};
std::unordered_map<std::string, int> s2 = s1; // copy the whole object
std::unordered_map<std::string, int>& s2 = s1; // reference the same object
s2 = std::unordered_map<std::string, int>(); // s1 is changed, s1 and s2 still reference the same object
// C++ 11
auto s2 = s1;  // copy the whole object (slow)
auto& s2 = s1; // reference the same object
// Now s2 is a reference to s1
auto s3 = s2;  // copy the whole s1 object. s3 is NOT a reference
const auto& s3 = s2; // reference the same s1 object
{{< / highlight >}}

## Conditional

- Python
{{< highlight python>}}
if a == 1 and b == 2:
    pass
elif c == 3 or d == 4:
    pass
else:
    pass
if a == 1:
...
elif a == 2:
...
elif a == 3:
...
else:
...
{{< / highlight >}}

- C++
{{< highlight cpp>}}
if (a == 1 && b == 2){}
else if(c == 3 || d == 4){}
else {}
switch(a){
case 1:
    ...
    break;    // without break, will run case 2 as well
case 2: { // create a new scope if we need to define new variables
    int a = 100;
    break;}
default:  // it's good practice to always add this
...};
{{< / highlight >}}

## Namespace & Imports

- Python
{{< highlight python>}}
# Import: File: app/bidders/ai_util.py
import app.bidders.ai_util
# Namespace: defined by directory structure
# Fully qualified names:
app.bidders.ai_util.func("xxx")
{{< / highlight >}}

- C++
{{< highlight cpp>}}
// Import: Files: app/bidders/ai_util.hpp & ai_util.cpp
#include "app/bidders/ai_utils.hpp"
// Namespace: not related to directory structure
namespace app {
    namespace bidder {
        namespace ai_util {
            void func(const char* str);
        }
    }
}
// Fully qualified names:
app::bidders::ai_util::func("xxx");
{{< / highlight >}}

## Loops

- Python
{{< highlight python>}}
for i in range(100):
    pass
while cond:
...
a = [0, 1, 100]
for item in a:
    pass
b = {"key": 0.5, "key2", 1.0}
for key, val in b.iteritems():
    pass
{{< / highlight >}}    

- C++
{{< highlight cpp>}}
for(int i = 0; i < 100; ++i){...}
while(cond){}
std::vector<int> a = {0, 1, 100};
for(auto& item: a){ // without &, this will copy each item
}
std::unordered_map<std::string, double> b = {{"key", 0.5}, {"key2",
1.0}};
for(auto& item: b){ // without &, this will copy each item
auto& key = item.first;
auto& val = item.second;}
{{< / highlight >}}

## Functions

- Python
{{< highlight python>}}
def func(arg1, arg2):
    ....
    return ret1, ret2, ret3
{{< / highlight >}}

- C++
{{< highlight cpp>}}
void func(const Arg1& arg1, const Arg2& arg2,
Ret1& ret1, Ret2& ret2, Ret3& ret3
){...
ret1 = ....;
ret2 = ....;
ret3 = ....;}
No multiple return values
Need to specify the type of the return value
Every variable needs to have type declaration
Declaration before use is required
Add const to the references that are not changed by the method
Declare in *.hpp, implement in *.cpp (for public functions)
{{< / highlight >}}

## Class Definition

- Python
{{< highlight python>}}
# Python version: only one *.py file:
class PythonClass(ParentClass):
    def __init__(self): # constructor, pass instance as self
        ParentClass.__init__(self) # python2
        self.attrib = 1111
        Self.attrib2 = 'xxx'
    def some_method(self, arg1, arg2):
        return arg1 * arg2 + self.attrib
    def _some_private_method(self): # kind of private func
        pass
{{< / highlight >}}

- C++
{{< highlight cpp>}}
// --------- Declaration: cpp_class.hpp ---------
class CppClass: public ParentClass {
public:
CppClass(): ParentClass(), attrib(5566),
attrib2("xxx"){}
virtual ~CppClass(): {
// destructor: free allocated resources here}
double someMethod(double arg1, double arg2);
private:
void somePrivateMethod(){}
int attrib;
std::string attrib2;};
// --------- Implementation: cpp_class.cpp ---------
#include "cpp_class.hpp"
double CppClass::someMethod(double arg1, double arg2){
return arg1 * arg2 + attrib;}
{{< / highlight >}}

## Virtual function

- Python
{{< highlight python>}}
class Raccoon:
    def get_name(self):
        return "raccoon"
class Zebra(Raccoon):
    def get_name(self):
        return "zebra_" + Raccoon.get_name()
def func(maybe_racoon):
    print(maybe_racoon.get_name())
obj = Zebra()
func(obj)

# pintout: zebra_raccoon
{{< / highlight >}}

- C++
{{< highlight cpp>}}
class Raccoon {
public:
std::string getName() const {
return "raccoon";}};
class Zebra: public Raccoon {
public:
std::string getName() const {
return "zebra" + Raccoon::getName();}};
void func(const Raccoon& maybeRaccoon){
std::cout << maybeRaccoon.getName() << std::endl;}
Zebra obj;
func(obj);
// pintout: raccoon
{{< / highlight >}}
- C++
{{< highlight cpp>}}
class Raccoon {
public:
virtual std::string getName() const {
return "raccoon";}};
class Zebra: public Raccoon {
public:
std::string getName() override const {
return "zebra" + Raccoon::getName();}};
void func(const Raccoon& maybeRaccoon){
std::cout << maybeRaccoon.getName() << std::endl;}
Zebra obj;
func(obj);
// pintout: zebra_raccoon
{{< / highlight >}}

## Manage Objects

- Python
{{< highlight python>}}
obj = ObjClass()
obj.method(arg)
obj.attribute = 100
obj2 = obj # reference the same object
# Manual delete is not needed
{{< / highlight >}}
- C++
{{< highlight cpp>}}
ObjClass* obj = nullptr; // prefer nullptr over NULL
ObjClass* obj = new ObjClass(); // allocate on heap
obj->method(arg);
obj->attribuge = 100;
auto obj2 = obj;   // point to the same object
auto obj2 = *obj;  // copy!
auto& obj2 = *obj; // reference the same object
delete obj;        // when not used, manual delete is required
ObjectClass localObj(); // allocate on local stack
localObj.method(arg);
// Raw pointer is not recommended. Use smart pointers
#include <memory>
std::shared_ptr<ObjClass> obj;
auto obj = std::make_shared<ObjClass>();
obj->method(arg);
obj->attribute = 100; // manual delete is not needed
auto obj2 = obj;      // point to the same object (no * or &)
{{< / highlight >}}

## Common Data Types (from Python to C++)

- `int`:
    - int, long, unsigned int, unsigned long (size is architecture dependent)
    - std::int64_t, std::uint64_t, std::int16_t, ... (#include <cstdint>, well-defined sizes)
- `bool`:bool
- `float`: double (64-bit), float(32-bit, bad performance & not recommended)
- `str, bytes`: std::string (#include <string>)
- containers:
    - `list`: std::vector<> (#include <vector>)
    - `dict`: std::unordered_map<> (#include <unordered_map>)
    - `set`: std::unordered_set<> (#include <unordered_set>)
- None:
    - For float, can use NAN (#include <cmath>) and use std::isnan(number) to check if it’s NAN
    - For string, just use empty string and use str.empty() to check if it’s empty

## Define Strings

- Python
{{< highlight python>}}
s = "this is a string"
s2 = s # s2 and s reference the same object
len(s)
t = "prefix_" + s + "_suffix"
t = "prefix1" + "prefix2" + s
s = "has\0zero"
# len(s): 8
{{< / highlight >}}
- C++
{{< highlight cpp>}}
#include <string>
std::string s = "this is a string";
auto s2 = s; // copy s to s2 (new object)
auto& s2 = s; // s2 is a reference only
s.length();
auto t = "prefix_" + s + "_suffix"; // works but slower
std::string t = "prefix_"; t += s; t += "_suffix"; // good
auto t = "prefix1" + "prefix2" + s; // does not work
std::string s = "has\0zero"; // incorrect
s.length(): 3
std::string s("has\0zero", 8); // correct
Alternative (C++ 14):
using namespace std::string_literals;
auto z = "has\0zero"s; // add "s" suffix, z is std::string
auto z = "has\0zero"; // z is char* pointer
{{< / highlight >}}

## String Methods

- Python
{{< highlight python>}}
t = "test str"
if t.find("sub_str") == -1:
    print("not found")
u = t[1:2] # get sub string
u = t[2:]  # get sub string til end
if not t:
    print("empty str")
v = t.lower()
{{< / highlight >}}
- C++
{{< highlight cpp>}}
#include <string>
std::string t = "test str";
if (t.find("sub_str") == std::string::npos)
std::cout << "not found\n";
if(t.empty())
std::cout << "empty str\n";
auto u = t.substr(1, 2);
auto u = t.substr(1);
#include <algorithm>
#include <cctype>
std::transform(t.begin(), t.end(), t.begin(), std::tolower);
// This does not work in unicode
{{< / highlight >}}

## List (dynamic array)

- Python
{{< highlight python>}}
a = [1, 2, 3]
b = ["str1", "str2", "str3"]
c = ["xxx", {}, 100, 0.5] # cannot be done in C++
a.append(100)
a.insert(2, 10)
del a[1], a[0:2]
tmp = a[0:2]
tmp = a[2]
tmp2 = b[1] # reference the element
{{< / highlight >}}
- C++
{{< highlight cpp>}}
#include <vector>
std::vector<int> a = {1, 2, 3};
std::vector<std::string> b = {"str1", "str2", "str3"};
std::vector<????> c // cannot be done in C++
a.push_back(100);
a.insert(a.begin() + 2, 10);
a.erase(a.begin() + 1);
a.erase(a.begin(), a.begin() + 2);
std::vector<int> tmp{a.begin(), a.begin() + 2};
auto tmp = a[2];
auto tmp2 = b[1]; // copy the element!
auto& tmp2 = b[1]; // reference the element
{{< / highlight >}}s

## Set

- Python
{{< highlight python>}}
a = set()
a = {"1", "2", "3"}
b = [1, 2, 3]
c = set(b)
a.add("x")
a.remove("2")
if "4" in a:
    pass
{{< / highlight >}}
- C++
{{< highlight cpp>}}
#include <unordered_set>
std::unordered_set<std::string> a;
std::unordered_set<std::string> a = {"1", "2", "3"};
std::vector<int> b = {1, 2, 3};
std::unordered_set<int> c(b.begin(), b.end());
a.insert("x");
a.erase("2");
if (a.find("4") != a.end()){
...}
{{< / highlight >}}

## Dict

- Python
{{< highlight python>}}
d = {"a": 1, "b": 2}
nested = {
"a": {"a1": 0.5},
"b": {"b1": 0.3, "b2": 0.4},}
free = {"a": 100, "b": "xxx", 50: None} # cannot do this in C++
d = defaultdict(lambda: "null"); # cannot easily do this in C++ 
{{< / highlight >}}
- C++
{{< highlight cpp>}}
#include <unordered_map>
std::unordered_map<std::string, int> d = {
{"a", 1}, {"b", 2}};
std::unordered_map<std::string,
std::unordered_map<std::string, int>> nested = {
{"a": {{"a1", 0.5}}},
{"b": {{"b1", 0.3}, {"b2", 0.4}},};
{{< / highlight >}}

## Common Dict Operations

- Python
{{< highlight python>}}
d["new_key"] = 100
d["no such key"] # raise KeyError
del d["key"]; gc.collect()
if "key" in d:
    e = d["key"]
for key, val in d.iteritems():
    pass
{{< / highlight >}}
- C++
{{< highlight cpp>}}
d["new_key"] = 100;
d["no such key"] // create a new item for it
d.erase("key");
auto iter = d.find("key");
if(iter != d.end()){
 // without &, this will do copy
auto& e = iter->second;}
 // C++ 11 ranged for loop syntax
for(auto& item: d){ // without &, this will do copy
auto& key = item.first;
auto& val = item.second;
...}
{{< / highlight >}}
