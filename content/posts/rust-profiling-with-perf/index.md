---
title: "Rust Profiling Essentials with perf"
date: "2023-10-09T10:04:55+08:00"
lastmod: 
draft: false
series: []
authors: ["Morris Tai"]
tags: ["rust", "perfiling", "perf", "pmu", "kprobes", "dwarf", "linux"]
---

## What is profiling?

> A: **Sampling** the program **at specific time**, and do some statistics analysis.

It can be one of the following:

- **Reading Backtraces** of the program for every 1000th cycles, and represent in ﬂamegraph.
- **Reading Backtraces** of the program for every 1000th cache miss, and represent in ﬂamegraph.
- **Reading Backtraces** of the program for every 10th memory allocation, and represent in ﬂamegraph.
- **Get return address** of the program for every 10th memory allocation, and show counts for every line.

## How to trigger a sample?

Kind of triggers:

- Hardware Interrupts:
  - **Performance Monitoring Unit (PMU)**: A hardware unit that can be programmed to count hardware events.
  - Time-based interrupts: Timer interrupt, which can be programmed to interrupt the CPU at a speciﬁc interval.
- Software Interrupts:
  - **Profiling API**: A software API that can be used to trigger a sample. `kprobes`, `uprobes`, `perf_event_open`, etc.

### Hardware Interrupts: PMU

A hardware unit that can be programmed to count hardware events. This is the most accurate way to gather data, but it is also the most complex way. It might differ from CPU to CPU, and it might require root access to use.

- **Pros:**
  - Can be used as a **counter** to track various events, like:
    - cache misses
    - CPU cycles
    - L1-dcache-misses
- **Cons:**
  - Requires root access.
  - Configuration may vary between different CPUs (platform-dependent).

