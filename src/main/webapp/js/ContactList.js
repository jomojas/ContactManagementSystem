/**
 * Contact List Management Script with Pagination
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
let totalPages = 1;

function initContactList() {
    loadUserProfileImage();
    setupEventListeners();
    updateContacts();
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

function setupEventListeners() {
    filterButton?.addEventListener('click', () => {
        currentSearch = searchInput.value;
        currentGender = genderSelect.value;
        currentPage = 1;
        updateContacts();
    });

    searchInput?.addEventListener('input', function () {
        currentSearch = this.value;
    });

    genderSelect?.addEventListener('change', function () {
        currentGender = this.value;
    });

    document.getElementById('addContactBtn')?.addEventListener('click', () => {
        window.location.href = 'addNewCt.html';
    });

    document.getElementById('blockListBtn')?.addEventListener('click', () => {
        window.location.href = 'BlockCtList.html';
    });

    document.getElementById('contactMatterBtn')?.addEventListener('click', () => {
        window.location.href = 'Matter.html';
    });

    prevPageBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateContacts();
        }
    });

    nextPageBtn?.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateContacts();
        }
    });
}

function updateContacts() {
    showLoadingState();

    console.log("Start Fetching Data");
    fetch(`/ContactManagementSystem/contacts?searchText=${encodeURIComponent(currentSearch)}&genderFilter=${encodeURIComponent(currentGender)}&page=${currentPage}&pageSize=${pageSize}`)
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(data => {
            loadingMessage.textContent = '';

            console.log("Fetching Data Successfully");
            const contacts = data.contacts || [];
            console.log("length:" + contacts.length);
            const total = data.total || 0;
            console.log("total:" + total);
            totalPages = Math.ceil(total / pageSize);

            console.log("totalPages:" + totalPages);
            console.log("Start rendering data");
            renderContacts(contacts);
            updatePaginationControls();
        })
        .catch(error => {
            loadingMessage.textContent = '';
            errorMessage.textContent = '加载联系人时出错，请稍后重试。';
            setTimeout(() => errorMessage.textContent = '', 3000);
        });
}

function showLoadingState() {
    contactTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">加载中...</td></tr>';
    mobileContactList.innerHTML = '<div class="mobile-contact-card"><div style="text-align: center; padding: 20px;">加载中...</div></div>';
    loadingMessage.textContent = '';
    errorMessage.textContent = '';
}

function renderContacts(contacts) {
    renderTableContacts(contacts);
    renderMobileContacts(contacts);
    attachButtonListeners();
}

function renderTableContacts(contacts) {
    contactTableBody.innerHTML = '';

    if (!contacts || contacts.length === 0) {
        contactTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">没有找到联系人</td></tr>';
        return;
    }

    contacts.forEach(([name, gender, phone, ctId]) => {
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

function renderMobileContacts(contacts) {
    mobileContactList.innerHTML = '';

    if (!contacts || contacts.length === 0) {
        mobileContactList.innerHTML = '<div class="mobile-contact-card"><div style="text-align: center; padding: 20px;">没有找到联系人</div></div>';
        return;
    }

    contacts.forEach(([name, gender, phone, ctId]) => {
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

function initMobileDropdowns() {
    document.querySelectorAll('.mobile-action-dropdown').forEach(dropdown => {
        dropdown.addEventListener('click', function (e) {
            e.stopPropagation();
            document.querySelectorAll('.mobile-dropdown-content').forEach(c => c.style.display = 'none');
            this.querySelector('.mobile-dropdown-content').style.display = 'block';
        });
    });

    document.addEventListener('click', function () {
        document.querySelectorAll('.mobile-dropdown-content').forEach(c => c.style.display = 'none');
    });
}

function attachButtonListeners() {
    function getCtIdFromButton(button) {
        const parent = button.closest('tr') || button.closest('.mobile-contact-card');
        return parent?.dataset.ctid;
    }

    document.querySelectorAll('.details-button').forEach(button => {
        button.addEventListener('click', () => {
            const ctId = getCtIdFromButton(button);
            if (ctId) window.location.href = `DetailCt.html?ctId=${encodeURIComponent(ctId)}`;
        });
    });

    document.querySelectorAll('.block-button').forEach(button => {
        button.addEventListener('click', () => {
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

    document.querySelectorAll('.add-matter-button').forEach(button => {
        button.addEventListener('click', () => {
            const ctId = getCtIdFromButton(button);
            if (ctId) window.location.href = `AddMatter.html?ctId=${encodeURIComponent(ctId)}`;
        });
    });
}

function updatePaginationControls() {
    pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

document.addEventListener('DOMContentLoaded', initContactList);
