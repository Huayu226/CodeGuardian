🛡️ CodeGuardian - 本地端 AI 安全程式碼守衛
CodeGuardian 是一個重視隱私的 VS Code 擴充功能。透過容器化技術 (Podman) 整合本地端 AI 模型 (DeepSeek-Coder)，在完全不聯網、資料不出內網的前提下，提供程式碼解釋、除錯與資安掃描功能。

✨ 核心功能
🔍 資安弱點掃描 (Security Audit)：自動檢測 SQL Injection, XSS, Hardcoded Secrets 等漏洞。

🐛 智慧除錯 (Intelligent Debugging)：分析錯誤代碼並提供修正建議。

📖 程式碼解釋 (Code Explain)：以架構師視角解析複雜邏輯。

🔒 資料隱私 (Privacy First)：所有運算皆在本地 Podman 容器內完成，零資料外洩風險。

🛠️ 環境需求 (Prerequisites)
在執行此專案前，請確保您的電腦已安裝以下軟體：

Visual Studio Code

Node.js (用於編譯擴充功能)

Podman Desktop (或 Docker Desktop)

Git

🚀 安裝與執行指南 (Setup Guide)
由於模型檔案過大，無法上傳至 GitHub，請務必依照以下步驟操作：

步驟 1：下載 AI 模型 (重要！)
本專案使用 DeepSeek-Coder-V2-Lite-Instruct 的 GGUF 量化版本。

請至 Hugging Face 下載模型檔 (約 5~10 GB)：

下載連結 (範例) (建議選擇 Q4_K_M.gguf 版本)

在專案根目錄下建立一個資料夾名為 models。

將下載的 .gguf 檔案放入 models 資料夾中。

步驟 2：啟動後端伺服器 (Backend)
開啟終端機 (Terminal)，進入專案目錄，執行以下指令：

Bash

# 1. 啟動 Podman 虛擬機 (若尚未啟動)
podman machine start

# 2. 建置映像檔 (Image)
# 注意：這會讀取目錄下的 Containerfile (或 Dockerfile)
podman build -t code-guardian-backend .

# 3. 執行容器 (Container)
# 請確保將本地的 models 資料夾掛載進去
# Windows PowerShell 指令:
podman run -d -p 8000:8000 -v ${PWD}/models:/app/models code-guardian-backend

# 檢查是否運行成功
podman ps
步驟 3：啟動前端擴充功能 (Frontend)
在 VS Code 中開啟本專案資料夾。

安裝依賴套件：

Bash

npm install
按下 F5 鍵（或點擊左側「執行與偵錯」 -> 選擇 "VS Code Extension Development"）。

這時會跳出一個新的 VS Code 視窗 [Extension Development Host]。

🎮 如何使用 (Usage)
在跳出的測試視窗中，開啟任意程式碼檔案 (Python, JS 等)。

反白選取 您想要分析的程式碼片段。

點擊滑鼠右鍵，您會看到 CodeGuardian 的選單：

CodeGuardian: 解釋程式碼

CodeGuardian: 幫我 Debug

CodeGuardian: 資安弱點掃描

點擊功能後，右下角會出現進度條，分析完成後將自動開啟 Markdown 報告視窗。

📂 專案結構
Plaintext

CodeGuardian/
├── src/                # VS Code Extension 原始碼 (TypeScript)
│   └── extension.ts    # 前端核心邏輯
├── models/             # 放 .gguf 模型檔的地方 (Git ignored)
├── main.py             # Python FastAPI 後端伺服器
├── Containerfile       # 容器建置腳本 (Dockerfile)
├── package.json        # 專案設定檔
└── README.md           # 說明文件
⚠️ 常見問題排除
錯誤：target machine actively refused it

解法：請確認 Podman Machine 是否已啟動 (podman machine start)。

錯誤：找不到模型檔案

解法：請確認您已下載 .gguf 檔並放入 models 資料夾，且 podman run 指令有正確掛載 -v 參數。
