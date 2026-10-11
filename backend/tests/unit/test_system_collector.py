from app.collectors.system_collector import (
    parse_system_metrics,
)


def test_parse_system_metrics():
    cpu_snapshot_1 = (
        "cpu  100 0 100 700 0 0 0 0 0 0"
    )

    cpu_snapshot_2 = (
        "cpu  120 0 130 750 0 0 0 0 0 0"
    )

    ram_output = (
        "               total        used        free      "
        "shared  buff/cache   available\n"
        "Mem:           15863         842       14820          "
        "26         434       15020"
    )

    disk_output = (
        "Filesystem      1K-blocks     Used Available Use% Mounted on\n"
        "overlay        1055762868 25573968 976485428   3% /"
    )

    uptime_output = "929.59 18510.26"

    result = parse_system_metrics(
        cpu_snapshot_1=cpu_snapshot_1,
        cpu_snapshot_2=cpu_snapshot_2,
        ram_output=ram_output,
        disk_output=disk_output,
        uptime_output=uptime_output,
    )

    assert result.cpu_usage == 50
    assert result.ram_usage == 5
    assert result.disk_total_gb == 1007
    assert result.disk_used_gb == 24
    assert result.uptime_seconds == 929