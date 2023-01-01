---
title: "Wasm on Kubernetes"
date: 2022-12-31T17:13:14-05:00
draft: true
---

# WASM on Container/K8S

# Container

## ****Why Containers and WebAssembly Work Well Together****

[https://www.docker.com/blog/why-containers-and-webassembly-work-well-together/](https://www.docker.com/blog/why-containers-and-webassembly-work-well-together/)

2022/12/13- This is all you need to know:

[Geeking out with WebAssembly and Kubernetes using ContainerD Shims](https://www.youtube.com/watch?v=CfHrqFib0-0)

## ****A breakdown of container runtimes for Kubernetes and Docker****

[https://www.techtarget.com/searchitoperations/tip/A-breakdown-of-container-runtimes-for-Kubernetes-and-Docker](https://www.techtarget.com/searchitoperations/tip/A-breakdown-of-container-runtimes-for-Kubernetes-and-Docker)

OCI Runtime:

- [Youki](https://github.com/containers/youki) (A container runtime written in Rust)
- [Kata Container](https://katacontainers.io): The speed of containers, the security of VMs
- [gVisor](https://gvisor.dev): The Container Security Platform
- **[WasmEdge](https://wasmedge.org):** Bring the cloud-native and serverless application paradigms to Edge Computing.

![Untitled](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Untitled.png)

**You only need to read this:** [https://www.tutorialworks.com/difference-docker-containerd-runc-crio-oci/](https://www.tutorialworks.com/difference-docker-containerd-runc-crio-oci/)

### **CRI**

**CRI is the protocol that Kubernetes uses to control the different runtimes that create and manage containers.**

> The container runtime talks to the kubelet over a **Unix socket** using the [CRI protocol](https://kubernetes.io/docs/concepts/architecture/cri/), which is based on the **gRPC** framework
> 

![Untitled](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Untitled%201.png)

### **OCI**

**The OCI is a group of tech companies who maintain a specification for the container image format, and how containers should be run.**

### CRI-O / Containerd (aka. container engine)

[https://docs.openshift.com/container-platform/3.11/crio/crio_runtime.html](https://docs.openshift.com/container-platform/3.11/crio/crio_runtime.html)

## Container Runtime

There’re 1+ runtimeClasses under Container-Runtime: [https://github.com/containerd/containerd/blob/main/docs/cri/config.md#runtime-classes](https://github.com/containerd/containerd/blob/main/docs/cri/config.md#runtime-classes)

![Untitled](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Untitled%202.png)

![Untitled](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Untitled%203.png)

https://ericchiang.github.io/post/containers-from-scratch/

[container from scratch](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/container%20from%20scratch%20dd1a51cecd314414ac3cf3a73759ec10.md)

[https://kubernetes.io/docs/concepts/containers/runtime-class/](https://kubernetes.io/docs/concepts/containers/runtime-class/)

## **Container Runtime Shim**

In tech terms, a ***shim*** is a component in a software system, which acts as **a bridge between different APIs, or as a compatibility layer**. A shim is sometimes added when you want to use a third-party component, but you need a little bit of glue code to make it work.

> “The easiest way to spot a shim is to inspect the process tree on a Linux host with a running docker container”: [https://iximiuz.com/en/posts/implementing-container-runtime-shim/](https://iximiuz.com/en/posts/implementing-container-runtime-shim/)
> 

![Untitled](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Untitled%204.png)

![containerd.png](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/containerd.png)

![Screen Shot 2022-12-14 at 2.29.54 PM.png](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Screen_Shot_2022-12-14_at_2.29.54_PM.png)

![Untitled](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Untitled%205.png)

![Untitled](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Untitled%206.png)

### runwasi: Facilitates running Wasm / WASI workloads managed by containerd

![Untitled](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Untitled%207.png)

![PXL_20221222_221817381.jpg](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/PXL_20221222_221817381.jpg)

running wasm workloads managed by **containerd** either 

1. directly (ie. through ctr) 
2. or as directed by **Kubelet** via the CRI plugin

[https://github.com/deislabs/runwasi](https://github.com/deislabs/runwasi)

### Application runtime: Spin / Slight

(one of the builder of containerd-wasm-shim(Azure member): [https://github.com/devigned](https://github.com/devigned))

[Spin](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Spin%2092e91671ce2547b58b55c2eb3212e2f6.md)

[spiderlightning](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/spiderlightning%206f4fb4b4c59d4f178b47e34159cefca5.md)

## WASM on Docker Desktop (Mac)

### Why the sign: the Image may had poor performance, or fail, if run via emulation?

A: So actually it's emulation.
The wasm support in Docker Desktop is using the “runwasi inside a Linux container (in both x86_64 and arm64)”. If you are using Linux, then it's native. However, if you are using macOS or Windows, then it will use emulation to execute the Wasm ENV.

Q: is it because runwasi is only on linux for now?

A: Correct. Another thing is that the socket-related functions on other platforms are not well implemented. We only grant all of the functionalities on the Linux platforms currently.

# Kubernetes

## Architecture (how to run wasm/wasi on kubernetes)

### Q: can I understand how wasmedge fit into docker/k8s ecosystem like the diagram shows? (and runwasi as containerd-wasm-shim?)

![Untitled](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Untitled%208.png)

A: Right, runwasi is the containerd-shim and docker uses it for its wasm containers. Just to clarify this diagram:

1. You can either use Krustlet instead of a kubelet to run wasm. But I'm only aware of a wasmtime implementation and it has no network support so far. And a krustlet node can't run Linux containers.
2. Another way to run wasm in kubernetes is to use a standard kubelet, containerd and the runwasi rust crate to implement a shim. Docker uses this variant with WasmEdge. But **there are also containerd-shims for Wasmtime: [Spin](https://spin.fermyon.dev/) and [Slight](https://github.com/deislabs/spiderlightning#spiderlightning-or-slight)**. These approach has networking but you can either run wasm or Linux container in a pod, no mixing.
3. The third option is standard kubelet, standard containerd and crun instead of runc. Crun can be compiled with either WasmEdge, wasmtime or wasmer support. With this option you have everything you have when using Linux containers and you can even mix wasm and Linux containers in the same pod which allows the use of sidecar patterns.

### Q: BTW, I'm not sure if WASM runs in Docker can be called as a "container". Because it's not an image's instance right? It's a WASM module.

A: The Images used by Docker are OCI compliant images created like Linux images. The **containerd-wasmedge-shim** may is not a complete OCI runtime but still isolates the processes with **[cgroups](https://www.nginx.com/blog/what-are-namespaces-cgroups-how-do-they-work/)**. Therefore I'd still call it container.

## What is RuntimeClass

![Untitled](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Untitled%209.png)

![Untitled](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Untitled%2010.png)

![Untitled](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Untitled%2011.png)

AKS Wasi Nodepool 和 docker wasm preview用的底层的containerd shim都是runwasi ([https://github.com/deislabs/runwasi](https://github.com/deislabs/runwasi))

Aks wasi nodepool在runwasi的基础上用了spin或者slight来当作wasm runtime，提供了HTTP或者pubsub之类的capability。我们对未来的期望是能有一个更智能的scheduler，根据wasm component的metadata来自动选择使用某一个containerd shim

对，我们对runtimeclass的命名方法是 <wasm runtime>-<application runtime>-<version>

目前slight & spin只支持wasmtime这一个wasm runtime，所以前缀都是wasmtime，将来如果slight支持wasmedge的话，会有wasmedge-slight-v1这样的runtimeclass

## Container runtime

## Container Runtime Interface

### Krustlet (Kubelet but for WASM)

[Towards Krustlet 1.0 and CNCF Sandbox](https://deislabs.io/posts/towards-krustlet-v1-cncf/)

The default implementation of Krustlet listens for the architecture `wasm32-wasi` and schedules those workloads to run in a `wasmtime`-based runtime instead of a container runtime. TV

**[runwasi(containerd shim ): Facilitates running Wasm / WASI workloads managed by containerd](https://github.com/deislabs/runwasi)**

# Image

## node image (is an actual “OS” aka. own a kernal?)

> Quoted from GCP: When you create a GKE cluster or node pool, you can choose the operating system image that runs on each node
> 

The [“node” image](https://sigs.k8s.io/kind/images/node) is a Docker image for running nested containers, systemd, and Kubernetes components. This image is built on top of the [“base” image](https://kind.sigs.k8s.io/docs/design/base-image).

[https://kind.sigs.k8s.io/docs/design/base-image](https://kind.sigs.k8s.io/docs/design/base-image)

## wasm imaged

# F&Q

## how to `exec`

Q: How to exec into a wasm-container shell inside Docker/K8s? how do we troubleshoot and print the log inside a wasm-container because there's no such "OS" in a wasm-container right?

A: I really love to see in your questions how you are digging deeper into this topic!
Logs are not the problem, stdout can just be used for logging.
But you really hit an important point here, the classic way to troubleshoot a running container is just to do a docker `exec` ... or a kubectl `exec` ... but if you have no shell inside your image that is not possible. There are others with the same problem: distroless images are pretty comparable to the minimal wasmedge image and they have no shell either. To debug them you can add a shell to the image and start a new debuggable container or you build one image for debugging and one as a release ([https://github.com/GoogleContainerTools/distroless#debug-images](https://github.com/GoogleContainerTools/distroless#debug-images)) That's not ideal since you'll never debug the same container you have observed a problem with but it is ok for many environment-related problems like network issues.
In Kubernetes, there is the concept of ephemeral containers ([https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/](https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/)) you can inject non-persistent containers in an existing pod. You can debug your pod with them, and when the pod is restarted, the debug container is gone. When you are using crun+wasmedge this approach is working for you.
When a container is running on a containerd-shim (like docker does) there is just no convenient way of debugging a container from within. But in the end, it is just linux. So all processes running in containers are still visible to the hosts root user. So if you have root access to the host machine you could atart processes in the same cgroup ans network namespace using `nsenter` ...

. Not nice and you need to know a bit about how process isolation with cgrups works.

To wrap it up, the troubleshooting story is not finally written and a thing that I am missing (a remote debugger) is not even on the horizon. When I have some time I'd try [https://www.parca.dev/](https://www.parca.dev/) on wasm containers for continuous profiling, but that is just another puzzle piece.

# Falco for WASM

[Falco for Wasm](WASM%20on%20Container%20K8S%2010283c6a8d4e49919da9b4e8f463c961/Falco%20for%20Wasm%2000b2b24586ac41aa87a738ff197e3322.md)

# POC

## Local

**Nodes of a k3d cluster are docker containers running a k3s image.**

[Advanced Options and Configuration | K3s](https://docs.k3s.io/advanced)

• **config.toml.tmpl (toml jinja):** is the containerd config template that k3d uses to generate the containerd config. We have added a line to the template to register the shims, so that containerd will understand how to run our WASM pod's runtime class.

```bash
# K3d Shim Deployment 
# --image: Specify k3s image that you want to use for the nodes
# (the nodes are modeled by containers)
k3d cluster create wasm-cluster --image ghcr.io/deislabs/containerd-wasm-shims/examples/k3d:v0.3.2 -p "8081:80@loadbalancer" --agents 2
# ruintimeClass, kubernetes won't verify first.
kubectl apply -f https://github.com/deislabs/containerd-wasm-shims/raw/main/deployments/workloads/runtime.yaml
kubectl apply -f https://github.com/deislabs/containerd-wasm-shims/raw/main/deployments/workloads/workload.yaml
echo "waiting 5 seconds for workload to be ready"
sleep 5
curl -v http://127.0.0.1:8081/spin/hello
curl -v http://127.0.0.1:8081/slight/hello
```

## Azure

## AWS

[https://www.cncf.io/blog/2021/08/25/webassembly-serverless-functions-in-aws-lambda/](https://www.cncf.io/blog/2021/08/25/webassembly-serverless-functions-in-aws-lambda/)

### ****WebAssembly vs. Python & JavaScript****

### ****WebAssembly vs. Native Client****