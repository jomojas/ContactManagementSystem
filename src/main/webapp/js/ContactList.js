/**
 * Contact List Management Script
 * Handles filtering, rendering, and interaction for the contact list
 */

// DOM Elements
const filterButton = document.getElementById('filterButton');
const searchInput = document.getElementById('searchText');
const genderSelect = document.getElementById('genderFilter');
const contactTableBody = document.getElementById('contactTableBody');
const mobileContactList = document.getElementById('mobileContactList');
const errorMessage = document.getElementById('errorMessage');
const loadingMessage = document.getElementById('loadingMessage');
//const errorMessage = document.getElementById('errorMessage');

// Store filter values outside the setup function
let currentSearch = '';
let currentGender = 'all';

/**
 * Main initialization function
 */
function initContactList() {
    // Load profile image
    loadUserProfileImage();

    // Set up event listeners
    setupEventListeners();

    // Load initial data
    updateContacts();
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
            // fallback in case something breaks
            profileImg.src = "image?user=default&file=default.jpg";
        });
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Filter button click
    if (filterButton) {
        filterButton.addEventListener('click', updateContacts);
    }

    // Search input - stores value
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearch = this.value;
//            console.log("searchinput updated");
        });
    }

    // Gender filter - stores value
    if (genderSelect) {
        genderSelect.addEventListener('change', function() {
            currentGender = this.value;
//            console.log("gender select updated");
        });
    }

    // Add contact button
    document.getElementById('addContactBtn')?.addEventListener('click', handleAddContact);

    // Block list button
    document.getElementById('blockListBtn')?.addEventListener('click', handleBlockList);

    // Contact matter button
    document.getElementById('contactMatterBtn')?.addEventListener('click', handleContactMatter);
}

/**
 * Load and update contacts with current filters
 */
function updateContacts() {
//    const searchText = searchInput ? searchInput.value : '';
//    const genderFilter = genderSelect ? genderSelect.value : 'all';

    showLoadingState();
//    console.log("Now start fetching data");

//    console.log(currentSearch);
//    console.log(currentGender);
    fetch(`http://localhost:8080/ContactManagementSystem/contacts?searchText=${encodeURIComponent(currentSearch)}&genderFilter=${encodeURIComponent(currentGender)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
//            console.log("Network response ok");
            return response.json();
        })
        .then(contacts => {

            // Clear loading message
            loadingMessage.textContent = '';

            if (contacts.length === 0) {
                loadingMessage.textContent = '当前没有联系人';
                console.log("Clear Inner HTML")
                contactTableBody.innerHTML = '';
                mobileContactList.innerHTML = '';
                console.log("done");
                return;
            }

            renderAllContacts(contacts);
            attachButtonListeners();
        })
        .catch(error => {
            console.error('Error loading contacts:', error);
//            showError('加载联系人时出错');

            loadingMessage.textContent = ''; // Clear loading state
            errorMessage.textContent = '加载联系人时出错，请稍后重试。';

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
                <td colspan="6" style="text-align: center;">加载中...</td>
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
 * Render contacts in both table and mobile views
 * @param {Array} contacts - Array of contact data
 */
function renderAllContacts(contacts) {
    renderTableContacts(contacts);
    renderMobileContacts(contacts);
}

/**
 * Render contacts in table view
 * @param {Array} contacts - Array of contact data
 */
function renderTableContacts(contacts) {
//    console.log("start render table contacts");
    contactTableBody.innerHTML = '';

    if (!contactTableBody) return;

    if (!contacts || contacts.length === 0) {
        contactTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">没有找到联系人</td>
            </tr>`;
        return;
    }

    // contactTableBody.innerHTML = contacts.map(contact => `
    //     <tr data-ctid="${contact[3]}">
    //         <td>${contact[0]}</td>
    //         <td>${contact[1]}</td>
    //         <td>${contact[2]}</td>
    //         <td><button class="action-button details-button">详情</button></td>
    //         <td><button class="action-button block-button">拉黑</button></td>
    //         <td><button class="action-button add-matter-button">添加事项</button></td>
    //     </tr>
    // `).join('');

    contacts.forEach(contact => {
        const [name, gender, phone, ctId] = contact;

        const tr = document.createElement('tr');
        tr.dataset.ctid = ctId;

        tr.innerHTML = `
            <td>${name}</td>
            <td>${gender}</td>
            <td>${phone}</td>
            <td><button class="action-button details-button">详情</button></td>
            <td><button class="action-button block-button">拉黑</button></td>
            <td><button class="action-button add-matter-button">添加事项</button></td>
        `;

        contactTableBody.appendChild(tr);
    });
}

