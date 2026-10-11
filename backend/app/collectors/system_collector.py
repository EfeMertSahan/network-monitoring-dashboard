#Linux sisteminden alınmış ham çıktıyı Metrics'e uygun Python değerlerine çevirmek.

from dataclasses import dataclass


@dataclass
class SystemMetricsResult:
    cpu_usage: int | None
    ram_usage: int | None
    disk_total_gb: int | None
    disk_used_gb: int | None
    uptime_seconds: int | None


def parse_cpu_snapshot( #CPU kullanımını almak için kullanılan fonksiyon.
    output: str,
) -> tuple[int, int] | None:
    parts = output.split()

    if len(parts) < 5:
        return None

    try:
        user = int(parts[1])
        system = int(parts[3])
        idle = int(parts[4])
    except ValueError:
        return None

    total = user + system + idle

    return total, idle


def calculate_cpu_usage( #CPU kullanımını hesaplamak için kullanılan fonksiyon.
    first_snapshot: tuple[int, int],
    second_snapshot: tuple[int, int],
) -> int | None:
    first_total, first_idle = first_snapshot
    second_total, second_idle = second_snapshot

    total_difference = second_total - first_total
    idle_difference = second_idle - first_idle

    if total_difference <= 0:
        return None

    usage = (
        (total_difference - idle_difference)
        / total_difference
    ) * 100

    return round(usage)


def parse_ram_usage( #RAM kullanımını almak için kullanılan fonksiyon.
    output: str,
) -> int | None:
    lines = output.strip().splitlines()

    ram_line = None

    for line in lines:
        if line.strip().startswith("Mem:"):
            ram_line = line
            break

    if ram_line is None:
        return None

    parts = ram_line.split()

    if len(parts) < 7:
        return None

    try:
        total = int(parts[1])
        available = int(parts[6])
    except ValueError:
        return None

    if total <= 0:
        return None

    usage = (
        (total - available)
        / total
    ) * 100

    return round(usage)


def parse_disk_usage( #Disk kullanımını almak için kullanılan fonksiyon.
    output: str,
) -> tuple[int | None, int | None]:
    lines = output.strip().splitlines()

    if len(lines) < 2:
        return None, None

    parts = lines[1].split()

    if len(parts) < 3:
        return None, None

    try:
        total = int(parts[1])
        used = int(parts[2])
    except ValueError:
        return None, None

    total_gb = round(
        total / 1024 / 1024
    )

    used_gb = round(
        used / 1024 / 1024
    )

    return total_gb, used_gb


def parse_uptime( #Uptime'i almak için kullanılan fonksiyon.
    output: str,
) -> int | None:
    parts = output.split()

    if not parts:
        return None

    try:
        return int(
            float(parts[0])
        )
    except ValueError:
        return None


def parse_system_metrics( #Sistem metriklerini almak için kullanılan fonksiyon.
    cpu_snapshot_1: str,
    cpu_snapshot_2: str,
    ram_output: str,
    disk_output: str,
    uptime_output: str,
) -> SystemMetricsResult:
    first_snapshot = parse_cpu_snapshot(
        cpu_snapshot_1
    )

    second_snapshot = parse_cpu_snapshot(
        cpu_snapshot_2
    )

    cpu_usage = None

    if (
        first_snapshot is not None
        and second_snapshot is not None
    ):
        cpu_usage = calculate_cpu_usage(
            first_snapshot,
            second_snapshot,
        )

    disk_total_gb, disk_used_gb = parse_disk_usage(
        disk_output
    )

    return SystemMetricsResult(
        cpu_usage=cpu_usage,
        ram_usage=parse_ram_usage(
            ram_output
        ),
        disk_total_gb=disk_total_gb,
        disk_used_gb=disk_used_gb,
        uptime_seconds=parse_uptime(
            uptime_output
        ),
    )