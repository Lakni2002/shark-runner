// Login / Register page.
// This page only shows the form and checks the input. Talking to the server is done by authService,
// and what happens after login is decided by App (through onLoggedIn) – low coupling.
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
// Images in /assets/login/ – exported from my Figma design.
import { useState } from "react";
import TextField from "../components/TextField";
import Bubbles from "../components/Bubbles";
import { login, register } from "../api/authService";

export default function AuthPage({ onLoggedIn }) {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({}); // messages under each field
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  // Tab click EVENT: switch between Login and Register
  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setServerError("");
  };

  // Check the form before sending (the server checks again – never trust the browser)
  const validate = () => {
    const e = {};
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) e.username = "3–20 letters, numbers or _";
    if (password.length < 8) e.password = "At least 8 characters";
    if (isRegister && confirm !== password) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Form submit EVENT (button click or Enter key)
  const handleSubmit = async (event) => {
    event.preventDefault(); // stop the browser reloading the page
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const user = isRegister ? await register(username, password) : await login(username, password, remember);
      onLoggedIn(user); // tell App who logged in
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0d5f8f] font-ui">
      <img src="/assets/login/background.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <Bubbles count={14} />

      <div className="relative z-10 flex min-h-dvh items-center justify-center p-4">
        <section className="w-full max-w-[440px] rounded-3xl bg-linear-to-b from-[#f4f7ff] to-[#b7d2f6] px-6 py-8 text-center shadow-2xl sm:px-9">
          <img src="/assets/login/logo.png" alt="" className="mx-auto h-16 w-auto" />
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Shark Runner</h1>
          <p className="mt-1 text-sm text-slate-600">Swim fast. Eat fish. Dodge mines. Solve puzzles.</p>

          {/* Tabs */}
          <div role="tablist" className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-[#0b1a3a] p-1">
            {["login", "register"].map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={mode === tab}
                onClick={() => switchMode(tab)}
                className={`rounded-md py-2 text-sm font-semibold transition ${
                  mode === tab ? "bg-[#4f5bf5] text-white" : "text-white/80 hover:text-white"
                }`}
              >
                {tab === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <TextField
              label="Username"
              value={username}
              onChange={setUsername}
              error={errors.username}
              autoComplete="username"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
            {isRegister && (
              <TextField
                label="Confirm password"
                type="password"
                value={confirm}
                onChange={setConfirm}
                error={errors.confirm}
                autoComplete="new-password"
              />
            )}

            {!isRegister && (
              <label className="flex items-center gap-2 text-left text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-[#4f5bf5]"
                />
                Remember me
              </label>
            )}

            {serverError && (
              <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-lg bg-[#4f5bf5] font-semibold text-white transition hover:bg-[#3f4be0]
                focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#4f5bf5]/40 disabled:opacity-60"
            >
              {loading ? "Please wait…" : isRegister ? "Create account" : "Dive In"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
