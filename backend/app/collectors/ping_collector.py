#Bu dosyanın amacı ping ölçümü yapmak.

from dataclasses import dataclass
#dataclass, esas amacı veri taşımak olan sınıfları daha kolay oluşturmamızı sağlar.

from icmplib import ping


@dataclass
class PingResult:
    is_alive: bool
    packets_sent: int
    packets_received: int
    packet_loss: float
    latency_ms: float


def check_host(
    ip_address: str,
    count: int = 2,
    timeout: int = 2,
) -> PingResult:
    result = ping(
        ip_address,
        count=count,
        timeout=timeout,
        privileged=False,
    )

    return PingResult(
        is_alive=result.is_alive,
        packets_sent=result.packets_sent,
        packets_received=result.packets_received,
        packet_loss=result.packet_loss * 100,
        latency_ms=result.avg_rtt,
    )