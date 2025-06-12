// Matter.js

let sortDirection = 'asc'; // default sorting direction
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;

// DOM references
const matterSearchInput = document.getElementById("matterSearch");
const matterStatusSelect = document.getElementById("matterStatusFilter");
const searchButton = document.getElementById("searchButton");

const matterTableBody = document.getElementById("contactTableBody");
const mobileContactList = document.getElementById("mobileContactList");
const dateHeader = document.getElementById("timeHeader");
const pageInfo = document.getElementById("pageInfo");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");

// Fetch and update matter list (table + mobile)
function updateMatter() {
    const keyword = matterSearchInput.value.trim();
    const status = matterStatusSelect.value;

    // Clear previous content
    matterTableBody.innerHTML = "";
    mobileContactList.innerHTML = "";

    const params = new URLSearchParams({
        keyword,
        status,
        sort: "date",
        direction: sortDirection,
        page: currentPage,
        pageSize: pageSize
    });

    console.log("Start fetching data");
    fetch("/ContactManagementSystem/matter?" + params.toString())
        .then(response => {
            if (!response.ok) throw new Error("请求失败");
            return response.json();
        })
        .then(data => {
            if (!data || !Array.isArray(data.data)) {
                throw new Error("无效数据格式");
            }

            const matters = data.data;
            totalPages = Math.ceil(data.total / pageSize);
            renderPageInfo();

            if (matters.length === 0) {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan="5" style="text-align:center;">暂无事项</td>`;
                matterTableBody.appendChild(tr);

                const noMobile = document.createElement("div");
                noMobile.textContent = "暂无事项";
                noMobile.style.textAlign = "center";
                noMobile.style.padding = "1rem";
                mobileContactList.appendChild(noMobile);
                return;
            }

            console.log("start rendering data");
            renderMatterTable(matters);
            renderMobileList(matters);
        })
        .catch(err => {
            matterTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">加载失败: ${err.message}</td></tr>`;
            mobileContactList.innerHTML = `<div style="text-align:center;color:red;padding:1rem;">加载失败: ${err.message}</div>`;
        });
}

function renderPageInfo() {
    if (pageInfo) pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        updateMatter();
    }
}

function goToNextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        updateMatter();
    }
}

// Render desktop table rows
function renderMatterTable(matters) {
    console.log("Rendering Table Data");

    matters.forEach(matter => {
        const tr = document.createElement("tr");
        tr.dataset.matterId = matter.id;

        const isDisabled = matter.status === "1" || matter.status === "2";

        tr.innerHTML = `
            <td>${matter.name}</td>
            <td>${matter.date}</td>
            <td>${matter.description}</td>
            <td>
                <button class="action-button complete-button" onclick="changeState('${matter.id}', 'finished')" ${isDisabled ? 'disabled' : ''}>完成</button>
            </td>
            <td>
                <button class="action-button cancel-button" onclick="changeState('${matter.id}', 'cancel')" ${isDisabled ? 'disabled' : ''}>取消</button>
            </td>
        `;

        matterTableBody.appendChild(tr);
    });
}


function renderMobileList(matters) {
    console.log("Rendering Mobile Data");

    matters.forEach(matter => {
        const div = document.createElement("div");
        div.className = "mobile-contact-card";
        div.dataset.matterId = matter.id;

        const isDisabled = matter.status === "1" || matter.status === "2";

        div.innerHTML = `
          <div class="mobile-contact-info">
              <div><strong>姓名:</strong> ${matter.name}</div>
              <div><strong>时间:</strong> ${matter.date}</div>
              <div><strong>事件:</strong> ${matter.description}</div>
          </div>
          <div class="mobile-contact-actions">
            <button class="action-button complete-button" style="flex: 1; margin-right: 5px;" onclick="changeState('${matter.id}', 'finished')" ${isDisabled ? 'disabled' : ''}>完成</button>
            <button class="action-button cancel-button" style="flex: 1;" onclick="changeState('${matter.id}', 'cancel')" ${isDisabled ? 'disabled' : ''}>取消</button>
          </div>
        `;

        mobileContactList.appendChild(div);
    });
}


function changeState(matterId, action) {
    const actionText = action === 'finished' ? '完成' : '取消';
    const confirmMsg = `确认将事项标记为${actionText}？`;

    if (!confirm(confirmMsg)) return;

    fetch("/ContactManagementSystem/matter", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ matterId, action })
    })
        .then(response => {
            if (!response.ok) return response.text().then(msg => { throw new Error(msg); });
            alert(`事项已${actionText}`);
            updateMatter();
        })
        .catch(err => alert("操作失败: " + err.message));
}

function toggleSortDirection() {
    sortDirection = (sortDirection === 'asc') ? 'desc' : 'asc';
    dateHeader.textContent = sortDirection === 'asc' ? "时间 ▲▼" : "时间 ▼▲";
    updateMatter();
}

// Event listeners
matterSearchInput.addEventListener("input", debounce(() => {}, 400));
searchButton.addEventListener("click", () => { currentPage = 1; updateMatter(); });
dateHeader.addEventListener("click", toggleSortDirection);
prevPageBtn.addEventListener("click", goToPreviousPage);
nextPageBtn.addEventListener("click", goToNextPage);

document.addEventListener("DOMContentLoaded", updateMatter);

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
