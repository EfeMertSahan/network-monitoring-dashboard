from enum import Enum


class MetricPeriod(str, Enum):
    OneHour = "1h"
    SixHours = "6h"
    TwentyFourHours = "24h"
    SevenDays = "7d"