import requests
import os
import logging
import asyncio

logger = logging.getLogger(__name__)


class LlamaService:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        
    def generate(self, prompt: str) -> str:
        """Send generate request to Ollama"""
        payload = {
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
        resp = requests.post(
            f"{self.base_url}/api/generate",
            json=payload,
            timeout=120
        )
        if resp.status_code != 200:
            raise Exception(f"Ollama error: {resp.status_code} - {resp.text}")
        data = resp.json()
        return data.get("response", "")
    
    async def generate_async(self, prompt: str) -> str:
        """Async wrapper for generate"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: self.generate(prompt))
    
    def generate_summary(self, text: str) -> str:
        """Generate summary of transcription"""
        prompt = f"""Ты — ассистент для анализа транскрибаций деловых встреч. 
Проанализируй следующую транскрипцию и сделай краткую сводку (3-5 предложений):
- Кто участвовал?
- Какие основные темы обсуждались?
- Какие решения были приняты?

ВАЖНО: Не используй Markdown-разметку (**, *, #, -, _ и т.д.). Используй только обычный текст.
Отвечай простым текстом без форматирования на русском языке.

Транскрипция:
{text}

Краткая сводка:"""
        
        return self.generate(prompt)
    
    async def generate_summary_async(self, text: str) -> str:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: self.generate_summary(text))
    
    def extract_key_points(self, text: str) -> str:
        """Extract key points from transcription"""
        prompt = f"""Ты — ассистент для анализа транскрибаций деловых встреч. 
Выпиши основные идеи и тезисы из транскрипции (5-7 пунктов):

ВАЖНО: Не используй Markdown-разметку (**, *, #, -, _ и т.д.). Используй только обычный текст.
Отвечай простым текстом без форматирования на русском языке. Для списка используй нумерацию (1., 2., 3. и т.д.).

Транскрипция:
{text}

Основные идеи:"""
        
        return self.generate(prompt)
    
    async def extract_key_points_async(self, text: str) -> str:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: self.extract_key_points(text))
    
    def answer_question(self, text: str, question: str) -> str:
        """Answer question about transcription"""
        prompt = f"""Ты — ассистент для анализа транскрибаций деловых встреч. 
Ответь на вопрос на основе предоставленной транскрипции. Если информации для ответа недостаточно, так и скажи.

ВАЖНО: Не используй Markdown-разметку (**, *, #, -, _ и т.д.). Используй только обычный текст.
Отвечай простым текстом без форматирования на русском языке.

Транскрипция:
{text}

Вопрос: {question}

Ответ:"""
        
        return self.generate(prompt)
    
    async def answer_question_async(self, text: str, question: str) -> str:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: self.answer_question(text, question))


llama_service = LlamaService()