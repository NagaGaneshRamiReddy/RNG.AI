const API_KEY = 'AIzaSyBHYM5jOji2M5YXmix5IF09GCEvq1Oxt4I';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
//80eae6f9ddf5430bb726a34ed9f57eae//image

function createCopyButton() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-copy"></i>';
    button.className = 'copy-button';
    button.addEventListener('click', function() {
        const textToCopy = this.parentElement.querySelector('.message-text').textContent;
        navigator.clipboard.writeText(textToCopy);
        
        // Show feedback
        button.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    });
    return button;
}

function formatMessage(text) {
    // Replace newlines with <br> tags
    text = text.replace(/\n/g, '<br>');
    
    // Format code blocks
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<div class="code-block"><div class="code-header"><span class="code-lang"></span><button class="copy-code-btn"><i class="fas fa-copy"></i></button></div><pre><code>${code.trim()}</code></pre></div>`;
    });
    
    return text;
}

function addMessage(text, isUser) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    // Create message content container
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Create text container
    const textContainer = document.createElement('div');
    textContainer.className = 'message-text';
    textContainer.innerHTML = formatMessage(text);
    
    messageContent.appendChild(textContainer);
    
    // Add copy button for AI messages
    if (!isUser) {
        messageContent.appendChild(createCopyButton());
    }
    
    messageDiv.appendChild(messageContent);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Initialize code copy buttons
    initializeCodeCopyButtons(messageDiv);
}

function initializeCodeCopyButtons(messageDiv) {
    messageDiv.querySelectorAll('.copy-code-btn').forEach(button => {
        button.addEventListener('click', function() {
            const codeBlock = this.closest('.code-block').querySelector('code');
            navigator.clipboard.writeText(codeBlock.textContent);
            
            // Show feedback
            this.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });
    });
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const userMessage = userInput.value.trim();

    if (!userMessage) return;

    // Add user message to chat
    addMessage(userMessage, true);
    userInput.value = '';

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: userMessage
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            addMessage(aiResponse, false);
        } else {
            addMessage("Sorry, I couldn't generate a response.", false);
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage("Sorry, there was an error processing your request.", false);
    }
}

// Allow sending message with Enter key
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}); 