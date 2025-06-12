/**
 * Blocked Contact List Management Script with Pagination
 */

// DOM Elements
const filterButton = document.getElementById('filterButton');
const searchInput = document.getElementById('searchText');
const genderSelect = document.getElementById('genderFilter');
const contactTableBody = document.getElementById('contactTableBody');
const mobileContactList = document.getElementById('mobileContactList');
const errorMessage = document.getElementById('errorMessage');
const loadingMessage = document.getElementById('loadingMessage');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfo = document.getElementById('pageInfo');

let currentSearch = '';
let currentGender = 'all';
let currentPage = 1;
const pageSize = 7;
let pageCount = 1; // total pages, will be calculated from total records

function initBlockedContactList() {
    loadUserProfileImage();
    setupEventListeners();
    updateBlockedContacts();
}

function setupEventListeners() {
    if (filterButton) {
        filterButton.addEventListener('click', () => {
            currentPage = 1; // reset to first page when filter changes
            currentSearch = searchInput.value;
            currentGender = genderSelect.value;
            updateBlockedContacts();
        });
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateBlockedContacts();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (currentPage < pageCount) {
                currentPage++;
                updateBlockedContacts();
            }
        });
    }
}

function loadUserProfileImage() {
    const profileImg = document.getElementById("userProfilePhoto");
    if (!profileImg) return;

    fetch('getUserId')
        .then(response => response.json())
        .then(data => {
            if (data.userId && data.userId !== "default") {
                const newSrc = `image?user=${encodeURIComponent(data.userId)}&file=profile.jpg`;
                profileImg.src = newSrc;
                profileImg.onerror = function () {
                    this.src = "image?user=default&file=default.jpg";
                };
            }
        })
        .catch(() => {
            profileImg.src = "image?user=default&file=default.jpg";
        });
}

function updateBlockedContacts() {
    showLoadingState();

    // Calculate offset based on currentPage and pageSize
    // const offset = (currentPage - 1) * pageSize;

    const url = `/ContactManagementSystem/blockedContacts?searchText=${encodeURIComponent(currentSearch)}&genderFilter=${encodeURIComponent(currentGender)}&page=${currentPage}&pageSize=${pageSize}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            // data should be { contacts: [...], total: number }
            loadingMessage.textContent = '';

            const contacts = data.contacts || [];
            const total = data.total || 0;

            pageCount = Math.ceil(total / pageSize);
            updatePaginationControls();

            if (contacts.length === 0) {
                loadingMessage.textContent = '当前没有已拉黑的联系人';
                contactTableBody.innerHTML = '';
                mobileContactList.innerHTML = '';
                return;
            }

            renderAllBlockedContacts(contacts);
            attachButtonListeners();
        })
        .catch(error => {
            loadingMessage.textContent = '';
            errorMessage.textContent = '加载已拉黑联系人时出错，请稍后重试。';
            setTimeout(() => errorMessage.textContent = '', 3000);
            console.error('Error loading blocked contacts:', error);
        });
}

function showLoadingState() {
    if (contactTableBody) {
        contactTableBody.innerHTML = `
            <tr><td colspan="5" style="text-align: center;">加载中...</td></tr>
        `;
    }

    if (mobileContactList) {
        mobileContactList.innerHTML = `
            <div class="mobile-contact-card" style="text-align: center; padding: 20px;">加载中...</div>
        `;
    }

    if (loadingMessage) loadingMessage.textContent = '';
    if (errorMessage) errorMessage.textContent = '';
}

function renderAllBlockedContacts(contacts) {
    renderTableBlockedContacts(contacts);
    renderMobileBlockedContacts(contacts);
}

function renderTableBlockedContacts(contacts) {
    contactTableBody.innerHTML = '';
    if (!contacts.length) {
        contactTableBody.innerHTML = `
            <tr><td colspan="5" style="text-align: center;">没有找到已拉黑的联系人</td></tr>
        `;
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

function renderMobileBlockedContacts(contacts) {
    mobileContactList.innerHTML = '';
    if (!contacts.length) {
        mobileContactList.innerHTML = `
            <div class="mobile-contact-card" style="text-align: center; padding: 20px;">没有找到已拉黑的联系人</div>
        `;
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

function attachButtonListeners() {
    function getCtIdFromButton(button) {
        const parentElement = button.closest('tr') || button.closest('.mobile-contact-card');
        return parentElement ? parentElement.dataset.ctid : null;
    }

    document.querySelectorAll('.details-button').forEach(button => {
        button.addEventListener('click', () => {
            const ctId = getCtIdFromButton(button);
            if (ctId) {
                window.location.href = `DetailCt.html?ctId=${encodeURIComponent(ctId)}`;
            }
        });
    });

    document.querySelectorAll('.restore-button').forEach(button => {
        button.addEventListener('click', () => {
            const ctId = getCtIdFromButton(button);
            if (ctId && confirm('确认要还原此联系人吗？')) {
                fetch(`restoreContact?ctid=${encodeURIComponent(ctId)}`, { method: 'POST' })
                    .then(response => {
                        if (response.ok) return response.json();
                        return response.json().then(data => { throw new Error(data.message || '还原失败'); });
                    })
                    .then(data => {
                        if (data.success) {
                            alert(data.message || '联系人已成功还原');
                            // updateBlockedContacts(); // refresh list
                            window.location.reload();
                        } else {
                            throw new Error(data.message || '还原失败');
                        }
                    })
                    .catch(error => alert('操作失败: ' + error.message));
            }
        });
    });
}

function updatePaginationControls() {
    if (!pageInfo || !prevPageBtn || !nextPageBtn) return;

    pageInfo.textContent = `第 ${currentPage} 页 / 共 ${pageCount} 页`;

    prevPageBtn.disabled = (currentPage <= 1);
    nextPageBtn.disabled = (currentPage >= pageCount);
}

// Initialize on DOM loaded
document.addEventListener('DOMContentLoaded', initBlockedContactList);
