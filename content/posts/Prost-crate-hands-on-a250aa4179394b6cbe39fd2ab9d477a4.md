---
title: "Prost crate hands-on"
date: "2023-05-08T19:43:00.000Z"
lastmod: "2023-05-08T19:48:00.000Z"
draft: false
series: []
authors:
  - "Morris Tai"
tags:
  - "protobuf"
  - "grpc"
  - "rust"
categories: []
NOTION_METADATA:
  object: "page"
  id: "a250aa41-7939-4b6c-be39-fd2ab9d477a4"
  created_time: "2023-05-08T19:43:00.000Z"
  last_edited_time: "2023-05-08T19:48:00.000Z"
  created_by:
    object: "user"
    id: "d7ff686b-6744-4337-b9d7-7286d20d3c4a"
  last_edited_by:
    object: "user"
    id: "d7ff686b-6744-4337-b9d7-7286d20d3c4a"
  cover: null
  icon: null
  parent:
    type: "database_id"
    database_id: "61042bce-6c36-4e82-887c-6f246bddd78e"
  archived: false
  properties:
    series:
      id: "B%3C%3FS"
      type: "multi_select"
      multi_select: []
    draft:
      id: "JiWU"
      type: "checkbox"
      checkbox: false
    authors:
      id: "bK%3B%5B"
      type: "people"
      people:
        - object: "user"
          id: "d7ff686b-6744-4337-b9d7-7286d20d3c4a"
          name: "Morris Tai"
          avatar_url: "https://s3-us-west-2.amazonaws.com/public.notion-static.com/1d886c\
            85-afcf-4691-aef3-561c5efc93ac/flat750x075f-pad750x1000f8f8f8.u2.jp\
            g"
          type: "person"
          person:
            email: "morristai01@gmail.com"
    tags:
      id: "jw%7CC"
      type: "multi_select"
      multi_select:
        - id: "9697d038-09b1-46d4-b46f-fbba888a463d"
          name: "protobuf"
          color: "orange"
        - id: "aca1ba34-772a-4216-89fb-536054b857c6"
          name: "grpc"
          color: "blue"
    categories:
      id: "nbY%3F"
      type: "multi_select"
      multi_select: []
    summary:
      id: "x%3AlD"
      type: "rich_text"
      rich_text: []
    Name:
      id: "title"
      type: "title"
      title:
        - type: "text"
          text:
            content: "Prost crate hands-on"
            link: null
          annotations:
            bold: false
            italic: false
            strikethrough: false
            underline: false
            code: false
            color: "default"
          plain_text: "Prost crate hands-on"
          href: null
  url: "https://www.notion.so/Prost-crate-hands-on-a250aa4179394b6cbe39fd2ab9d477a4"
UPDATE_TIME: "2023-05-08T20:09:25.308Z"
EXPIRY_TIME: "2023-05-08T21:09:16.066Z"

---
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.2/dist/katex.min.css" integrity="sha384-bYdxxUwYipFNohQlHt0bjN/LCpueqWz13HufFEV1SUatKs1cm4L6fFgCi1jT643X" crossorigin="anonymous">


# Overview


Protocol Buffers (Protobuf) is a **binary message format** used to serialize structured data. It was developed by Google and is useful in developing programs to communicate with each other over a network or for storing data. Protobuf is a ‘programming language agnostic’ markup language that allows developers to define message types in .proto files (IDL). Payload model objects are automatically generated on both the server and client sides, saving time. Protobuf is efficient compared to other message formats like JSON & XML.


## Relationship with gRPC


gRPC is a remote procedure call (RPC) framework that uses protocol buffers (protobuf) as its interface definition language (IDL) and data serialization format. This means that gRPC uses protobuf to define the structure of messages exchanged between client and server, as well as the service interface itself. (It is possible to run Avro over gRPC, but you have to write your own stub code generator for avro)


Protobuf is a language-agnostic data serialization format that allows for strong type safety and helps overcome runtime and interoperability issues that are common in distributed environments. gRPC leverages these features of protobuf to provide efficient communication between services in a microservices architecture.


# Concept


Based on these article: 


Protobufs Explained. In essence Protocol Buffers


gRPC Demystified - Protobuf Encoding

- Why do we need proto definitions, could not we convert structured messages directly into binary?
- Why do we need field numbers in proto definitions?
- Why do we need to define types for fields in addition to language native types?
- Distinction between native types vs proto types vs wire types.

consider this data:


```protobuf
{
  score : 25,
  name: "Tom"
}
```


serialized through protobufs ⇒ 8 bytes (variant is roughly x3 smaller compared to below)


serialized through json(whitespace removed) ⇒ 26 bytes


## Encoding


## **3 Typing Systems**

1. **wire types: **how things are written in a **byte stream**
1. **proto types:** proto definition language-neutral types, kinda** instructions to protobufs encoder/decoder on how to turn language native types into wire-types and back.**
1. **language native types** — e.g. JS object, string, number, boolean or Java class, String, char, int, float, boolean

### **Protocol Buffers Well-Known Types**


Protocol Buffers Well-Known Types | Protocol Buffers Documentation (protobuf.dev)


```protobuf
message User {
  string name = 1;
  google.protobuf.Timestamp last_login_time = 2;  // This Well-Known Types
}
```


