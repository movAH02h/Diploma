from typing import Dict, Any
from abc import ABC, abstractmethod
from app.logger import logger


class BaseService(ABC):
    def __init__(self, name: str="No name"):
        self.name = name or self.__class__.__name__
        self._next_service = None 


    def set_next(self, service: 'BaseService') -> 'BaseService':
        logger.debug("Set next service...")
        self._next_service = service
        return service


    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        logger.debug(f"Start of processing {self.name}")
        result = await self._process(data)
        logger.debug(f"End of processing {self.name}")

        if self._next_service:
            logger.debug(f"Switching to the {self._next_service.name} service...")
            return await self._next_service.process(result)
        return result


    @abstractmethod
    async def _process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        pass
