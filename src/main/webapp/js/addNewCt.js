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

        console.log("Start sending POST request")

        // === Send POST request ===
        fetch('addContact', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                console.log("success response okay");
                // Redirect to contact list
                window.location.href = 'ContactList.jsp';
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
