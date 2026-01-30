from typing import Dict, Any, Optional
from abc import ABC
import logging
from app.logger import logger

class BaseService(ABC):
    def __init__(self, name: str = "No name"):
        self.name = name or self.__class__.__name__
        self._next_service = None 


    def set_next(self, service: 'BaseService') -> 'BaseService':
        logger.debug("Set next service...")
        self._next_service = service
        return service


    def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        logger.debug(f"Начало обработки {self.name}")
        result = self._process(data)
        logger.debug(f"Конец обработки {self.name}")

        if self._next_service:
            logger.debug(f"Переход к {self._next_service.name} сервису...")
            return self._next_service.process(result)
        return result


    @abstractmethod
    def _process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        pass
