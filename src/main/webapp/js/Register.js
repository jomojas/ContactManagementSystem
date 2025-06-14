document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const photoInput = document.getElementById('profilePhotoInput');
    const previewImage = document.getElementById('profilePhotoPreview');

    // === Image Preview Logic ===
    photoInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            previewImage.src = URL.createObjectURL(file);
        }
    });

    // === Form Submission ===
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        errorMessage.textContent = '';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        let photo = photoInput.files[0];

        // === Validation ===
        if (!username || !password || !confirmPassword) {
            errorMessage.textContent = '请填写所有必填项';
            return;
        }

        if (password !== confirmPassword) {
            errorMessage.textContent = '两次输入的密码不一致';
            return;
        }

        // === Build FormData ===
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        // === If no photo selected, fetch default.jpg as fallback ===
        if (!photo) {
            try {
                const res = await fetch('image?user=default&file=default.jpg');
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

                const blob = await res.blob();
                photo = new File([blob], 'default.jpg', { type: blob.type });
            } catch (err) {
                console.error('Image loading error:', err);
                errorMessage.textContent = '无法加载默认头像，请稍后重试';
                return;
            }
        }

        // Append photo (either selected or default)
        formData.append('photo', photo);

        // === Send POST request to RegisterServlet ===
        fetch('/ContactManagementSystem/register', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                // Registration successful, redirect to login page
                window.location.href = 'Login.html';
            } else {
                return response.text().then(msg => {
                    throw new Error(msg);
                });
            }
        })
        .catch(error => {
            errorMessage.textContent = '注册失败: ' + error.message;
        });
    });
});
