document.addEventListener('DOMContentLoaded', function () {

    console.log("JS file triggered");

    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessageElement = document.getElementById('errorMessage');

    const invalidCharRegex = /[^a-zA-Z0-9]/;

    // ✅ Function to display client-side/server-side errors and hide after 3s
    function displayError(message) {
        errorMessageElement.textContent = message;
        setTimeout(() => {
            if (errorMessageElement.textContent === message) {
                errorMessageElement.textContent = '';
            }
        }, 3000);
    }

    // ✅ Handle error message from server-rendered page (e.g., after refresh)
    if (errorMessageElement && errorMessageElement.textContent.trim() !== '') {
        const originalMessage = errorMessageElement.textContent;
        setTimeout(() => {
            if (errorMessageElement.textContent === originalMessage) {
                errorMessageElement.textContent = '';
            }
        }, 3000);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            // ✅ Prevent default form submission
            event.preventDefault();

            console.log("Trying Logging in")

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                event.preventDefault();
                displayError('请输入用户名和密码 (Please enter username and password).');
                return;
            }

            if (invalidCharRegex.test(username)) {
                event.preventDefault();
                displayError('用户名只能包含字母和数字 (Username can only contain letters and numbers).');
                return;
            }

            if (invalidCharRegex.test(password)) {
                event.preventDefault();
                displayError('密码只能包含字母和数字 (Password can only contain letters and numbers).');
                return;
            }

            // ✅ Prepare form data
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            // ✅ Submit via fetch
            fetch('login', {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            })
            .then(response => {
                return response.json().then(data => {
                    if (!response.ok) {
                        throw new Error(data.message || '登录失败');
                    }
                    return data;
                });
            })
            .then(data => {
                if (data.status === 'success') {
                    // ✅ Login successful → redirect to contact list
                    window.location.href = 'ContactList.html';
                }
            })
            .catch(err => {
                displayError('登录失败: ' + err.message);
            });
        });
    }
});
