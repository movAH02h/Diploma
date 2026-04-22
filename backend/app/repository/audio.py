from typing import Dict, Any, List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models

class AudioRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_audio_result(self, user_id: int, file_name: str, result_data: Dict[str, Any]) -> int:
        existing = self.db.query(models.AudioResult).filter(
            models.AudioResult.user_id == user_id,
            models.AudioResult.filename == file_name
        ).first()
        if existing:
            self.db.delete(existing)
            self.db.flush()

        audio_result = models.AudioResult(
            user_id=user_id,
            filename=file_name,
            status=result_data.get("status", "success"),
            full_text=result_data.get("full_text", "")
        )
        self.db.add(audio_result)
        self.db.flush()

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

    def get_audio_result(self, result_id: int, user_id: int) -> Dict[str, Any]:
        audio_result = self.db.query(models.AudioResult).filter(
            models.AudioResult.id == result_id,
            models.AudioResult.user_id == user_id
        ).first()
        if not audio_result:
            raise HTTPException(status_code=404, detail="Result not found")

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

    def get_audio_results_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        results = self.db.query(models.AudioResult).filter(
            models.AudioResult.user_id == user_id
        ).order_by(models.AudioResult.created_at.desc()).all()
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
    
    def delete_all_audio_results_by_user(self, user_id: int) -> int:
        count = self.db.query(models.AudioResult).filter(
            models.AudioResult.user_id == user_id
        ).delete()
        self.db.commit()
        return count
