// ===============================
// AI CODING AGENT PRO v2.0
// ===============================

// INPUT
const code = document.getElementById("code");
const result = document.getElementById("result");
const preview = document.getElementById("preview");

// TOP CONTROLS
const provider = document.getElementById("provider");
const model = document.getElementById("model");
const language = document.getElementById("language");

// BUTTONS
const generateBtn = document.getElementById("generateBtn");
const codeBtn = document.getElementById("codeBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const fixBtn = document.getElementById("fixBtn");
const explainBtn = document.getElementById("explainBtn");

const previewBtn = document.getElementById("previewBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const speakBtn = document.getElementById("speakBtn");
const clearBtn = document.getElementById("clearBtn");
const askBtn = document.getElementById("askBtn");
const micBtn = document.getElementById("micBtn");

// ===============================
// APP STATE
// ===============================

const App = {

    isLoading: false,

    lastResponse: "",

    conversation: [],

    currentProvider: () => provider.value,

    currentModel: () => model.value,

    currentLanguage: () => language.value

};

// ===============================
// Text To Speech
// ===============================

function speak(text){

    if(!("speechSynthesis" in window)){
        showError("Speech is not supported on this device.");
        return;
    }

    speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance(text);

    msg.text = text;
    msg.lang = "en-US";
    msg.rate = 1;
    msg.pitch = 1;
    msg.volume = 1;

    speechSynthesis.speak(msg);

}

// ===============================
// Show Loading
// ===============================

function loading(){

    result.innerHTML = `
    <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        gap:10px;
        padding:20px;
        font-size:18px;
        color:#38bdf8;
        font-weight:bold;
    ">
        <span class="loader"></span>
        AI is thinking...
    </div>
    `;

}

// ===============================
// Show Error
// ===============================

function showError(message){

    result.innerHTML = `
    <div style="
        background:#7f1d1d;
        color:white;
        padding:15px;
        border-radius:10px;
        border:1px solid #ef4444;
box-shadow:0 0 15px rgba(239,68,68,0.3);
font-weight:bold;
text-align:center;
    ">
        ❌ ${message}
    </div>
    `;

}
function showSuccess(message){

    result.innerHTML = `
    <div style="
        background:#14532d;
        color:white;
        padding:15px;
        border-radius:10px;
        border:1px solid #22c55e;
box-shadow:0 0 15px rgba(34,197,94,0.3);
font-weight:bold;
text-align:center;
    ">
        ✅ ${message}
    </div>
    `;

}
// ===============================
// Typing Animation
// ===============================

async function typeWriter(text){

    result.textContent = "";

    for(let i = 0; i < text.length; i++){

        result.textContent += text[i];

        await new Promise(resolve => setTimeout(resolve, 8));

    }

}
// ===============================
// Button Manager
// ===============================

function setButtons(disabled){

    generateBtn.disabled = disabled;
    codeBtn.disabled = disabled;
    analyzeBtn.disabled = disabled;
    fixBtn.disabled = disabled;
    explainBtn.disabled = disabled;
    previewBtn.disabled = disabled;
    copyBtn.disabled = disabled;
    downloadBtn.disabled = disabled;
    speakBtn.disabled = disabled;
    clearBtn.disabled = disabled;
    askBtn.disabled = disabled;
    micBtn.disabled = disabled;

}
// ===============================
// INPUT VALIDATION
// ===============================

function validateInput(message = "Please enter your request."){

    const input = code.value.trim();

    if(input === ""){

        showError(message);

        return null;

    }

    return input;

}

// ===============================
// Provider Service
// ===============================

function getProviderConfig() {

    const supported = ["gemini", "openrouter"];

    if (supported.includes(App.currentProvider())) {

        return { type: App.currentProvider() };

    }

    return null;

}

// ===============================
// AI Request
// ===============================

async function askAI(prompt) {

    if (!prompt || prompt.trim() === "") {

        showError("Prompt cannot be empty.");

        return;

    }

    if (App.isLoading) {

        return;

    }

    loading();
    App.isLoading = true;

    try {

        const config = getProviderConfig();

        if (!config) {

            showError("Provider not supported.");

            return null;

        }

        const response = await fetch("/api/ask", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                prompt: prompt,
                provider: config.type,
                model: App.currentModel()
            })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.error?.message || data.error || "API Error");

        }

        if (config.type === "gemini") {

            return data.candidates[0].content.parts[0].text;

        }

        return data.choices[0].message.content;

    }

    catch (error) {

        showError(error.message);

        return null;

    }

    finally {

        App.isLoading = false;
        setButtons(false);

    }

}


// ===============================
// Show AI Response
// ===============================

async function runPrompt(prompt){

    try{

        setButtons(true);

        const answer = await askAI(prompt);

        if(!answer){
            setButtons(false);
            return;
        }

        await typeWriter(answer);
        App.lastResponse = answer;

        if(
            answer.includes("<html") ||
            answer.includes("<!DOCTYPE html") ||
            answer.includes("<body") ||
            answer.includes("<div")
        ){

            preview.srcdoc = answer;

        }

    }

    catch(error){

        showError(error.message);

    }

    finally{

        setButtons(false);

    }

}

// ===============================
// Prompt Builder
// ===============================

