from app.collectors.ping_collector import check_host


IP_ADDRESS = "127.0.0.1"


def test_check_host():
    result = check_host(
        IP_ADDRESS
    )

    assert result.is_alive is True
    assert result.packets_sent >= 1
    assert result.packets_received >= 1
    assert 0 <= result.packet_loss <= 100
    assert result.latency_ms >= 0