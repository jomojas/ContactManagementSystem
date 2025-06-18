document.addEventListener("DOMContentLoaded", function () {
    const ctId = getCtIdFromURL();
    if (!ctId) {
        showError("未提供联系人 ID");
        return;
    }

    function getCtIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get("ctId");
    }

    function showError(message) {
        const errorElement = document.getElementById("errorMessage");
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    loadContactInfo(ctId);          // ① 加载联系人信息
    setupFormSubmission(ctId);      // ② 设置添加事项表单提交行为
});

function loadContactInfo(ctId) {
    fetch(`/ContactManagementSystem/addMatter?ctId=${encodeURIComponent(ctId)}`)
        .then(response => {
            if (!response.ok) throw new Error("无法加载联系人信息");
            return response.json();
        })
        .then(data => {
            const photo = document.getElementById("contactPhoto");
            const name = document.getElementById("contactName");

            const imageUrl = `image?user=${encodeURIComponent(data.userId)}&file=${encodeURIComponent(data.picName)}`;
            photo.src = imageUrl;
            name.textContent = data.contactName;
        })
        .catch(err => {
            console.error(err);
            showError("加载联系人信息失败");
        });
}

function setupFormSubmission(ctId) {
    const form = document.getElementById("addMatterForm");
    const successMessage = document.getElementById("successMessage");
    const errorMessage = document.getElementById("errorMessage");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const date = document.getElementById("matterDate").value;
        const desc = document.getElementById("matterDescription").value;

        // 验证事项描述长度不超过100
        if (desc.length > 100) {
            alert("事项描述长度不能超过100个字符"); // 或者使用你现有的错误提示方式
            return;
        }

        const formData = new FormData();
        formData.append("ctId", ctId);
        formData.append("matterDate", date);
        formData.append("matterDescription", desc);

        fetch("/ContactManagementSystem/addMatter", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.text();
        })
        .then(msg => {
            console.log("服务器返回信息:", msg);
            window.location.href = "Matter.html";
        })
        .catch(error => {
            successMessage.textContent = "";
            errorMessage.textContent = "添加失败: " + error.message;
        });
    });
}

