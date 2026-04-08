const form = document.getElementById("blogForm");
const token = localStorage.getItem("token");

// Redirect if not logged in
if (!token) {
  alert("Login required ❌");
  window.location.href = "login.html";
}

// Get input elements
const title = document.getElementById("title");
const category = document.getElementById("category");
const caption = document.getElementById("caption");
const image = document.getElementById("image");

// (Optional: only if you ADD these fields in HTML later)
// const videoFile = document.getElementById("video");
// const song = document.getElementById("song");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();

  // Text fields
  formData.append("title", title.value);
  formData.append("category", category.value);
  formData.append("caption", caption.value);

  // Image upload
  if (image.files.length > 0) {
    formData.append("image", image.files[0]);
  }

  // ❌ REMOVE these unless you add inputs in HTML
  // if (videoFile.files.length > 0) {
  //   formData.append("video", videoFile.files[0]);
  // }

  // if (song.files.length > 0) {
  //   formData.append("song", song.files[0]);
  // }

  try {
    const res = await fetch("http://localhost:5000/api/blogs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Blog published");
      window.location.href = "blogs.html";
    } else {
      alert("❌ Failed: " + (data.message || "Unknown error"));
    }

  } catch (err) {
    console.error("Error:", err);
    alert("❌ Server error");
  }
});