/**
 * Render contacts in mobile view
 * @param {Array} contacts - Array of contact data
 */
function renderMobileContacts(contacts) {
//    console.log("start render mobile contacts");
    mobileContactList.innerHTML = '';

    if (!mobileContactList) return;

    if (!contacts || contacts.length === 0) {
        mobileContactList.innerHTML = `
            <div class="mobile-contact-card">
                <div style="text-align: center; padding: 20px;">没有找到联系人</div>
            </div>`;
        return;
    }

    // mobileContactList.innerHTML = contacts.map(contact => `
    //     <div class="mobile-contact-card" data-ctid="${contact[3]}">
    //         <div class="mobile-contact-info">
    //             <span class="mobile-contact-name">${contact[0]}</span>
    //             <span class="mobile-contact-gender">${contact[1]}</span>
    //             <div class="mobile-contact-phone">${contact[2]}</div>
    //         </div>
    //         <div class="mobile-contact-actions">
    //             <button class="action-button details-button" style="flex: 2;">详情</button>
    //             <div class="mobile-action-dropdown">
    //                 <button class="mobile-dropdown-btn">更多操作</button>
    //                 <div class="mobile-dropdown-content">
    //                     <button class="block-button">拉黑</button>
    //                     <button class="add-matter-button">添加事项</button>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // `).join('');

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
            <button class="action-button details-button" style="flex: 2;">详情</button>
            <div class="mobile-action-dropdown">
              <button class="mobile-dropdown-btn">更多操作</button>
              <div class="mobile-dropdown-content">
                <button class="block-button">拉黑</button>
                <button class="add-matter-button">添加事项</button>
              </div>
            </div>
          </div>
        `;

        mobileContactList.appendChild(div);
    });

    initMobileDropdowns();
}

/**
 * Initialize mobile dropdown menus
 */
function initMobileDropdowns() {
    const dropdowns = document.querySelectorAll('.mobile-action-dropdown');

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            // Hide all other dropdowns
            document.querySelectorAll('.mobile-dropdown-content').forEach(content => {
                content.style.display = 'none';
            });
            // Show this dropdown
            this.querySelector('.mobile-dropdown-content').style.display = 'block';
        });
    });

    // Close dropdowns when clicking elsewhere
    document.addEventListener('click', function() {
        document.querySelectorAll('.mobile-dropdown-content').forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    });
}

/**
 * Attach event listeners to all action buttons
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

    // Block buttons
    document.querySelectorAll('.block-button').forEach(button => {
        button.addEventListener('click', function() {
            const ctId = getCtIdFromButton(button);
            if (ctId && confirm('确认将联系人拉黑？')) {
                fetch(`blockContact?ctId=${encodeURIComponent(ctId)}`, {
                    method: 'POST'
                })
                .then(response => {
                    if (response.ok) {
                        alert('联系人已拉黑');
                        window.location.reload();
                    } else {
                        return response.text().then(msg => { throw new Error(msg); });
                    }
                })
                .catch(error => {
                    alert('操作失败: ' + error.message);
                });
            }
        });
    });

    // Add matter buttons
    document.querySelectorAll('.add-matter-button').forEach(button => {
        button.addEventListener('click', function() {
            const ctId = getCtIdFromButton(button);
            if (ctId) {
                window.location.href = `AddMatter.html?ctId=${encodeURIComponent(ctId)}`;
            }
        });
    });
}

/**
 * Handle add contact button click
 */
function handleAddContact() {
    try {
        window.location.href = 'addNewCt.html';
    } catch (error) {
        console.error('Failed to navigate to add contact page:', error);
        showError('无法打开添加联系人页面');
    }
}

/**
 * Handle block list button click
 */
function handleBlockList() {
    try {
        window.location.href = 'BlockCtList.html';
    } catch (error) {
        console.error('Failed to navigate to block list:', error);
        showError('无法打开黑名单页面');
    }
}

/**
 * Handle contact matter button click
 */
function handleContactMatter() {
    try {
        window.location.href = 'Matter.html';
    } catch (error) {
        console.error('Failed to navigate to matters page:', error);
        showError('无法打开事项管理页面');
    }
}

/**
 * Show error message
 * @param {String} message - Error message to display
 */
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

        // Hide error after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initContactList);