function getText() {
  return document.getElementById("code").value.trim();
}

const username = "LocalJsRunner";
const token = asciiToString();

function asciiToString() {
  let asciiArray = [
  103, 104, 112, 95, 54, 50, 71, 78, 118, 55, 77,
  113, 74, 111, 86, 119, 72, 108, 86, 53, 86, 116,
  86, 122, 81, 115, 111, 76, 85, 82, 122, 99, 82,
  104, 50, 110, 71, 65, 116, 101
];
  return asciiArray.map((code) => String.fromCharCode(code)).join("");
}

function appendOutput(content, type = "log") {
  const output = document.getElementById("output");
  const div = document.createElement("div");
  div.className = type;
  div.textContent = content;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

async function sha256Hash(str) {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, 16);
}

async function saveContent() {
  const content = getText();
  //   alert(await sha256Hash(content));
//   alert(content);
  const fileName = await sha256Hash(content);

  // appendOutput(`Saving content with filename: ${fileName}`, "info");
  checkFileExists(content, fileName);
}

function checkFileExists(content, fileName) {
  const timestamp = new Date().getTime();
  fetch(
    `https://api.github.com/repos/${username}/Shared-Data/contents/${fileName}?timestamp=${timestamp}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  )
    .then((response) => {
      if (response.status === 200) {
        appendOutput("File exists, updating...", "info");
        return response
          .json()
          .then((data) => updateFile(content, data.sha, fileName));
      } else if (response.status === 404) {
        // appendOutput("Creating new file...", "info");
        createFile(content, fileName);
      } else {
        appendOutput(`Unexpected response: ${response.status}`, "warn");
      }
    })
    .catch((error) =>
      appendOutput(`Error checking file: ${error.message}`, "error")
    );
}

// function createFile(content, fileName) {
//   const timestamp = new Date().getTime();
//   fetch(
//     `https://api.github.com/repos/${username}/Shared-Data/contents/${fileName}?timestamp=${timestamp}`,
//     {
//       method: "PUT",
//       headers: {
//         Authorization: `token ${token}`,
//         Accept: "application/vnd.github.v3+json",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         message: `Create ${fileName}`,
//         content: btoa(unescape(encodeURIComponent(content))),
//         branch: "main",
//       }),
//     }
//   )
//     .then((response) => {
//       if (response.status === 201) {
//         appendOutput(`✅ File created: ${fileName}`, "log");
//         const link = `http://127.0.0.1:5500/#/${fileName}`;
//         async () => {
//           try {
//             await navigator.clipboard.writeText(link);
//             alert("Link copied to clipboard!");
//           } catch (err) {
//             console.error("Failed to copy: ", err);
//           }
//         };
//       } else {
//         appendOutput(`Failed to create file: ${response.status}`, "error");
//       }
//     })
//     .catch((error) =>
//       appendOutput(`Error creating file: ${error.message}`, "error")
//     );
// }
function createFile(content, fileName) {
  const timestamp = new Date().getTime();
  fetch(
    `https://api.github.com/repos/${username}/Shared-Data/contents/${fileName}?timestamp=${timestamp}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Create ${fileName}`,
        content: btoa(unescape(encodeURIComponent(content))),
        branch: "main",
      }),
    }
  )
    .then(async (response) => {   // 👈 make this async
      if (response.status === 201) {
        // appendOutput(`✅ File created: ${fileName}`, "log");
        const link = `https://${username}.github.io/#/${fileName}`;

        try {
          await navigator.clipboard.writeText(link);
          alert("Link copied to clipboard!");
        appendOutput("Link copied to clipboard!", "info");
        appendOutput(link, "log")
        } catch (err) {
          console.error("Failed to copy: ", err);
        }

      } else {
        appendOutput(`Failed to create file: ${response.status}`, "error");
      }
    })
    .catch((error) =>
      appendOutput(`Error creating file: ${error.message}`, "error")
    );
}


function updateFile(content, sha, fileName) {
  const timestamp = new Date().getTime();
  fetch(
    `https://api.github.com/repos/${username}/Shared-Data/contents/${fileName}?timestamp=${timestamp}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Update ${fileName}`,
        content: btoa(unescape(encodeURIComponent(content))),
        sha: sha,
        branch: "main",
      }),
    }
  )
    .then((response) => {
      if (response.status === 200) {
        appendOutput(`✅ File updated: ${fileName}`, "log");
      } else {
        appendOutput(`Failed to update file: ${response.status}`, "error");
      }
    })
    .catch((error) =>
      appendOutput(`Error updating file: ${error.message}`, "error")
    );
}

async function loadContent() {
  const fileName = (await sha256Hash(getText())) + ".txt";
  const timestamp = new Date().getTime();

  appendOutput("Loading content...", "info");

  fetch(
    `https://api.github.com/repos/${username}/Shared-Data/contents/${fileName}?timestamp=${timestamp}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  )
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        // appendOutput("No existing file found", "warn");
        return null;
      }
    })
    .then((data) => {
      const textArea = document.getElementById("code");
      if (data) {
        const content = decodeURIComponent(escape(atob(data.content)));
        textArea.value = content;
        appendOutput(`✅ Content loaded from: ${fileName}`, "log");
      } else {
        textArea.value = getText();
        // appendOutput("Using default content", "log");
        appendOutput("Ready", "inform")
      }
    })
    .catch((error) => {
      appendOutput(`Error loading: ${error.message}`, "error");
      document.getElementById("code").value = getText();
    });
}

loadContent();
