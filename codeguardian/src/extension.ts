import * as vscode from 'vscode';
import fetch from 'node-fetch'; // 如果報錯，執行 npm install node-fetch 

export function activate(context: vscode.ExtensionContext) {

    console.log('CodeGuardian is active!');

    let disposable = vscode.commands.registerCommand('code-guardian.explainCode', async () => {

        // 1. 取得編輯器物件
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // 2. 取得使用者選取的文字
        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text) {
            vscode.window.showWarningMessage('請先選取一段程式碼！');
            return;
        }

        // 3. 顯示進度條
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "CodeGuardian 正在思考...",
            cancellable: false
        }, async (progress) => {
            try {
                const prompt = `
                作為一個資深軟體架構師，請詳細解釋以下程式碼的邏輯與功能：
                ${text}
                請依序回答以下內容，並使用繁體中文：
                1. **邏輯摘要**：用一句話概括這段程式碼的核心目的。
                2. **逐行解析**：針對關鍵邏輯進行技術面解讀（不需要解釋基礎語法，專注於演算法或業務邏輯）。
                3. **設計思維**：說明這段程式碼使用了什麼設計模式或技巧（若有）。
                `;

                // 2. 發送請求給 Podman 後端 (localhost:8000)

                const response = await fetch('http://localhost:8000/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: prompt, 
                        max_tokens: 1024 
                    })
                });

                const data = await response.json() as any;
                const result = data.result;

                // 3. 顯示結果 (這裡用一個新的唯讀文件顯示，比較清楚)
                
                const doc = await vscode.workspace.openTextDocument({
                    content: result,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });

            } catch (error) {
                vscode.window.showErrorMessage(`連線失敗: 請確認 Podman 容器是否已啟動。錯誤訊息: ${error}`);
            }
        });
    });

    context.subscriptions.push(disposable);
    // 註冊第二個功能：Debug 與修正
    let debugDisposable = vscode.commands.registerCommand('code-guardian.fixBug', async () => {
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text) {
            vscode.window.showWarningMessage('請先選取一段要除錯的程式碼！');
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "CodeGuardian 正在診斷錯誤...",
            cancellable: false
        }, async (progress) => {
            try {
                // --- 這裡是最關鍵的 Prompt 設計 ---
                // 我們要求 AI 依照特定格式輸出，包含原因、修正碼、與差異
                const prompt = `
                作為一個專業的程式碼除錯專家，請分析以下程式碼：
                ${text}
                請依序回答以下三點：
                1. **錯誤原因**：具體指出哪裡寫錯了，或是邏輯有什麼漏洞。
                2. **修正後的程式碼**：請提供完整且正確的程式碼 (請用 Markdown code block 包裹)。
                3. **修改對照說明**：簡單說明修改前後的差異 (例如：原本是用 X 方法，改成 Y 方法)。
                請使用繁體中文回答。
                `;

                // 發送請求給後端
                const response = await fetch('http://localhost:8000/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: prompt,
                        max_tokens: 1024  // Debug 需要吐出完整的 code，所以 token 要設大一點
                    })
                });

                const data = await response.json() as any;
                
                // 顯示結果
                const doc = await vscode.workspace.openTextDocument({
                    content: data.result,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });

            } catch (error) {
                vscode.window.showErrorMessage(`除錯失敗: ${error}`);
            }
        });
    });

    context.subscriptions.push(debugDisposable); // 記得把新指令加入訂閱清單！

    let securityDisposable = vscode.commands.registerCommand('code-guardian.scanSecurity', async () => {
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text) {
            vscode.window.showWarningMessage('請先選取一段程式碼進行掃描！');
            return;
        }

        // 顯示進度條
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "CodeGuardian 正在進行資安審計...",
            cancellable: false
        }, async (progress) => {
            try {
                const prompt = `
                你是資深網路安全專家 (Cybersecurity Expert)。請針對以下程式碼進行嚴格的「安全性審計 (Security Audit)」：
                ${text}
                請使用繁體中文，並依序回答以下三點：
                1. **潛在風險 (Vulnerabilities)**：具體指出程式碼中存在的安全漏洞（例如 SQL Injection, XSS, CSRF, Hardcoded Secrets, Buffer Overflow 等）。
                2. **攻擊場景 (Attack Scenario)**：簡述駭客可能會如何利用這個漏洞進行攻擊。
                3. **修補建議 (Remediation)**：請提供修補後的安全程式碼版本 (使用 Markdown code block)，並說明修補原理。
                `;

                // 發送請求給後端
                const response = await fetch('http://localhost:8000/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: prompt,
                        max_tokens: 1024 // 資安分析通常需要講比較多話，設大一點
                    })
                });

                const data = await response.json() as any;
                
                // 顯示結果
                const doc = await vscode.workspace.openTextDocument({
                    content: data.result,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });

            } catch (error) {
                vscode.window.showErrorMessage(`資安掃描失敗: ${error}`);
            }
        });
    });

    context.subscriptions.push(securityDisposable); // 記得加入這行！

    let customDisposable = vscode.commands.registerCommand('code-guardian.askCustom', async () => {
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text) {
            vscode.window.showWarningMessage('請先選取一段程式碼！');
            return;
        }

        // 1. 跳出輸入框詢問使用者
        const userInstruction = await vscode.window.showInputBox({
            placeHolder: "例如：將這段程式碼轉成 Java、幫我加上詳細註解、優化效能...",
            prompt: "你想對這段程式碼做什麼？"
        });

        // 如果使用者按 Esc 取消，就直接結束
        if (!userInstruction) { return; }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "CodeGuardian 正在執行您的指令...",
            cancellable: false
        }, async (progress) => {
            try {
                const prompt = `
                你是一個專業的程式碼助手。請針對以下程式碼，執行使用者的要求。
                **使用者要求**：${userInstruction}
                **程式碼內容**：
                ${text}
                請直接輸出結果，並使用 Markdown 格式。
                `;

                // 3. 發送請求給後端
                const response = await fetch('http://localhost:8000/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: prompt,
                        max_tokens: 1024
                    })
                });

                const data = await response.json() as any;
                
                const doc = await vscode.workspace.openTextDocument({
                    content: data.result,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });

            } catch (error) {
                vscode.window.showErrorMessage(`執行失敗: ${error}`);
            }
        });
    });

    context.subscriptions.push(customDisposable);
}

export function deactivate() {}