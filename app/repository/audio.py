from typing import Dict, Any, List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models

class AudioRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_audio_result(self, file_name: str, result_data: Dict[str, Any]) -> int:
        # Проверяем, нет ли уже файла с таким именем (опционально)
        existing = self.db.query(models.AudioResult).filter(models.AudioResult.filename == file_name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Such file already exists")

        audio_result = models.AudioResult(
            filename=file_name,
            status=result_data.get("status", "success"),
            full_text=result_data.get("full_text", "")
        )
        self.db.add(audio_result)
        self.db.flush()  # чтобы получить id

        # Сохраняем сегменты по спикерам
        transcriptions = result_data.get("transcriptions", {})
        for speaker_label, trans_data in transcriptions.items():
            speaker = models.Speaker(
                audio_result_id=audio_result.id,
                label=speaker_label
            )
            self.db.add(speaker)
            self.db.flush()

            for seg in trans_data.get("segments", []):
                segment = models.TranscriptionSegment(
                    speaker_id=speaker.id,
                    start_time=seg["start"],
                    end_time=seg["end"],
                    text=seg["text"]
                )
                self.db.add(segment)

        self.db.commit()
        return audio_result.id

    def get_audio_result(self, result_id: int) -> Dict[str, Any]:
        audio_result = self.db.query(models.AudioResult).filter(models.AudioResult.id == result_id).first()
        if not audio_result:
            raise HTTPException(status_code=404, detail="Result not found")

        # Формируем ответ в том же формате, что ожидает фронтенд
        response = {
            "id": audio_result.id,
            "filename": audio_result.filename,
            "status": audio_result.status,
            "full_text": audio_result.full_text,
            "created_at": audio_result.created_at.isoformat(),
            "transcriptions": {}
        }
        for speaker in audio_result.speakers:
            segments = []
            for seg in speaker.segments:
                segments.append({
                    "start": seg.start_time,
                    "end": seg.end_time,
                    "text": seg.text
                })
            response["transcriptions"][speaker.label] = {
                "full_text": " ".join(seg["text"] for seg in segments),
                "segments": segments
            }
        return response

    def get_all_audio_results(self) -> List[Dict[str, Any]]:
        results = self.db.query(models.AudioResult).order_by(models.AudioResult.created_at.desc()).all()
        return [
            {
                "id": r.id,
                "filename": r.filename,
                "status": r.status,
                "created_at": r.created_at.isoformat(),
                "speakers_count": len(r.speakers)
            }
            for r in results
        ]
    
    def delete_all_audio_results(self) -> int:
        """Удаляет все результаты и возвращает количество удалённых записей."""
        count = self.db.query(models.AudioResult).delete()
        self.db.commit()
        return count
