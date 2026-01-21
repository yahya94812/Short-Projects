// Simple hash-based content loader
const baseUrl = 'https://raw.githubusercontent.com/LocalJsRunner/Shared-Data/refs/heads/main/';
let content = null;

// Function to get hash value without '#'
function getHash() {
    return window.location.hash.slice(1);
}

// Function to load content from GitHub based on hash
async function loadContent() {
    const hash = getHash();
    
    if (!hash) {
        console.log('No hash found in URL');
              const content = `// Write your JavaScript code here...
console.log('Hello, World!');

// Example: Long running task
for (let i = 0; i < 1000000; i++) {
  if (i % 100000 === 0) {
    console.log('Progress:', i);
  }
}

// Example: Infinite loop (can be terminated)
// while (true) {
//   console.log('This will run forever...');
// }

// Example: Async operations
setTimeout(() => {
  console.log('Delayed message after 2 seconds');
}, 2000);
`;
        document.getElementById('code').value = content;


        return;
    }

    try {
        const url = baseUrl + hash;
        console.log(`Fetching content from: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
                          const content = `// Write your JavaScript code here...
console.log('Hello, World!');

// Example: Long running task
for (let i = 0; i < 1000000; i++) {
  if (i % 100000 === 0) {
    console.log('Progress:', i);
  }
}

// Example: Infinite loop (can be terminated)
// while (true) {
//   console.log('This will run forever...');
// }

// Example: Async operations
setTimeout(() => {
  console.log('Delayed message after 2 seconds');
}, 2000);
`;
        document.getElementById('code').value = content;
        }
        
        content = await response.text();
        console.log('Content loaded successfully');
        console.log('Content:', content);
        document.getElementById('code').value = content;
        
    } catch (error) {
        console.error('Error loading content:', error);
                      const content = `// Write your JavaScript code here...
console.log('Hello, World!');

for (let i = 0; i < 1500; i++) {
  console.log("Iteration " + i);
}
  
// Example: Long running task
for (let i = 0; i < 1000000; i++) {
  if (i % 100000 === 0) {
    console.log('Progress:', i);
  }
}

// Example: Infinite loop (can be terminated)
// while (true) {
//   console.log('This will run forever...');
// }

// Example: Async operations
setTimeout(() => {
  console.log('Delayed message after 2 seconds');
}, 2000);
`;
        document.getElementById('code').value = content;
    }
}

// Function to manually set hash and load content
function setHashAndLoad(hashValue) {
    window.location.hash = hashValue;
}

// Load content on page load
loadContent();

// Listen for hash changes
window.addEventListener('hashchange', loadContent);

// Example usage:
// setHashAndLoad('a0ec9aabcd047853');
// console.log(content); // Access the loaded content