document.addEventListener("DOMContentLoaded", () => {

  const loader = document.getElementById("loader");
  const showLoader = () => loader.style.display = "flex";
  const hideLoader = () => loader.style.display = "none";

  const form = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  /* =====================
     SOCIAL LOGIN
  ===================== */
  const socialLogin = (btnId, url) => {
    document.getElementById(btnId).addEventListener("click", () => {
      showLoader();
      setTimeout(() => window.location.href = url, 300);
    });
  };

  socialLogin("googleLogin", "http://localhost:5000/api/auth/google");

  /* =====================
     OAUTH REDIRECT HANDLER
  ===================== */
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    localStorage.setItem("token", token);
    showLoader();
    fetchUser(token);
    return; // stop normal login logic
  }

  /* =====================
     NORMAL LOGIN
  ===================== */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginBtn.disabled = true;
    showLoader();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Please enter both email and password");
      hideLoader();
      loginBtn.disabled = false;
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      redirectByRole(data.user);

    } catch (err) {
      alert(err.message || "Login failed");
      hideLoader();
      loginBtn.disabled = false;
    }
  });

  /* =====================
     HELPER FUNCTIONS
  ===================== */
  function redirectByRole(user) {
  if (user.role === "admin") {
    window.location.href = "/frontend/admin/dashboard.html";
  } 
  else if (user.role === "supervisor") {
    window.location.href = "/frontend/supervisor/dashboard.html";
  } 
  else {
    window.location.href = "/frontend/index2.html";
  }
}


  async function fetchUser(token) {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: "Bearer " + token }
      });

      const user = await res.json();

      if (!res.ok) throw new Error(user.message || "OAuth login failed");

      localStorage.setItem("user", JSON.stringify(user));
      redirectByRole(user);

    } catch {
      alert("OAuth login failed");
      hideLoader();
    }
  }

});
