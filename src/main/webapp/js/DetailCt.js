document.addEventListener('DOMContentLoaded', function() {
    // Get contact ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const ctId = urlParams.get('ctId');
    const isDeleted = urlParams.get('isDeleted');

    if (!ctId) {
        showError('无效的联系人ID');
        return;
    }

    // Load contact details
    loadContactDetails(ctId, isDeleted);

    // Setup form submission
    document.getElementById('addContactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateContact(ctId);
    });

    // Setup matter button
    document.getElementById('matterContactBtn').addEventListener('click', function() {
        window.location.href = `AddMatter.html?ctId=${encodeURIComponent(ctId)}`;
    });

    // Setup profile photo upload preview
    document.getElementById('profilePhotoInput').addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('profilePhotoPreview').src = event.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
});

/**
 * Load contact details from server
 */
function loadContactDetails(ctId, isDeleted) {
    showLoading(true);

    console.log(ctId);
    console.log(isDeleted);
    fetch(`/ContactManagementSystem/detailCt?ctId=${encodeURIComponent(ctId)}&isDeleted=${encodeURIComponent(isDeleted)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(contact => {
            // Fill form with contact data
            document.getElementById('name').value = contact.name || '';
            document.getElementById('address').value = contact.address || '';
            document.getElementById('email').value = contact.email || '';
            document.getElementById('qq').value = contact.qq || '';
            document.getElementById('wechat').value = contact.wechat || '';
            document.getElementById('postalCode').value = contact.postalCode || '';
            document.getElementById('gender').value = contact.gender || '';
            document.getElementById('birthDate').value = contact.birthDate || '';
            document.getElementById('phoneNumber').value = contact.phoneNumber || '';

            // Set profile photo using userId and pic_name
            if (contact.userId && contact.picName) {
                const imageUrl = `image?user=${encodeURIComponent(contact.userId)}&file=${encodeURIComponent(contact.picName)}`;
                document.getElementById('profilePhotoPreview').src = imageUrl;
                // console.log("Image uploaded done");

                // Set up error fallback
                document.getElementById('profilePhotoPreview').onerror = function() {
                    this.src = 'image?user=default&file=default.jpg';
                    // console.log("Fallback to default image");
                };
            } else {
                // Use default image if no photo available
                document.getElementById('profilePhotoPreview').src = 'image?user=default&file=default.jpg';
            }

            showLoading(false);
        })
        .catch(error => {
            console.error('Error loading contact details:', error);
            showError('加载联系人详情失败');
            showLoading(false);
        });
}

/**
 * Update contact details
 */
function updateContact(ctId) {
    showLoading(true);
    const form = document.getElementById('addContactForm');

    // === 收集输入值 ===
    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const email = document.getElementById('email').value.trim();
    const qq = document.getElementById('qq').value.trim();
    const wechat = document.getElementById('wechat').value.trim();
    const postalCode = document.getElementById('postalCode').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();

    // === 字段长度验证 ===
    if (name.length > 10) {
        showError('姓名长度不能超过10个字符');
        showLoading(false);
        return;
    }
    if (address.length > 100) {
        showError('地址长度不能超过100个字符');
        showLoading(false);
        return;
    }
    if (qq.length > 11) {
        showError('QQ号码长度不能超过11位');
        showLoading(false);
        return;
    }
    if (wechat.length > 20) {
        showError('微信号长度不能超过20个字符');
        showLoading(false);
        return;
    }
    if (email.length > 50) {
        showError('邮箱长度不能超过50个字符');
        showLoading(false);
        return;
    }
    if (phoneNumber.length > 11) {
        showError('电话号码长度不能超过11位');
        showLoading(false);
        return;
    }
    if (postalCode.length > 6) {
        showError('邮编长度不能超过6位');
        showLoading(false);
        return;
    }

    // === 格式验证 ===
    // QQ验证（纯数字）
    if (!/^\d+$/.test(qq)) {
        showError('QQ号码只能包含数字');
        showLoading(false);
        return;
    }

    // 微信验证（字母、数字和下划线）
    if (!/^[a-zA-Z0-9_]+$/.test(wechat)) {
        showError('微信号只能包含字母、数字和下划线(_)');
        showLoading(false);
        return;
    }

    // 电话号码验证（纯数字）
    if (!/^\d+$/.test(phoneNumber)) {
        showError('电话号码只能包含数字');
        showLoading(false);
        return;
    }

    // 邮编验证（纯数字）
    if (postalCode && !/^\d+$/.test(postalCode)) {
        showError('邮编只能包含数字');
        showLoading(false);
        return;
    }

    // 邮箱验证（基础格式，允许字母、数字、下划线和常见邮箱符号）
    if (!/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        showError('请输入有效的邮箱地址（可包含字母、数字、下划线和常见符号）');
        showLoading(false);
        return;
    }

    // === 表单提交 ===
    const formData = new FormData(form);
    formData.append('ctId', ctId);

    fetch('/ContactManagementSystem/detailCt', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.text();
    })
    .then(message => {
        alert('联系人更新成功');
        window.location.href = 'ContactList.html';
    })
    .catch(error => {
        console.error('Error updating contact:', error);
        showError('更新失败: ' + error.message);
        showLoading(false);
    });
}

/**
 * Show loading state
 */
function showLoading(isLoading) {
    const updateBtn = document.getElementById('updateContactBtn');
    if (updateBtn) {
        updateBtn.disabled = isLoading;
        updateBtn.textContent = isLoading ? '处理中...' : '更新 (Update)';
    }
}

/**
 * Show error message
 */
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    setTimeout(() => {
        errorElement.textContent = '';
    }, 5000);
}