The counter is a collection of [Model-Specific Registers (MSR)](https://en.wikipedia.org/wiki/Model-specific_register), which are read/write through RDMSR/WRMSR like other MSRs. They count fixed or configurable events.

- **Fixed:** Counts for predefined events such as core clock and retired instructions.
- **Configurable:** Can be set up through another MSR to count a specific event.

![PMU](images/pmu-msr.jpg)

Here's a sample for (default event) CPU cycles at 999Hz

```bash
$ perf record -F 999
[ perf record: Woken up 1 times to write data ]
[ perf record: Captured and wrote 2.797 MB perf.data (5131 samples) ]
```

Here's another Sample for L1-dcache-misses at 99Hz

```bash
$ perf record -F 99 -e L1-dcache-misses
[ perf record: Woken up 1 times to write data ]
[ perf record: Captured and wrote 2.549 MB perf.data (606 samples) ]
```

But how do we make sure our sample is accurate, distributed evenly, and not biased? We know sometime CPU might be busy(or sleep, etc.), and the sample might be missed. How do we make sure the sample is accurate?

The answer is - **Linux**. Linux is smart enought to automatically adjust the sample rate to make sure the sample is accurate.

> For example, If we want to sample at 100Hz(10ms), but in the previous 1ms, the delta_count is 5, then the period should be 50.
This value is tuned for every **1ms** (by default, HZ=1000)

Exact formula:
$$
period = \frac{delta\\_count \times 10^{9}}{delta\\_nsec \times sample\\_freq}
$$

### Hardware Interrupts: Time-based interrupts

Though PMU is great, some profilers use the event based on [hrtimers](https://docs.kernel.org/timers/hrtimers.html) (especially [setitimer](https://linux.die.net/man/2/setitimer) syscall).

```c
setitimer(ITIMER_PROF, &interval, &old_interval);
  // -> Send SIGPROF everytime the timer hits
```

Profilers utilize time-based interrupts to gather data, such as [gperftools](https://github.com/gperftools/gperftools), [go perf](https://github.com/golang/perf), [pprof-rs](https://github.com/tikv/pprof-rs), and others.

- **Pros:**
  - Easy to use and cross-platform (as [`setitimer`](https://linux.die.net/man/2/setitimer), a POSIX function)
  - Real-time stack unwinding capability reduces memory and disk traffic overhead.
- **Cons:**
  - Less accuracy compared to PMU-based profilers.
  - Incurs greater overhead than PMU-based profilers, making it better suited for high-level profiling. Localized profiling might result in biases and may be less effective.

### Software Interrupts: `kprobes`/`uprobes`

> The differnce between HW/SW, is who triggers the sample.

The kernel rewrites certain instructions, such as the entry of the function, to `INT 3`. When reading related pages, these instructions are automatically replaced. Upon encountering this interrupt, the system catches it and increments a counter. Once this counter meets or exceeds a predefined period, a sample is taken. Subsequently, the counter is reset, allowing the program to continue its execution.

```bash
$ sudo perf probe -x /lib/libc.so.6 --add malloc
Added new events:
probe_libc:malloc  (on malloc in /usr/lib/libc.so.6)
probe_libc:malloc  (on malloc in /usr/lib/libc.so.6)

# We can now use it in all perf tools, such as:
$ sudo perf record -e probe_libc:malloc -F 999
[ perf record: Woken up 1 times to write data ]
[ perf record: Captured and wrote 11.520 MB perf.data ]
```

## How to gather the data?

After discussing interrupts, we now turn to how to gather the data. For every interrupt or signal handler, we have access to:

- The instruction register.
- All general-purpose registers.
- System information of the current program, including process ID (PID), memory, etc.

Obtaining the instruction address is relatively straightforward. However, the challenge lies in acquiring the **backtrace**. We can use something like `Frame Pointer` or `DWARF` or `LBR`.

### Frame Pointer

This method provides a straightforward approach to obtaining the backtrace, although it is not commonly used today. For more details, please refer to [this resource](https://people.cs.rutgers.edu/~pxk/419/notes/frames.html).

### DWARF

Rely on compiler to generate the debug information, and use it to unwind the stack. Take this piece of code as an example:

```rust
fn add1(x: i32) -> i32 {
    x + 1  // 0x0a
}

fn add2(x: i32) -> i32 {
    add1(x) + 2  // 0x1f call
}

fn main() {
    return add2(1);  // 0x3a call
}
```

This a table similiar to DWARF format that specifies how to **set registers** to restore the previous frame:
| Loc   | CFA    | RA    | EDI       | ...    |
|-------|--------|-------|-----------|--------|
| 0x0a  | esp+4  | *cfa  | *(cfa-4)  | ...    |
| 0x1f  | esp+4  | *cfa  | *(cfa-4)  | ...    |

But DWARF use a more compact format to save the space, here's a sample:

```dwarf
0x00000250:   DW_CFA_advance_loc: 1 to 0x00000251
0x00000251:   DW_CFA_def_cfa_offset: 16
0x00000254:   DW_CFA_offset: r6, -16
0x00000257:   DW_CFA_advance_loc: 3 to 0x0000025a
0x0000025a:   DW_CFA_def_cfa_register: r6
0x0000025d:   DW_CFA_advance_loc: 5 to 0x0000025f
0x0000025f:   DW_CFA_offset: r14, -8
```

The DWARF format offers enhanced compatibility across various compilers and architectures. However, this comes with trade-offs, such as occasional compiler bugs and the limitation that it can only operate within user space to avoid potential kernel crashes. To unwind the stack using DWARF, `perf` replicates the entire stack for each sample collected. This approach is not ideal for high-frequency sampling, as it can lead to significant overhead.

|             | Frame Pointer                     | DWARF                           |
|-------------|-----------------------------------|---------------------------------|
| **Pros**    | Fast and lightweight              | Provides detailed and accurate stack traces if well-supported by the compiler |
|             | Simple, widely supported          | Compatible with various compilers and architectures |
|             | Effective in both user and kernel space | Better for complex debugging and optimized code |
| **Cons**    | Limited accuracy with optimized code | Higher overhead due to detailed information processing |
|             | Less detailed stack information   | Primarily for user space; risky for kernel space |
|             |                                   | Slower and more resource-intensive |

## Conclusion

In conclusion, we have discussed the essentials of profiling, including the various methods to trigger samples and gather data. We have also explored the different ways to obtain backtraces, such as using frame pointers or DWARF. Each method has its own set of pros and cons, and the choice of method depends on the specific requirements of the profiling task at hand. By understanding these concepts, we can better optimize our profiling workflow and gain valuable insights into our program's performance.

> This article is highly inspired by [YangKeao](https://github.com/YangKeao)
