---
title: "Async in Traits Just Save Us"
date: "2024-03-10T10:04:55+08:00"
lastmod: 
draft: false
series: []
authors: ["Morris Tai"]
tags: ["rust", "opendal", "async", "future", "trait"]
---

## The Challenge of Implementing the Future Trait for Custom Types

Developers who venture into crafting their own `async`/`await` implementations in Rust may encounter the intricate task of implementing the `Future` trait for their custom types. Rust's approach to `async`/`await` is nuanced, offering a stark contrast to languages like Go, which employs preemptive scheduling. Instead, Rust embraces lazy evaluation and cooperative scheduling, allowing developers to meticulously control the yield points to the executor.
This level of control, however, introduces complexity in implementing the `Future` trait for custom types. The intricacies arise because `.await` can't be invoked within a **non-async** function, necessitating the development of a state machine(or similiar) for these custom types. This endeavor can be laborious and fraught with potential errors, difficult to maintain, and may prompt developers to opt for `BoxFuture<T>`, a choice that could compromise performance.

> **Understanding the Role of `BoxFuture<T>`**  
> `BoxFuture<T>` acts as a wrapper for `Pin<Box<dyn Future<Output = T> + Send + 'a>>`, representing a pointer to an object on the heap that conforms to the `Future` trait. This layer of abstraction spares developers the headache of handling stack-based object or field movements. Thanks to `Box<T>`, which ensures full ownership and permits the movement of the smart pointer without affecting the underlying data, `BoxFuture<T>` transfers are both safe and efficient. Nevertheless, the reliance on heap allocation can introduce performance trade-offs. For developers craving finer-grained control over their asynchronous tasks, exploring alternatives like [pin-project](https://github.com/taiki-e/pin-project) could prove advantageous.

## Exploring OpenDAL's Historical Approach

In [OpenDAL](https://github.com/apache/opendal), our journey with asynchronous traits, akin to Rust's `Future`, has led us to implement the `Read` trait as follows:

```rust
pub trait Read: Unpin + Send + Sync {
    fn poll_read(&mut self, cx: &mut Context<'_>, buf: &mut [u8]) -> Poll<Result<usize>>;
    fn poll_seek(&mut self, cx: &mut Context<'_>, pos: io::SeekFrom) -> Poll<Result<u64>>;
    fn poll_next(&mut self, cx: &mut Context<'_>) -> Poll<Option<Result<Bytes>>>;
}
```

In OpenDAL, operators manage a `FusedAccessor` delegate, essentially a type-erased accessor encapsulating an `Arc<dyn Accessor>` inside. The `Accessor` trait binds associated types with operational traits, such as `type Reader: oio::Read`, making its implementation crucial for each service backend to support specific functionalities. This process can be challenging, as it often involves manually crafting poll actions within a synchronous context to achieve asynchronous behavior.

<img src="images/accessor.png" width="650" style="display: block; margin: 0 auto;">

Thankfully, the commonalities in service operations have allowed us to employ utility structures like [`IncomingAsyncBody`](https://github.com/apache/opendal/blob/50791255c6ef3ed259c88dcc04a4295fa60fa443/core/src/raw/http_util/body.rs#L161), which implements the `Read` trait. This strategy facilitates efficient HTTP response management across service backends, eliminating the need to reinvent the wheel for each services.

Nonetheless, challenges may surface during integrations, such as with the DataBricks filesystem in OpenDAL. My experience with `IncomingAsyncBody` highlighted compatibility issues, as DataBricks required a distinct approach to response handling.
![](/images/dbfs-read-problem.png)
This led to the development of a specialized Reader. The path to understanding the necessary state machine culminated in [a complex implementation](https://github.com/apache/opendal/pull/3334/files#diff-67629a5b39ad9200083261e9ecdc26046962dccc6b11a41b4365a7f992b354e0), which seems unnecessary for such a simple operation.

```rust
enum State {
    Reading(Option<Arc<DbfsCore>>),
    Finalize(BoxFuture<'static, (Arc<DbfsCore>, Result<Bytes>)>),
}

unsafe impl Sync for DbfsReader {}

#[async_trait]
impl oio::Read for DbfsReader {
    fn poll_read(&mut self, cx: &mut Context<'_>, mut buf: &mut [u8]) -> Poll<Result<usize>> {
        while self.has_filled as usize != buf.len() {
            match &mut self.state {
                State::Reading(core) => {
                    let core = core.take().expect("DbfsReader must be initialized");

                    let path = self.path.clone();
                    let offset = self.offset;
                    let len = cmp::min(buf.len(), DBFS_READ_LIMIT);

                    let fut = async move {
                        let resp = async { core.dbfs_read(&path, offset, len as u64).await }.await;
                        let body = match resp {
                            Ok(resp) => resp.into_body(),
                            Err(err) => {
                                return (core, Err(err));
                            }
                        };
                        let bs = async { body.bytes().await }.await;
                        (core, bs)
                    };
                    self.state = State::Finalize(Box::pin(fut));
                }
                State::Finalize(fut) => {
                    let (core, bs) = ready!(fut.as_mut().poll(cx));
                    let data = self.serde_json_decode(&bs?)?;

                    buf.put_slice(&data[..]);
                    self.set_offset(self.offset + data.len() as u64);
                    self.has_filled += data.len() as u64;
                    self.state = State::Reading(Some(core));
                }
            }
        }
        Poll::Ready(Ok(self.has_filled as usize))
    }

    // ...
```

## The Advent of async in Traits: Implications and Possibilities

With the advent of Rust [1.75](https://blog.rust-lang.org/2023/12/21/async-fn-rpit-in-traits.html), the concept of **Return Position Impl Trait (RPIT)** in function signatures has been stabilized. This enhancement means we can now directly use `async` in traits, albeit with some [limitations](https://blog.rust-lang.org/2023/12/21/async-fn-rpit-in-traits.html#where-the-gaps-lie). The update streamlines the implementation of traits, such as `Read`, ushering in a more intuitive experience (hat tip to [@Xuanwo](https://github.com/Xuanwo)):

```rust
pub trait Read: Unpin + Send + Sync {
    
    #[cfg(not(target_arch = "wasm32"))]
    fn read(&mut self, limit: usize) -> impl Future<Output = Result<Bytes>> + Send;
    #[cfg(target_arch = "wasm32")]
    fn read(&mut self, size: usize) -> impl Future<Output = Result<Bytes>>;

    #[cfg(not(target_arch = "wasm32"))]
    fn seek(&mut self, pos: io::SeekFrom) -> impl Future<Output = Result<u64>> + Send;
    #[cfg(target_arch = "wasm32")]
    fn seek(&mut self, pos: io::SeekFrom) -> impl Future<Output = Result<u64>>;
}
```

You might be pondering where the `async` keyword goes. Well, in Rust, `async` is essentially syntactic sugar, translating into `impl Future<Output = T> + Send` during compilation. The decision to explicitly define trait bounds stems from the desire to separate compile target for the WASM support. This has no bearing on the implementation of methods. For example, the `poll_read` method in `IncomingAsyncBody` can now be implemented as follows:

```rust
impl oio::Read for IncomingAsyncBody {
    async fn read(&mut self, limit: usize) -> Result<Bytes> {
        if self.size == Some(0) {
            return Ok(Bytes::new());
        }

        if self.chunk.is_empty() {
            self.chunk = match self.inner.next().await.transpose()? {
                Some(bs) => bs,
                None => {
                    if let Some(size) = self.size {
                        Self::check(size, self.consumed)?
                    }

                    return Ok(Bytes::new());
                }
            };
        }

        let size = min(limit, self.chunk.len());
        self.consumed += size as u64;
        let bs = self.chunk.split_to(size);
        Ok(bs)
    }
    
    // ...
```

Compared to the [previous approach](https://github.com/apache/opendal/blob/50791255c6ef3ed259c88dcc04a4295fa60fa443/core/src/raw/http_util/body.rs#L161):

```rust
impl oio::Read for IncomingAsyncBody {
    fn poll_read(&mut self, cx: &mut Context<'_>, mut buf: &mut [u8]) -> Poll<Result<usize>> {
        if buf.is_empty() || self.size == Some(0) {
            return Poll::Ready(Ok(0));
        }

        let mut bs = if let Some(chunk) = self.chunk.take() {
            chunk
        } else {
            loop {
                match ready!(self.inner.poll_next(cx)) {
                    Some(Ok(bs)) if bs.is_empty() => continue,
                    Some(Ok(bs)) => {
                        self.consumed += bs.len() as u64;
                        break bs;
                    }
                    Some(Err(err)) => return Poll::Ready(Err(err)),
                    None => {
                        if let Some(size) = self.size {
                            Self::check(size, self.consumed)?;
                        }
                        return Poll::Ready(Ok(0));
                    }
                }
            }
        };

        let amt = min(bs.len(), buf.len());
        buf.put_slice(&bs[..amt]);
        bs.advance(amt);
        if !bs.is_empty() {
            self.chunk = Some(bs);
        }

        Poll::Ready(Ok(amt))
    }
  
    // ...
```

Isn't that much simpler to read and maintain? No more `loop`, `&mut Context<'_>` and state machines 🎉.

## Wrapping Up

I'm convinced that integrating `async` within traits will significantly expedite handling futures, simplifying the Rust learning curve and making `async`/`await` paradigms more accessible to Rustaceans. Nevertheless, not every challenge related to `async`/`await` in Rust has been solved. There are still some [limitations](https://blog.rust-lang.org/2023/12/21/async-fn-rpit-in-traits.html#where-the-gaps-lie) to consider. However, I beleive the Rust team 🦀 will continue to refine the `async`/`await` experience moving forward. ✌️
