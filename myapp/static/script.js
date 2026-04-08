
async function sendMessage() {
  const input = document.getElementById("chat-input");
  const box = document.getElementById("chat-box");
  const query = input.value.trim();
  if (!query) return;

  // Show User Message
  box.innerHTML += `
                <div class="flex justify-end">
                    <div class="chat-bubble-user p-3 px-4 text-sm max-w-[85%] text-white">
                        ${query}
                    </div>
                </div>
            `;

  const typingId = "typing-" + Date.now();
  box.innerHTML += `
                <div id="${typingId}" class="flex justify-start">
                    <div class="chat-bubble-ai p-3 px-4 text-sm text-slate-400 italic loading-dots">
                        Agent Thinking
                    </div>
                </div>
            `;

  input.value = "";
  box.scrollTop = box.scrollHeight;

  try {
    const response = await fetch("/api/chat/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query }),
    });

    const data = await response.json();
    const typingElem = document.getElementById(typingId);
    if (typingElem) typingElem.remove();

    if (data.status === "success") {
      let html = `<div class="flex justify-start"><div class="chat-bubble-ai p-4 text-sm max-w-[95%] space-y-3">`;
      html += `<p class="text-slate-200 leading-relaxed">${data.explanation}</p>`;

      if (data.code) {
        html += `<div class="mt-2"><p class="text-[10px] font-bold text-slate-500 mb-1">SUGGESTED CODE</p><pre><code>${data.code}</code></pre></div>`;
      }

      if (data.api_result?.status) {
        const s = data.api_result.status;
        const colorClass = s < 300 ? "text-green-400" : "text-red-400";
        html += `<div class="pt-2 border-t border-slate-700/50 flex items-center text-[10px] ${colorClass} font-bold uppercase">
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
    box.innerHTML += `<div class="text-red-500 text-xs px-4">Connection Failed. Verify Django server is running.</div>`;
  }
}

//file reading
async function uploadFile() {
  const fileInput = document.getElementById("swagger-upload");
  if (!fileInput.files[0]) return;

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const res = await fetch("/api/upload/", { method: "POST", body: formData });
    const data = await res.json();

    if (data.status === "success") {
      document.getElementById("doc-placeholder").classList.add("hidden");
      document.getElementById("doc-content").classList.remove("hidden");
      document.getElementById("doc-title").innerText = data.title;
      document.getElementById("doc-desc").innerText = data.description;

      const list = data.endpoints
        .map((e) => {
          const methodLower = e.method.toLowerCase();
          return `
                            <div class="flex items-center space-x-3 bg-slate-800/40 p-2 rounded-lg border border-slate-700/30">
                                <span class="method-badge method-${methodLower}">${e.method}</span>
                                <span class="text-[10px] font-mono text-slate-400">${e.path}</span>
                            </div>
                        `;
        })
        .join("");
      document.getElementById("endpoint-list").innerHTML = list;
    } else {
      console.error("Upload failed:", data.message);
    }
  } catch (err) {
    console.error("Fetch error during upload:", err);
  }
}

//api testing
async function runManualTest() {
  const statusBadge = document.getElementById("test-status");
  const resBox = document.getElementById("test-response");
  const method = document.getElementById("test-method").value;
  const url = document.getElementById("test-url").value;
  const bodyRaw = document.getElementById("test-body").value;

  if (!url) return;
  let body = null;
  if (bodyRaw.trim()) {
    try {
      body = JSON.parse(bodyRaw);
    } catch (e) {
      resBox.innerHTML = '<span class="text-red-400">Invalid JSON</span>';
      return;
    }
  }

  resBox.innerHTML =
    '<span class="loading-dots italic text-slate-500">Executing request</span>';
  statusBadge.classList.add("hidden");

  try {
    const res = await fetch("/api/test/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, url, body }),
    });

    const data = await res.json();
    const s = data.status || data.status_code || "ERR";

    statusBadge.innerText = s;
    statusBadge.classList.remove("hidden");

    if (s < 300) {
      statusBadge.className =
        "text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-900/30 text-green-400 border border-green-500/20";
    } else {
      statusBadge.className =
        "text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-900/30 text-red-400 border border-red-500/20";
    }

    const responseData = data.data || data.error || data;
    resBox.innerHTML = `<pre class="!mt-0 !bg-transparent !p-0"><code>${JSON.stringify(responseData, null, 2)}</code></pre>`;
  } catch (e) {
    resBox.innerHTML =
      '<span class="text-red-500">Execution Error. Check connection or CORS.</span>';
  }
}

//keyboard
document.getElementById("chat-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
