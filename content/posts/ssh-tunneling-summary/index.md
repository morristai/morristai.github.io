---
title: "SSH Tunneling Summary"
date: 2020-12-10T10:04:55+08:00
draft: false
authors: ["Morris"]
tags: ["port forwarding", "ssh", "networking"]
---

There are three types of SSH port forwarding:

1. **[Local Port Forwarding](#local-port-forwarding)**

    Forwards a connection from the client host to the SSH server host and then to the destination host port.
2. **[Remote Port Forwarding](#remote-port-forwarding)**

    Forwards a port from the server host to the client host and then to the destination host port.
3. **[Dynamic Port Forwarding](#dynamic-port-forwarding)**

    Creates a SOCKS proxy server that allows communication across a range of ports.

## Roles

- **Client**: Any machine where you can `ssh` to enable Port Forwarding
- **SSH Server**: A machine that can be SSHed into by **Client**
- **Target Server**: A machine to which you want to establish a connection, usually to open services on this machine to the outside world.

**Notice**: both **Client** and **SSH Server** can be **Target Server**, it doesn't really need three machines to perform Port Forwarding! However, Dynamic Port Forwarding will not be only one Target Server, but it can be dynamically determined.

## Local Port Forwarding

```bash
ssh -L [local_bind_address:]<local_port>:<target_ip>:<target_port> <SSH Server>
```

Open `bind_address:port` on the Client to wait for connection, when someone connects, transfer all data to `host:host_port`. (Note that host is relative to the address of **SSH Server**, not Client!)

### Example: Connect to a service on a development server behind a firewall

 `ssh -L 9090:localhost:8080 username@my-server` (*Notice that port 22 is implicit in forwarding command)

{{< img src="images/port_forwarding1.png" width="700px">}}

### Example: Through the machine behind the firewall, connect to the specific service behind the firewall

`ssh -L 9090:192.168.1.101:8080 username@my-server`

{{< img src="images/port_forwarding2.png" width="700px">}}

## Remote Port Forwarding

Open `bind_address:port` on the SSH Server to wait for connection, when someone connects, transfer all data to `host:host_port`. (Note that host is relative to the address of **Client**, not SSH Server!)

```bash
ssh -R [server_bind_address:]<server_port>:<target_ip>:<target_port> <SSH Server>
```

### Example: A service that allows others to connect to your computer through an external machine

`ssh -R 0.0.0.0:9090:localhost:8080 username@external-server`

{{< img src="images/port_forwarding3.png" width="700px">}}

- Cautious
    For security reasons, Remote Forwarding can only be bound on the localhost of the SSH Server by default, so the above commands alone cannot open Port 9090 to external connections. You must adjust the configuration file of the SSH service on the SSH Server (usually in `/etc/ssh/sshd_config` ) to add the GatewayPorts setting so that everyone can connect to: `GatewayPorts yes`
    There are three options here:
    1. `no` (defaul), that is, the only specified localhost;
    2. `yes`, the only specified wildcard (0.0.0.0);
    3. `clientspecified`, the client that starts Remote Forwarding can specify itself.

### Example: Through the external machine, connect back to the service on the internal network from the outside

`ssh -R 0.0.0.0:9090:192.168.1.100:8080 username@external-server`

Target Server: 192.168.1.100:8080

{{< img src="images/port_forwarding4.png" width="700px">}}

## Dynamic Port Forwarding

Start a SOCKS proxy server on the SSH Server, and at the same time open `bind_address:port` on the Client to wait for the connection. When someone connects, transfer all the data to this SOCKS proxy server and start the corresponding connection request. Ordinary Port Forwarding can only forward one Port on one IP. When you have many IPs or many Ports that you want to forward, you can only open them one by one, which is very inconvenient. In contrast, Dynamic Port Forwarding can directly set up a proxy server. As long as the program you use supports the SOCKS protocol, you can forward it whenever you want through this proxy server.

```bash
ssh -D [bind_address:]<port> <SSH Server>
```

### Example: Create an HTTP proxy server to connect to all HTTP(S) services on the intranet

`ssh -D 9090 username@internal-machine`

{{< img src="images/port_forwarding5.png" width="700px">}}

## Tips and Tools

### Commonly used SSH command parameters

- `-N` Do not execute a remote command. This is useful for just forwarding ports (protocol version 2 only).
- `-f` Let the ssh command execute in the background, allowing you to continue doing things with the shell. Usually used with `-N` above.

Ref: [https://johnliu55.tw/ssh-tunnel.html](https://johnliu55.tw/ssh-tunnel.html)