function buildPrompt(type, userInput){
const selectedLanguage = language.value;

const languageInstruction =
selectedLanguage === "Auto Detect"
? ""
: `

IMPORTANT:
Generate all code in ${selectedLanguage} language only.

`;
    switch(type){

        case "website":

            return `
You are an expert Full Stack Web Developer.

Create a modern responsive website.

Requirements:

${userInput}

Return ONLY HTML code with embedded CSS and JavaScript.

Do not write explanations.
`;

        case "code":

            return `
You are an expert programmer.

Generate clean production-ready code.

Task:

${userInput}
${languageInstruction}
Return ONLY code.
`;

        case "analyze":

            return `
Analyze the following code.

Explain:
- Errors
- Bugs
- Improvements

Code:

${userInput}
`;

        case "fix":

            return `
Fix the following code.

Return ONLY corrected code.

${userInput}
`;

        case "explain":

            return `
Explain this code line by line in simple language.

${userInput}
`;

        default:

            return userInput;

    }

}

// ===============================
// Generate Website
// ===============================

generateBtn.addEventListener("click", () => {

    const input = validateInput();

    if(!input) return;

    runPrompt(buildPrompt("website", input));

});

// ===============================
// Generate Code
// ===============================

codeBtn.addEventListener("click", () => {

    const input = validateInput();

    if(!input) return;

    runPrompt(buildPrompt("code", input));

});

// ===============================
// Analyze Code
// ===============================

analyzeBtn.onclick = () => {

    const input = validateInput("Please enter some code.");

    if(!input) return;

    runPrompt(buildPrompt("analyze", input));

};

// ===============================
// Fix Code
// ===============================

fixBtn.onclick = () => {

    const input = validateInput("Please enter some code.");

    if(!input) return;

    runPrompt(buildPrompt("fix", input));

};

// ===============================
// Explain Code
// ===============================

explainBtn.onclick = () => {

    const input = validateInput("Please enter some code.");

    if(!input) return;

    runPrompt(buildPrompt("explain", input));

};

// ===============================
// Copy Result
// ===============================

copyBtn.onclick = async () => {

    const text = result.innerText.trim();

    if(text === ""){

        showError("Nothing to copy.");

        return;

    }

    try{

        await navigator.clipboard.writeText(text);

        showSuccess("Copied Successfully!");

    }

    catch(error){

        showError("Copy Failed!");

    }

};

// ===============================
// Download Result
// ===============================

downloadBtn.onclick = () => {

    const text = result.innerText.trim();

    if(text === ""){

        showError("Nothing to download.");

        return;

    }

    const isHTML = text.includes("<!DOCTYPE html") || text.includes("<html");

    const fileName = isHTML ? "website.html" : "AI_Output.txt";

    const fileType = isHTML ? "text/html" : "text/plain";

    const blob = new Blob([text],{

        type: fileType

    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = fileName;

    link.click();

    URL.revokeObjectURL(link.href);

    showSuccess("Done! File downloaded successfully.");

};

// ===============================
// Speak Result
// ===============================

speakBtn.onclick = () => {

    const text = result.innerText.trim();

    if(text === ""){

        showError("Nothing to speak.");

        return;

    }

    speak(text);

};
// ===============================
// Clear
// ===============================

clearBtn.onclick = () => {

    code.value = "";

    result.textContent = "";

    preview.srcdoc = "";

    speechSynthesis.cancel();

    App.lastResponse = "";
    App.conversation = [];

};

// ===============================
// Live Preview
// ===============================

previewBtn.onclick = () => {

    if(result.textContent.trim() === ""){

        showError("Generate a website first.");

        return;

    }

    preview.srcdoc = result.textContent;

};

// ===============================
// Append Chat Message
// ===============================

function appendMessage(role, text){

    const div = document.createElement("div");

    div.className = role === "user" ? "user-message" : "ai-message";

    div.textContent = text;

    result.appendChild(div);

    result.scrollTop = result.scrollHeight;

    return div;

}

// ===============================
// Chat Ask
// ===============================

async function askChat(){

    const input = code.value.trim();

    if(input === ""){
        showError("Please type a message.");
        return;
    }

    if(App.isLoading) return;

    appendMessage("user", input);
    code.value = "";

    App.conversation.push({ role: "user", content: input });

    App.isLoading = true;
    setButtons(true);

    const thinkingBubble = appendMessage("ai", "AI is thinking...");

    try {

        const config = getProviderConfig();

        if(!config){
            thinkingBubble.textContent = "Provider not supported.";
            return;
        }

        const response = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: App.conversation,
                provider: config.type,
                model: App.currentModel()
            })
        });

        const data = await response.json();

        if(!response.ok){
            throw new Error(data.error?.message || data.error || "API Error");
        }

        let answer;

        if(config.type === "gemini"){
            answer = data.candidates[0].content.parts[0].text;
        } else {
            answer = data.choices[0].message.content;
        }

        thinkingBubble.textContent = answer;

        App.conversation.push({ role: "assistant", content: answer });

        speak(answer);

    } catch(error){

        thinkingBubble.textContent = "❌ " + error.message;

    } finally {

        App.isLoading = false;
        setButtons(false);

    }

}

askBtn.addEventListener("click", askChat);

// ===============================
// Voice Input (Speech to Text)
// ===============================

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        micBtn.textContent = "🎙 Listening...";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        code.value = transcript;
        askChat();
    };

    recognition.onerror = () => {
        showError("Could not hear you. Try again.");
    };

    recognition.onend = () => {
        micBtn.textContent = "🎤 Speak to Ask";
    };

    micBtn.addEventListener("click", () => {
        recognition.start();
    });

} else {

    micBtn.addEventListener("click", () => {
        showError("Voice input is not supported on this browser.");
    });

}

// ===============================
// Enter Key Support
// ===============================

code.addEventListener("keydown",function(e){

    if(e.ctrlKey && e.key==="Enter"){

        generateBtn.click();

    }

});

console.log("✅ AI Coding Agent Loaded Successfully");
