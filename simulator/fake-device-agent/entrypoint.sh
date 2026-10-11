#Docker container açıldığı anda SSH sunucusunu çalıştırır ve onu arka plana atmak yerine container'ın ana işlemi olarak açık tutar.
#!/bin/bash

set -e

mkdir -p /run/sshd

exec /usr/sbin/sshd -D -e