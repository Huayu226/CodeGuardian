FROM python:3.10-slim

WORKDIR /app

# 安裝編譯工具 (llama-cpp-python 需要)
RUN apt-get update && apt-get install -y build-essential gcc g++

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

# 暴露 8000 port
EXPOSE 8000

# 啟動 FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]