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
let pageCount = 1;

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateBlockedContacts();
});

function setupEventListeners() {
    filterButton?.addEventListener('click', () => {
        currentPage = 1;
        currentSearch = searchInput.value.trim();
        currentGender = genderSelect.value;
        updateBlockedContacts();
    });

    prevPageBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateBlockedContacts();
        }
    });

    nextPageBtn?.addEventListener('click', () => {
        if (currentPage < pageCount) {
            currentPage++;
            updateBlockedContacts();
        }
    });
}

function updateBlockedContacts() {
    showLoadingState();

    const url = `/ContactManagementSystem/blockedContacts?searchText=${encodeURIComponent(currentSearch)}&genderFilter=${encodeURIComponent(currentGender)}&page=${currentPage}&pageSize=${pageSize}`;

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Network error");
            return res.json();
        })
        .then(data => {
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
            attachActionButtons();
        })
        .catch(err => {
            loadingMessage.textContent = '';
            errorMessage.textContent = '加载失败，请稍后重试';
            console.error(err);
        });
}

function showLoadingState() {
    contactTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">加载中...</td></tr>`;
    mobileContactList.innerHTML = `<div class="mobile-contact-card" style="text-align: center; padding: 20px;">加载中...</div>`;
    loadingMessage.textContent = '';
    errorMessage.textContent = '';
}

function renderAllBlockedContacts(contacts) {
    renderTable(contacts);
    renderMobile(contacts);
}

function renderTable(contacts) {
    contactTableBody.innerHTML = '';

    contacts.forEach(([name, gender, phone, ctId]) => {
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

function renderMobile(contacts) {
    mobileContactList.innerHTML = '';

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
                <button class="action-button details-button">详情</button>
                <button class="action-button restore-button">还原</button>
            </div>
        `;
        mobileContactList.appendChild(div);
    });
}

function attachActionButtons() {
    function getCtId(button) {
        const parent = button.closest('tr') || button.closest('.mobile-contact-card');
        return parent?.dataset.ctid;
    }

    document.querySelectorAll('.details-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const ctId = getCtId(btn);
            if (ctId) {
                window.location.href = `DetailCt.html?ctId=${encodeURIComponent(ctId)}&isDeleted=1`;
            }
        });
    });

    document.querySelectorAll('.restore-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const ctId = getCtId(btn);
            if (ctId && confirm('确认要还原此联系人吗？')) {
                fetch(`restoreContact?ctid=${encodeURIComponent(ctId)}`, { method: 'POST' })
                    .then(res => {
                        if (!res.ok) throw new Error('恢复失败');
                        return res.json();
                    })
                    .then(data => {
                        if (data.success) {
                            alert(data.message || '已还原');
                            window.location.reload();
                        } else {
                            throw new Error(data.message || '还原失败');
                        }
                    })
                    .catch(err => {
                        alert('操作失败：' + err.message);
                    });
            }
        });
    });
}

function updatePaginationControls() {
    pageInfo.textContent = `第 ${currentPage} 页 / 共 ${pageCount} 页`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= pageCount;
}
