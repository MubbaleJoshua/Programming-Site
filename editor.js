import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, collection, addDoc, doc, setDoc, getDoc } from "./firebase.js";

let editor;
let currentUser;

document.getElementById("theme").addEventListener("change", () => {
  const theme = document.getElementById("theme").value;
  monaco.editor.setTheme(theme);
});

// Firebase signup
window.signUp = async () => {
  const username = document.getElementById("signup-username").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    currentUser = userCredential.user;
    await setDoc(doc(db, "users", currentUser.uid), { username, email });
    alert("Account created!");
    showEditor();
  } catch (err) { alert(err.message); }
};

// Firebase login
window.login = async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    currentUser = userCredential.user;
    alert("Logged in!");
    showEditor();
  } catch (err) { alert(err.message); }
};

function showEditor() {
  document.getElementById("auth-container").style.display = "none";
  document.getElementById("editor-container").style.display = "block";
  initEditor();
}

function initEditor() {
  require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@latest/min/vs' } });
  require(['vs/editor/editor.main'], () => {
    editor = monaco.editor.create(document.getElementById('editor'), {
      value: "// Write your code here",
      language: "javascript",
      theme: document.getElementById("theme").value,
      automaticLayout: true
    });
  });
}

// Run code
window.runCode = async () => {
  const code = editor.getValue();
  const language = document.getElementById("language").value;
  const input = document.getElementById("stdin").value;

  if (language === "html") {
    document.getElementById("preview").srcdoc = code;
    return;
  }

  const res = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language, input })
  });
  const data = await res.json();
  document.getElementById("output").textContent = data.output;
};

// Save/Load
window.saveCode = async () => {
  const code = editor.getValue();
  await setDoc(doc(db, "codes", currentUser.uid), { code, language: document.getElementById("language").value });
  alert("Code saved!");
};

window.loadCode = async () => {
  const docRef = doc(db, "codes", currentUser.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    editor.setValue(data.code);
    document.getElementById("language").value = data.language;
    monaco.editor.setModelLanguage(editor.getModel(), data.language);
  } else { alert("No saved code found"); }
};