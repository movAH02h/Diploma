from fastapi import FastAPI, Request, Form, UploadFile, File
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates

app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("upload.html", {"request": request})


@app.post("/upload")
async def upload_file(audio_file: UploadFile = File(...)):
    return RedirectResponse(url="/success", status_code=303)


@app.get("/success")
async def success(request: Request):
    return templates.TemplateResponse("success.html", {"request": request})