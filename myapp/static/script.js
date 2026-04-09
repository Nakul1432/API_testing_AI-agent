// 1. Helper to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// AI Agent Chat
async function sendMessage() {
    const input = document.getElementById("chat-input");
    const box = document.getElementById("chat-box");
    const query = input.value.trim();
    if (!query) return;

    box.innerHTML += `
        <div class="flex justify-end">
            <div class="chat-bubble-user p-3 px-4 text-sm max-w-[85%] text-white bg-zinc-700 rounded-2xl rounded-tr-none">
                ${query}
            </div>
        </div>`;

    const typingId = "typing-" + Date.now();
    box.innerHTML += `
        <div id="${typingId}" class="flex justify-start">
            <div class="chat-bubble-ai p-3 px-4 text-sm text-zinc-500 italic">
                Agent Thinking...
            </div>
        </div>`;

    input.value = "";
    box.scrollTop = box.scrollHeight;

    try {
        const response = await fetch("/api/chat/", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken // Added CSRF
            },
            body: JSON.stringify({ query: query }),
        });

        // Redirect to login if session expired (401 Unauthorized)
        if (response.status === 401) {
            window.location.href = "/accounts/login/";
            return;
        }

        const data = await response.json();
        const typingElem = document.getElementById(typingId);
        if (typingElem) typingElem.remove();

        if (data.status === "success") {
            let html = `<div class="flex justify-start"><div class="chat-bubble-ai p-4 text-sm max-w-[95%] space-y-3 bg-zinc-800 rounded-2xl rounded-tl-none border border-zinc-700">`;
            html += `<p class="text-zinc-200 leading-relaxed">${data.explanation}</p>`;

            if (data.code) {
                html += `<div class="mt-2"><p class="text-[10px] font-bold text-zinc-500 mb-1">SUGGESTED CODE</p><pre class="bg-black p-3 rounded-lg overflow-x-auto"><code class="text-emerald-400">${data.code}</code></pre></div>`;
            }

            if (data.api_result?.status) {
                const s = data.api_result.status;
                const colorClass = s < 300 ? "text-green-400" : "text-red-400";
                html += `<div class="pt-2 border-t border-zinc-700 flex items-center text-[10px] ${colorClass} font-bold uppercase">
                            <i class="fas fa-check-circle mr-1"></i> Verified Status: ${s}
                         </div>`;
            }

            html += `</div></div>`;
            box.innerHTML += html;
        } else {
            box.innerHTML += `<div class="text-red-400 text-xs px-4">Error: ${data.message}</div>`;
        }
        box.scrollTop = box.scrollHeight;
    } catch (err) {
        const typingElem = document.getElementById(typingId);
        if (typingElem) typingElem.remove();
        box.innerHTML += `<div class="text-red-500 text-xs px-4">Connection Failed.</div>`;
    }
}

// Swagger File Upload
async function uploadFile() {
    const fileInput = document.getElementById("swagger-upload");
    if (!fileInput.files[0]) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        const res = await fetch("/api/upload/", { 
            method: "POST", 
            headers: { "X-CSRFToken": csrftoken }, // Added CSRF
            body: formData 
        });

        if (res.status === 401) {
            window.location.href = "/accounts/login/";
            return;
        }

        const data = await res.json();
        if (data.status === "success") {
            document.getElementById("doc-placeholder").classList.add("hidden");
            document.getElementById("doc-content").classList.remove("hidden");
            document.getElementById("doc-title").innerText = data.title;
            document.getElementById("doc-desc").innerText = data.description;

            const list = data.endpoints.map((e) => {
                const methodLower = e.method.toLowerCase();
                return `
                    <div class="flex items-center space-x-3 bg-zinc-800/40 p-2 rounded-lg border border-zinc-700/30">
                        <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-zinc-700 text-white">${e.method}</span>
                        <span class="text-[10px] font-mono text-zinc-400">${e.path}</span>
                    </div>`;
            }).join("");
            document.getElementById("endpoint-list").innerHTML = list;
        }
    } catch (err) {
        console.error("Upload error:", err);
    }
}

// Manual API Testing
async function runManualTest() {
    const statusBadge = document.getElementById("test-status");
    const resBox = document.getElementById("test-response");
    const method = document.getElementById("test-method").value;
    const url = document.getElementById("test-url").value;
    const bodyRaw = document.getElementById("test-body").value;

    if (!url) return;
    let body = null;
    if (bodyRaw.trim()) {
        try { body = JSON.parse(bodyRaw); } 
        catch (e) { resBox.innerHTML = '<span class="text-red-400">Invalid JSON</span>'; return; }
    }

    resBox.innerHTML = '<span class="italic text-zinc-500">Executing...</span>';
    statusBadge.classList.add("hidden");

    try {
        const res = await fetch("/api/test/", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken // Added CSRF
            },
            body: JSON.stringify({ method, url, body }),
        });

        const data = await res.json();
        const s = data.status || data.status_code || "ERR";

        statusBadge.innerText = s;
        statusBadge.classList.remove("hidden");
        statusBadge.className = s < 300 
            ? "text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-900/30 text-green-400 border border-green-500/20"
            : "text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-900/30 text-red-400 border border-red-500/20";

        resBox.innerHTML = `<pre class="text-zinc-400"><code>${JSON.stringify(data.data || data, null, 2)}</code></pre>`;
    } catch (e) {
        resBox.innerHTML = '<span class="text-red-500">Execution Error.</span>';
    }
}

// Enter Key Listener
document.getElementById("chat-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});