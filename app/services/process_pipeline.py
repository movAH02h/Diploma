import os
from typing import Any, Dict
from fastapi import HTTPException
from app.services.base_service import BaseService
from app.repository.audio import AudioRepository
from app.logger import logger

class ProcessPipeline(BaseService):
    def __init__(self, audio_repo: AudioRepository):
        super().__init__("ProcessPipeline")
        self.audio_repo = audio_repo

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        logger.debug(f"Start of processing {self.name}")
        result = await self._process(data)
        logger.debug(f"End of processing {self.name}")
        return result

    async def _process(self, data: Dict[str, Any]):
        try:
            audio_path = data.get("audio_path")
            file = data.get("file")
            if not file:
                raise HTTPException(status_code=400, detail="ProcessPipeline error: No file object in data")
            if not audio_path:
                raise HTTPException(status_code=400, detail="ProcessPipeline error: No audio_path in data")
            logger.debug("Save loaded file into temp folder...")
            with open(audio_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)

            if self._next_service:
                result = await self._next_service.process(data)
            else:
                result = data

            response = {
                "status": "success",
                "filename": file.filename
            }

            if "transcriptions" in result:
                response["transcriptions"] = result["transcriptions"]
                response["speakers"] = result.get("speakers", [])

                all_text = ""
                for speaker, trans_data in result["transcriptions"].items():
                    all_text += f"{speaker}: {trans_data['full_text']}\n\n"
                
                response["full_text"] = all_text.strip()
                logger.debug(f"Full text: {response['full_text']}")
            result_id = self.audio_repo.save_audio_result(file.filename, response)
            response["id"] = result_id
            return response

        except Exception as e:
            logger.error(f"ProcessPipeline error: {e}")
            raise HTTPException(500, f"Processing error {str(e)}")
        finally:
            if os.path.exists(audio_path):
                os.remove(audio_path)
                logger.debug(f"Removed temporary file: {audio_path}")
            