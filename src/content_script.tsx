// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    console.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});

// Array to store user messages
let userMessages: string[] = [];
// Index of the current message being edited
let currentMessageIndex: number | null = null;
// Store the unfinished message when navigating through history
let unfinishedMessage: string = "";

// Adjust the height of the textarea to fit its content
const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
};

// Add keydown event listener to the textarea
const addKeydownListener = (element: HTMLTextAreaElement | null) => {
  if (element) {
    element.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "ArrowUp") {
          // Navigate to the previous message in the history
          if (userMessages.length > 0 && (currentMessageIndex ?? 1000) > 0) {
            if (currentMessageIndex === null) {
              unfinishedMessage = element.value; // Save unfinished message
              currentMessageIndex = userMessages.length - 1;
            } else if (currentMessageIndex > 0) {
              currentMessageIndex--;
            }
            element.value = userMessages[currentMessageIndex];
            setTimeout(() => {
              // We need a slight delay because the DOM doesn't update fast enough
              element.setSelectionRange(
                element.value.length,
                element.value.length
              );
              adjustTextareaHeight(element);
            }, 5);
          }
        } else if (event.key === "ArrowDown") {
          // Navigate to the next message in the history
          if (userMessages.length > 0) {
            if (currentMessageIndex !== null) {
              if (currentMessageIndex < userMessages.length - 1) {
                currentMessageIndex++;
                element.value = userMessages[currentMessageIndex];
              } else {
                currentMessageIndex = null;
                element.value = unfinishedMessage; // Restore unfinished message
              }
              setTimeout(() => {
                // We need a slight delay because the DOM doesn't update fast enough
                element.setSelectionRange(
                  element.value.length,
                  element.value.length
                );
                adjustTextareaHeight(element);
              }, 5);
            }
          }
        } else if (event.key === "Enter" && !event.shiftKey) {
          // Add new message to the history
          const newMessage = element.value.trim();
          if (newMessage) {
            userMessages.push(newMessage);
            currentMessageIndex = null; // Reset the index after a new message is added
            unfinishedMessage = ""; // Clear unfinished message
          }
        }
      },
      { passive: true }
    );
  }
};

// Reset the state of the message history
const resetState = () => {
  currentMessageIndex = null;
  userMessages = [];
  unfinishedMessage = "";
};

// Initialize the script
const initialize = () => {
  const promptTextarea = document.getElementById(
    "prompt-textarea"
  ) as HTMLTextAreaElement | null;
  addKeydownListener(promptTextarea);

  // Find and store user messages
  setTimeout(() => {
    const userDivs = document.querySelectorAll(
      'div[data-message-author-role="user"]'
    );

    userDivs.forEach((userDiv) => {
      const messageDiv = userDiv.querySelector(
        "div.relative > div"
      ) as HTMLElement | null;
      if (messageDiv) {
        userMessages.push(messageDiv.innerText.trim());
      }
    });
  }, 2000); // Wait for 2 seconds before executing the code
};

// Handle URL change by resetting the state and re-initializing
const handleUrlChange = () => {
  resetState();
  setTimeout(initialize, 600);
};

// Listen for messages from the background script, on change URL
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "urlChanged") {
    handleUrlChange();
  }
});

// Initialize the script when the document is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
