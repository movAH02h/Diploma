import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.audio_processing import router as audio_processing_router
from app.api.v1.results_processing import router as results_processing_router
from app.schemas import settings
from app.models import model_manager
from app.database import engine
from app.models import Base

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
    model_manager.load()
    yield
    model_manager.unload()


app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan,
    docs_url=None if settings.IS_PRODUCTION else "/docs",
    redoc_url=None if settings.IS_PRODUCTION else "/redoc"
)


@app.get('/favicon.ico', include_in_schema=False)
async def favicon():
    return Response(status_code=204)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audio_processing_router, prefix="/api/v1")
app.include_router(results_processing_router, prefix="/api/v1")

frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend"))
if os.path.exists(frontend_path):
    print(f"Frontend folder found: {frontend_path}")
    static_path = os.path.join(frontend_path, ".next", "static")
    if os.path.exists(static_path):
        app.mount("/static", StaticFiles(directory=static_path), name="static")
else:
    print("Frontend folder not found")
