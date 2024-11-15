// Function to handle file uploads
document.getElementById('fileSelect').addEventListener('click', function() {
    const fileInput = document.getElementById('fileElem');
    fileInput.click();
});

document.getElementById('fileElem').addEventListener('change', function() {
    const file = this.files[0];
    const formData = new FormData();
    formData.append('file', file);

    fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Alert the server response message
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error uploading file');
    });
});

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) throw new Error('Invalid credentials');
        return response.json();
    })
    .then(data => {
        localStorage.setItem('token', data.token); // Save the token
        alert('Login successful');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Invalid credentials');
    });
});

// Handle register form submission
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) throw new Error('Username already exists');
        return response.json();
    })
    .then(data => {
        alert('Registration successful');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Username already exists');
    });
});

// Fetch protected profile data
function fetchProfileData() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You need to be logged in to access this data');
        return;
    }

    fetch('http://localhost:5000/api/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch profile data');
        return response.json();
    })
    .then(data => {
        console.log('Profile data:', data);
        alert(`Welcome, ${data.username}`);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to fetch profile data');
    });
}
