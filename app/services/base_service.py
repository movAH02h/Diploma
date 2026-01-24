from typing import Dict, Any, Optional
from abc import ABC
import logging

class BaseService(ABC):
    def __init__(self, name: str):
        self.name = name or self.__class__.__name__
        self._logger = None
        self._next_service = None 
    
    @property
    def logger(self) -> logging.logger:
        if self._logger is None:
            self._logger = logging.getLogger(f"pipeline.{self.__class__.__name__}.{id(self)}")


    def set_next(self, service: 'BaseService') -> 'BaseService':
        self.logger.debug("Set next service...")
        self._next_service = service
        return service


    def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.logger.debug(f"Начало обработки {self.name}")
        result = self._process(data)
        self.logger.debug(f"Конец обработки {self.name}")

        if self._next_service:
            return self._next_service.process(result)
        return result
    

    @abstractmethod
    def _process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    
