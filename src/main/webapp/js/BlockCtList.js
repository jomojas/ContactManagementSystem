/**
 * Blocked Contact List Management Script
 * Handles rendering and interaction for the blocked contact list
 */

// DOM Elements
const filterButton = document.getElementById('filterButton');
const searchInput = document.getElementById('searchText');
const genderSelect = document.getElementById('genderFilter');
const contactTableBody = document.getElementById('contactTableBody');
const mobileContactList = document.getElementById('mobileContactList');
const errorMessage = document.getElementById('errorMessage');
const loadingMessage = document.getElementById('loadingMessage');

let currentSearch = '';
let currentGender = 'all';

/**
 * Main initialization function
 */
function initBlockedContactList() {
    // Load profile image
    loadUserProfileImage();

    // Set up Event Listeners
    setupEventListeners();

    // Load initial data
    updateBlockedContacts();
}

function setupEventListeners() {
    // Filter button click
    if (filterButton) {
        filterButton.addEventListener('click', updateBlockedContacts);
    }

    // Search input - stores value
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentSearch = this.value;
//            console.log("searchinput updated");
        });
    }

    // Gender filter - stores value
    if (genderSelect) {
        genderSelect.addEventListener('change', function () {
            currentGender = this.value;
//            console.log("gender select updated");
        });
    }
}

/*
 * Load user profile image
 */
function loadUserProfileImage() {
    const profileImg = document.getElementById("userProfilePhoto");
    if (!profileImg) return;

    fetch('getUserId')
        .then(response => response.json())
        .then(data => {
            if (data.userId && data.userId !== "default") {
                const newSrc = `image?user=${encodeURIComponent(data.userId)}&file=profile.jpg`;
                profileImg.src = newSrc;

                // Fallback to default if user's image is missing
                profileImg.onerror = function () {
                    this.src = "image?user=default&file=default.jpg";
                };
            }
        })
        .catch(err => {
            console.error("Error loading user ID:", err);
            profileImg.src = "image?user=default&file=default.jpg";
        });
}

/**
 * Load and update blocked contacts
 */
function updateBlockedContacts() {
    showLoadingState();

    console.log("Starting fetch data");
    console.log(currentGender);
    fetch(`/ContactManagementSystem/blockedContacts?searchText=${encodeURIComponent(currentSearch)}&genderFilter=${encodeURIComponent(currentGender)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(contacts => {
            loadingMessage.textContent = '';

            if (contacts.length === 0) {
                console.log("No blocked contact")
                loadingMessage.textContent = '当前没有已拉黑的联系人';
                contactTableBody.innerHTML = '';
                mobileContactList.innerHTML = '';
                return;
            }

            console.log("success, start rendering data");
            renderAllBlockedContacts(contacts);
            attachButtonListeners();
        })
        .catch(error => {
            console.error('Error loading blocked contacts:', error);
            loadingMessage.textContent = '';
            errorMessage.textContent = '加载已拉黑联系人时出错，请稍后重试。';

            setTimeout(() => {
                errorMessage.textContent = '';
            }, 3000);
        });
}

/**
 * Show loading state
 */
function showLoadingState() {
    if (contactTableBody) {
        contactTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">加载中...</td>
            </tr>`;
    }

    if (mobileContactList) {
        mobileContactList.innerHTML = `
            <div class="mobile-contact-card">
                <div style="text-align: center; padding: 20px;">加载中...</div>
            </div>`;
    }

    if (loadingMessage) {
        loadingMessage.textContent = '';
    }

    if (errorMessage) {
        errorMessage.textContent = '';
    }
}

/**
 * Render blocked contacts in both table and mobile views
 */
function renderAllBlockedContacts(contacts) {
    renderTableBlockedContacts(contacts);
    renderMobileBlockedContacts(contacts);
}

/**
 * Render blocked contacts in table view
 */
function renderTableBlockedContacts(contacts) {
    contactTableBody.innerHTML = '';

    if (!contacts || contacts.length === 0) {
        contactTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">没有找到已拉黑的联系人</td>
            </tr>`;
        return;
    }

    contacts.forEach(contact => {
        const [name, gender, phone, ctId] = contact;

        const tr = document.createElement('tr');
        tr.dataset.ctid = ctId;

        tr.innerHTML = `
            <td>${name}</td>
            <td>${gender}</td>
            <td>${phone}</td>
            <td><button class="action-button details-button">详情</button></td>
            <td><button class="action-button restore-button">还原</button></td>
        `;

        contactTableBody.appendChild(tr);
    });
}

/**
 * Render blocked contacts in mobile view
 */
function renderMobileBlockedContacts(contacts) {
    mobileContactList.innerHTML = '';

    if (!contacts || contacts.length === 0) {
        mobileContactList.innerHTML = `
            <div class="mobile-contact-card">
                <div style="text-align: center; padding: 20px;">没有找到已拉黑的联系人</div>
            </div>`;
        return;
    }

    contacts.forEach(contact => {
        const [name, gender, phone, ctId] = contact;

        const div = document.createElement('div');
        div.className = 'mobile-contact-card';
        div.dataset.ctid = ctId;

        div.innerHTML = `
          <div class="mobile-contact-info">
              <span class="mobile-contact-name">${name}</span>
              <span class="mobile-contact-gender">${gender}</span>
              <div class="mobile-contact-phone">${phone}</div>
          </div>
          <div class="mobile-contact-actions">
            <button class="action-button details-button">详情</button>
            <button class="action-button restore-button">还原</button>
          </div>
        `;

        mobileContactList.appendChild(div);
    });
}

/**
 * Attach event listeners to action buttons
 */
function attachButtonListeners() {
    // Helper to find the contact ID from the button's parent element
    function getCtIdFromButton(button) {
        const parentElement = button.closest('tr') || button.closest('.mobile-contact-card');
        return parentElement ? parentElement.dataset.ctid : null;
    }

    // Details buttons
    document.querySelectorAll('.details-button').forEach(button => {
        button.addEventListener('click', function() {
            const ctId = getCtIdFromButton(button);
            if (ctId) {
                window.location.href = `DetailCt.html?ctId=${encodeURIComponent(ctId)}`;
            }
        });
    });

    // Restore buttons
    document.querySelectorAll('.restore-button').forEach(button => {
        button.addEventListener('click', function() {
            const ctId = getCtIdFromButton(button);
            if (ctId && confirm('确认要还原此联系人吗？')) {
                fetch(`restoreContact?ctid=${encodeURIComponent(ctId)}`, {
                    method: 'POST'
                })
                .then(response => {
                    if (response.ok) {
                        return response.json(); // Parse JSON response
                    } else {
                        return response.json().then(data => {
                            throw new Error(data.message || '还原失败');
                        });
                    }
                })
                .then(data => {
                    if (data.success) {
                        alert(data.message || '联系人已成功还原');
                        window.location.reload();
                    } else {
                        throw new Error(data.message || '还原失败');
                    }
                })
                .catch(error => {
                    alert('操作失败: ' + error.message);
                });
            }
        });
    });
}


// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initBlockedContactList);