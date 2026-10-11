#Bu dosyanın görevi merkezi loglama sistemi oluşturmak.
#Projedeki bütün uygulama loglarını tek bir logger üzerinden yönetmek.

import logging


LOGGER_NAME = "network-monitor"


def configure_logger() -> logging.Logger:
    logger = logging.getLogger(
        LOGGER_NAME
    )

    # Uygulama reload edildiğinde aynı logger'a
    # tekrar tekrar handler eklenmesini önler.
    if logger.handlers:
        return logger

    logger.setLevel(
        logging.INFO
    )

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )

    handler = logging.StreamHandler()

    handler.setFormatter(
        formatter
    )

    logger.addHandler(
        handler
    )

    # Paramiko bağlantı hatalarının kendi traceback'lerini
    # terminale tekrar tekrar basmasını önler.
    paramiko_logger = logging.getLogger(
        "paramiko"
    )

    paramiko_logger.setLevel(
        logging.CRITICAL
    )

    logger.propagate = False

    return logger


logger = configure_logger()