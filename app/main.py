import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.audio_processing import router as audio_processing_router
from app.api.v1.results_processing import router as results_processing_router
from app.schemas import settings
from app.models import model_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
    model_manager.load()
    yield
    model_manager.unload()


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audio_processing_router)
app.include_router(results_processing_router)

frontend_path = os.path.join(os.path.dirname(__file__), "../frontend")
if os.path.exists(frontend_path):
    print(f"Folder with frontend found: {frontend_path}")
else:
    print(f"Folder {frontend_path} not found")

if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
