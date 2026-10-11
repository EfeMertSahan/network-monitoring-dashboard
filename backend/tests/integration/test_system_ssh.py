import time

from app.collectors.ssh_collector import execute_commands
from app.collectors.system_collector import parse_system_metrics


IP_ADDRESS = "127.0.0.1"
USERNAME = "monitor"
PASSWORD = "monitor123"
PORT = 2222


def test_system_metrics_over_ssh():
    first_commands = [
        "cat /proc/stat | head -n 1",
        "free -m",
        "df -k /",
        "cat /proc/uptime",
    ]

    first_results = execute_commands(
        ip_address=IP_ADDRESS,
        username=USERNAME,
        password=PASSWORD,
        commands=first_commands,
        port=PORT,
        timeout=5,
        retries=3,
    )

    cpu_snapshot_1 = first_results[
        "cat /proc/stat | head -n 1"
    ]

    ram_output = first_results[
        "free -m"
    ]

    disk_output = first_results[
        "df -k /"
    ]

    uptime_output = first_results[
        "cat /proc/uptime"
    ]

    time.sleep(1)

    second_results = execute_commands(
        ip_address=IP_ADDRESS,
        username=USERNAME,
        password=PASSWORD,
        commands=[
            "cat /proc/stat | head -n 1",
        ],
        port=PORT,
        timeout=5,
        retries=3,
    )

    cpu_snapshot_2 = second_results[
        "cat /proc/stat | head -n 1"
    ]

    result = parse_system_metrics(
        cpu_snapshot_1=cpu_snapshot_1,
        cpu_snapshot_2=cpu_snapshot_2,
        ram_output=ram_output,
        disk_output=disk_output,
        uptime_output=uptime_output,
    )

    assert result.cpu_usage is not None
    assert 0 <= result.cpu_usage <= 100

    assert result.ram_usage is not None
    assert 0 <= result.ram_usage <= 100

    assert result.disk_total_gb is not None
    assert result.disk_total_gb > 0

    assert result.disk_used_gb is not None
    assert result.disk_used_gb >= 0

    assert result.uptime_seconds is not None
    assert result.uptime_seconds >= 0