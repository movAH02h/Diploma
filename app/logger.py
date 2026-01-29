import logging

class Logger():
    def __init__(self):
        self.logger = None # lazy initialization
        self.logger_level = logging.INFO 


    def change_logger_level(self, level: str) -> None:
        if level == "DEBUG":
            self.logger_level = logging.DEBUG
        elif level == "INFO":
            self.logger_level = logging.INFO
        elif level == "ERROR":
            self.logger_level = logging.ERROR

        self.logger.setLevel(self.logger_level)

    @property
    def logger(self):
        if self.logger is None:
            self.logger = logging.getLogger(__name__)
        return self.logger


    def debug(self, message: str):
        self.logger.debug(message)
    
    
    def info(self, message: str):
        self.logger.info(message)
    

    def error(self, message: str):
        self.logger.error(message)
    
