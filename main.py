from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from llama_cpp import Llama
import os

app = FastAPI()

# 從 Volume 掛載的路徑讀取模型
MODEL_PATH = "/models/model.gguf"

# 初始化模型 (n_gpu_layers=0 表示純 CPU，若要用 GPU 需額外設定)
# n_ctx=2048 是上下文長度，寫程式建議設大一點
try:
    llm = Llama(model_path=MODEL_PATH, n_ctx=4096, n_gpu_layers=0)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    llm = None

class QueryRequest(BaseModel):
    prompt: str
    max_tokens: int = 512

@app.post("/generate")
async def generate_code(request: QueryRequest):
    if not llm:
        raise HTTPException(status_code=500, detail="Model not loaded")

    formatted_prompt = f"### Instruction:\n{request.prompt}\n### Response:\n"

    output = llm(
        formatted_prompt,
        max_tokens=request.max_tokens,
        stop=["### Instruction:", "### Response:"],
        echo=False
    )

    return {"result": output["choices"][0]["text"]}

@app.get("/health")
def health_check():
    return {"status": "ok"}