![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/a113d4d5-8004-435f-b2e8-57a020441de4/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20230508%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230508T200916Z&X-Amz-Expires=3600&X-Amz-Signature=53a1cfd38b3efaacb900f0f29ff48137ec2473dcc9defad91f0216aa4f270bdb&X-Amz-SignedHeaders=host&x-id=GetObject)


Rust prost-wkt


prost-wkt: Prost Well-Known-Types serialization and deserialization


## **Varints**


---


---


## Proto definitions (aka. `*.proto`)


are used by the **encoder** to:

1. Validate input, e.g. JavaScript value of type `number` fits proto `int32` but `string` does not.
1. Determine target wire-type, e.g. `Varint` for `int32`
1. Include field numbers, to make field identification possible by the decoder

are used by the **decoder** to:

1. Get field names based on field numbers
1. Understand how to decode wire-types and load them in proper language native types.

# length-delimited


Main thing to note about Length-delimited fields is that it has the length varint sitting between the key and and the value.


## how Length-delimited fields are encoded?


```rust
// Can use for blog post
println!("{}", prost::length_delimiter_len(127)); // this will output 1, since 1111111 is 127
println!("{}", prost::length_delimiter_len(128)); // this will output 2, since 10000000 00000001 is 128
```


# How to reverse engineer a buffer by hand


> 💡 An ASCII character can be stored in a single Byte (8 bits), technical ASCII only occupies 7 bits, and the 8th bit was used for error checking.


> 💡 One byte can be represented as two consecutive hexadecimal digits, cause 2^4 = 16. (two to the power of four)


> 💡 MSB stands for "**most significant bit**". It is the bit which has the largest value in a multi-bit binary number and is farthest to the left. In the context of your example, "msb=1" means that the most significant bit of each byte indicates whether more bytes are following (msb=1, | 0x80) or not (msb=0).


## How to decode a `varint`


Protobuf Parsing in Python | Datadog (datadoghq.com)

1. Whether the message is **length delimited** or not?

	  **True **→ If the message is length delimited, the first byte(s) would specify the message's total length as a **varint**. 


	  **False **→ Otherwise the message starts with the first field's **tag** directly.

1. **How to decode a varint?
**The varint is either:
  Just 1 byte long → You can just take the byte as the value (msb isn't set anyway)
  The value isn't important. → You can simply skip all bytes with the most significant bit set plus one.

# Prost Error: DecodeError { description: "invalid string value: data is not UTF-8 encoded", stack: [("NetworkActivityEvent", "request")] } 


`match str::from_utf8(drop_guard.0) {`


prost/encoding.rs at 4e14adf4be890d031d05da7521e3c1a1984007fa · tokio-rs/prost (github.com)


SAE Protobuf decoder: adc.github.trendmicro.com


# Python and** **problems


> 💡 TypeError: Descriptors cannot not be created directly.  
> If this call came from a _pb2.py file, your generated code is out of date and must be regenerated with protoc >= 3.19.0.  
> If you cannot immediately regenerate your protos, some other possible workarounds are:  
> 1. Downgrade the protobuf package to 3.20.x or lower.  
>   
> 1. Set PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python (but this will use pure-Python parsing and will be much slower).


**Solution**: danielgtaylor/python-betterproto: Clean, modern, Python 3.6+ code generator & library for Protobuf 3 and async gRPC (github.com)


Q: I want to use Python to encode a length-delimited protobuf file from multiple Python data class instances. The data class is generated from a .proto file pre-defined schema, which is very complicated. However, the entry point is all from one .proto which uses the "`oneof`" keyword to include other .proto schemas. How do I do this?


## After betterproto generated, error: **circular (cyclic) imports**** **


## [module] struct (not FFI)


The Python `struct` module is used to provide a simple Pythonic interface to access and manipulate C’s structure datatype. This module can convert Python values to a C structure and vice-versa. The C structure is used as a Python bytes object since there is nothing called an object in C; only byte-sized data structures.


The `struct` module performs conversions between Python values and C structs represented as Python bytes objects. Format strings are the mechanism used to specify the expected layout when packing and unpacking data.


Two main applications for the struct module exist: data interchange between Python and C code within an application or another application compiled using the same compiler (native formats), and data interchange between applications using agreed upon data layout (standard formats).


> 💡 The `struct` module is not an FFI implementation. It is used to provide a simple Pythonic interface to access and manipulate C’s structure datatype. This module can convert Python values to a C structure and vice-versa. The C structure is used as a Python bytes object since there is nothing called an object in C; only byte-sized data structures.  
> However, there are other modules in Python that allow you to call functions written in C and other languages from Python programs. One such module is `ffi`. It allows you to call functions written in C and other languages (from libraries, binaries, or just memory) from Python programs.


## [module] pydantic


Pydantic is a Python library that provides an easy and convenient way to validate and manipulate data. It was created to help simplify the process of data validation and make it more efficient for developers. Pydantic integrates seamlessly with Python’s data structures and provides a flexible and user-friendly API for defining and validating data. It is a data validation and settings management library for Python 3.7+ based on the Python type annotations.


Pydantic has efficient error handling and a custom validation mechanism. As of today, Pydantic is used mostly in the FastAPI framework for parsing requests and responses because Pydantic has built-in support for JSON encoding and decoding.


# Random Generator


yupingso/randomproto: Random protobuf object generator (github.com)

