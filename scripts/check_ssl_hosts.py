#!/usr/bin/env python
import ssl
import socket

HOSTS = [
    'sistema.adcapitaligreja.com.br',
    'www.adcapitaligreja.com.br',
    'api.adcapitaligreja.com.br',
    'adcapitaligreja.com.br',
]

for host in HOSTS:
    try:
        ctx = ssl.create_default_context()
        sock = ctx.wrap_socket(socket.socket(), server_hostname=host)
        sock.settimeout(10)
        sock.connect((host, 443))
        cert = sock.getpeercert()
        subj = dict(x[0] for x in cert['subject'])
        print(f"OK  {host:40} until {cert['notAfter']}  CN={subj.get('commonName', '?')}")
    except Exception as exc:
        print(f"FAIL {host:40} {exc}")
