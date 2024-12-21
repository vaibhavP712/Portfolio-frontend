// Define the backend API base URL
const API_BASE_URL = 'https://portfoliobackend-k2gr.onrender.com'; 

// Utility Functions

/**
 * Displays an error message to the user.
 * @param {string} message - The error message to display.
 */
function displayErrorMessage(message) {
    let errorContainer = document.getElementById('errorContainer');
    if (!errorContainer) {
        // Create the error container if it doesn't exist
        errorContainer = document.createElement('div');
        errorContainer.id = 'errorContainer';
        errorContainer.style.color = 'red';
        errorContainer.style.marginTop = '10px';
        const feedbackDiv = document.getElementById('feedback');
        if (feedbackDiv) {
            feedbackDiv.appendChild(errorContainer);
        }
    }
    errorContainer.textContent = message;
    errorContainer.style.display = message ? 'block' : 'none';
}

/**
 * Displays a success message to the user.
 * @param {string} message - The success message to display.
 */
function displaySuccessMessage(message) {
    let successContainer = document.getElementById('successContainer');
    if (!successContainer) {
        // Create the success container if it doesn't exist
        successContainer = document.createElement('div');
        successContainer.id = 'successContainer';
        successContainer.style.color = 'green';
        successContainer.style.marginTop = '10px';
        const feedbackDiv = document.getElementById('feedback');
        if (feedbackDiv) {
            feedbackDiv.appendChild(successContainer);
        }
    }
    successContainer.textContent = message;
    successContainer.style.display = message ? 'block' : 'none';
    if (message) {
        setTimeout(() => {
            successContainer.style.display = 'none';
        }, 3000);
    }
}

function clearMessages() {
    displayErrorMessage('');
    displaySuccessMessage('');
}

/**
 * Creates a comment list item element.
 * @param {Object} comment - The comment data containing name and message.
 * @returns {HTMLElement} - The list item element representing the comment.
 */
function createCommentElement(comment) {
    const listItem = document.createElement('li');
    listItem.style.marginBottom = '10px';

    // Sanitize the text to prevent XSS
    const strong = document.createElement('strong');
    strong.textContent = comment.name;

    listItem.appendChild(strong);
    listItem.appendChild(document.createTextNode(`: ${comment.message}`));
    return listItem;
}

/**
 * Validates the form inputs.
 * @param {string} name - The name input value.
 * @param {string} message - The message input value.
 * @returns {Array} - An array of error messages. Empty if no errors.
 */
function validateForm(name, message) {
    const errors = [];
    if (!name.trim()) errors.push('Name is required.');
    if (!message.trim()) errors.push('Message cannot be empty.');
    return errors;
}

/**
 * Toggles the visibility of the loading indicator.
 * @param {boolean} isLoading - Whether to show the loading indicator.
 */
function showLoading(isLoading) {
    let loader = document.getElementById('loader');
    if (!loader) {
        // Create the loader if it doesn't exist
        loader = document.createElement('div');
        loader.id = 'loader';
        loader.textContent = 'Loading...';
        loader.style.marginTop = '10px';
        const feedbackDiv = document.getElementById('feedback');
        if (feedbackDiv) {
            feedbackDiv.appendChild(loader);
        }
    }
    loader.style.display = isLoading ? 'block' : 'none';
}

// Event Handlers

/**
 * Handles the form submission for adding a new comment.
 * @param {Event} event - The form submission event.
 */
async function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    clearMessages(); // Clear any existing messages

    const nameInput = document.getElementById('name');
    const messageInput = document.getElementById('message');

    // Check if form elements exist
    if (!nameInput || !messageInput) {
        console.error('Form elements not found.');
        displayErrorMessage('Form elements are missing.');
        return;
    }

    const name = nameInput.value;
    const message = messageInput.value;

    // Validate form inputs
    const errors = validateForm(name, message);
    if (errors.length > 0) {
        displayErrorMessage(errors.join(' '));
        return;
    }

    try {
        showLoading(true); // Show the loading indicator

        // Send the new comment to the backend
        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, message })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to save comment.');
        }

        const commentsList = document.getElementById('commentsList');
        if (commentsList) {
            commentsList.appendChild(createCommentElement(data)); // Add the new comment to the list
        } else {
            console.error('Comments list element not found.');
            displayErrorMessage('Comments section is missing.');
        }

        // Clear the form fields
        nameInput.value = '';
        messageInput.value = '';

        displaySuccessMessage('Comment successfully added!');
    } catch (error) {
        console.error('Error saving comment:', error);
        displayErrorMessage('Failed to save your comment. Please try again later.');
    } finally {
        showLoading(false); // Hide the loading indicator
    }
}

/**
 * Loads and displays all existing comments from the backend.
 */
async function loadComments() {
    try {
        showLoading(true); // Show the loading indicator

        const response = await fetch(`${API_BASE_URL}/comments`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load comments.');
        }

        const commentsList = document.getElementById('commentsList');
        if (commentsList) {
            commentsList.innerHTML = ''; // Clear any existing comments

            data.forEach(comment => {
                commentsList.appendChild(createCommentElement(comment)); // Add each comment to the list
            });
        } else {
            console.error('Comments list element not found.');
            displayErrorMessage('Comments section is missing.');
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        displayErrorMessage('Failed to load comments.');
    } finally {
        showLoading(false); // Hide the loading indicator
    }
}

// Initialization

// Add event listener for form submission
document.getElementById('commentForm').addEventListener('submit', handleFormSubmit);

// Load comments when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', loadComments);

// Optional: Scroll Effect with Debouncing

/**
 * Creates a debounced version of the provided function.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @param {boolean} immediate - Whether to execute the function immediately.
 * @returns {Function} - The debounced function.
 */
function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function(...args) {
        const context = this;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Add scroll event listener with debouncing
document.addEventListener('scroll', debounce(function () {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            el.classList.add('in-view');
        }
    });
}, 100));