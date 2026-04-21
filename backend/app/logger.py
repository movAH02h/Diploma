import logging
from app.schemas import settings


class Logger():
    def __init__(self):
        self._logger  = None
        self.logger_level = settings.LOG_LEVEL


    def set_level(self, level: str) -> None:
        if level == "DEBUG":
            self.logger_level = logging.DEBUG
        elif level == "INFO":
            self.logger_level = logging.INFO
        elif level == "ERROR":
            self.logger_level = logging.ERROR
        elif level == "WARNING":
            self.logger_level = logging.WARNING
        elif level == "CRITICAL":
            self.logger_level =   logging.CRITICAL

        self.logger.setLevel(self.logger_level)

    @property
    def logger(self):
        if self._logger is None:
            self._logger = logging.getLogger(__name__)
            if not self._logger.handlers:
                handler = logging.StreamHandler()
                formatter = logging.Formatter(
                    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
                )
                handler.setFormatter(formatter)
                self._logger.addHandler(handler)
                self._logger.setLevel(self.logger_level)
                self._logger.propagate = False
        return self._logger


    def debug(self, message: str):
        self.logger.debug(message)
    
    
    def info(self, message: str):
        self.logger.info(message)
    

    def error(self, message: str):
        self.logger.error(message)

logger = Logger()    
