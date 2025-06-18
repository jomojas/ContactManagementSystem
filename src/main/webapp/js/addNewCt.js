document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addContactForm');
    const errorMessage = document.getElementById('errorMessage');
    const photoInput = document.getElementById('profilePhotoInput');
    const previewImage = document.getElementById('profilePhotoPreview');

    // === Image Preview Logic ===
    photoInput.addEventListener('change', function () {
        const file = this.files[0];
//        console.log(file);
        if (file) {
            previewImage.src = URL.createObjectURL(file);
//            console.log(URL.createObjectURL);
        }
    });

    // === Form Submission ===
    // === Form Submission ===
    form.addEventListener('submit', function (e) {
        console.log("Submitting form");
        e.preventDefault();
        errorMessage.textContent = '';

        // === Collect input values ===
        const name = document.getElementById('name').value.trim();
        const address = document.getElementById('address').value.trim();
        const email = document.getElementById('email').value.trim();
        const qq = document.getElementById('qq').value.trim();
        const wechat = document.getElementById('wechat').value.trim();
        const postalCode = document.getElementById('postalCode').value.trim();
        const gender = document.getElementById('gender').value;
        const birthDate = document.getElementById('birthDate').value;
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const photo = photoInput.files[0];

        // === Simple validation ===
        if (!name || !address || !email || !qq || !wechat || !gender || !phoneNumber) {
            errorMessage.textContent = '请填写所有必填项';
            return;
        }

        // === 字段长度验证 ===
        if (name.length > 10) {
            errorMessage.textContent = '姓名长度不能超过10个字符';
            return;
        }
        if (address.length > 100) {
            errorMessage.textContent = '地址长度不能超过100个字符';
            return;
        }
        if (qq.length > 11) {
            errorMessage.textContent = 'QQ号码长度不能超过11位';
            return;
        }
        if (wechat.length > 20) {
            errorMessage.textContent = '微信号长度不能超过20个字符';
            return;
        }
        if (email.length > 50) {
            errorMessage.textContent = '邮箱长度不能超过50个字符';
            return;
        }
        if (phoneNumber.length > 11) {
            errorMessage.textContent = '电话号码长度不能超过11位';
            return;
        }
        if (postalCode.length > 6) {
            errorMessage.textContent = '邮编长度不能超过6位';
            return;
        }

        // === 格式验证 ===
        // QQ验证（纯数字）
        if (!/^\d+$/.test(qq)) {
            errorMessage.textContent = 'QQ号码只能包含数字';
            return;
        }

        // 微信验证（字母、数字和下划线）
        if (!/^[a-zA-Z0-9_]+$/.test(wechat)) {
            errorMessage.textContent = '微信号只能包含字母、数字和下划线(_)';
            return;
        }

        // 电话号码验证（纯数字）
        if (!/^\d+$/.test(phoneNumber)) {
            errorMessage.textContent = '电话号码只能包含数字';
            return;
        }

        // 邮编验证（纯数字，可为空）
        if (postalCode && !/^\d+$/.test(postalCode)) {
            errorMessage.textContent = '邮编只能包含数字';
            return;
        }

        // 邮箱验证（基础格式）
        if (!/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            errorMessage.textContent = '请输入有效的邮箱地址（可包含字母、数字、下划线和常见符号）';
            return;
        }

        // === Build FormData ===
        const formData = new FormData();
        formData.append('name', name);
        formData.append('address', address);
        formData.append('email', email);
        formData.append('qq', qq);
        formData.append('wechat', wechat);
        formData.append('postalCode', postalCode);
        formData.append('gender', gender);
        formData.append('birthDate', birthDate);
        formData.append('phoneNumber', phoneNumber);
        if (photo) {
            formData.append('photo', photo);
        }

        console.log("Start sending POST request");

        // === Send POST request ===
        fetch('addContact', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                console.log("success response okay");
                window.location.href = 'ContactList.html';
            } else {
                return response.text().then(msg => {
                    throw new Error(msg);
                });
            }
        })
        .catch(error => {
            errorMessage.textContent = '添加失败: ' + error.message;
        });
    });
});
