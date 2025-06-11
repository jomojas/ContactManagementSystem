document.addEventListener('DOMContentLoaded', function() {
    // Get contact ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const ctId = urlParams.get('ctId');

    if (!ctId) {
        showError('无效的联系人ID');
        return;
    }

    // Load contact details
    loadContactDetails(ctId);

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
function loadContactDetails(ctId) {
    showLoading(true);

    fetch(`/ContactManagementSystem/detailCt?ctId=${encodeURIComponent(ctId)}`)
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
            // Redirect to ContactList.html after successful update
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