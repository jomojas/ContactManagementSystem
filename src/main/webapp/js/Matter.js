// Matter.js

let sortDirection = 'asc'; // default sorting direction

// DOM references
const matterSearchInput = document.getElementById("matterSearch");
const matterStatusSelect = document.getElementById("matterStatusFilter");
const searchButton = document.getElementById("searchButton");

const matterTableBody = document.getElementById("contactTableBody");
const mobileContactList = document.getElementById("mobileContactList");
const dateHeader = document.getElementById("timeHeader");

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
        direction: sortDirection
    });

    console.log("Start fetching data");
    fetch("/ContactManagementSystem/matter?" + params.toString())
        .then(response => {
            if (!response.ok) throw new Error("请求失败");
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
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
            renderMatterTable(data);
            renderMobileList(data);
        })
        .catch(err => {
            matterTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">加载失败: ${err.message}</td></tr>`;
            mobileContactList.innerHTML = `<div style="text-align:center;color:red;padding:1rem;">加载失败: ${err.message}</div>`;
        });
}

// Render desktop table rows
function renderMatterTable(matters) {
    console.log("Rendering Table Data");

    matters.forEach(matter => {
        const tr = document.createElement("tr");

        // Use dataset to store matter id for reference if needed
        tr.dataset.matterId = matter.id;

        // Build table row with operation buttons calling changeState with matter.id and action
        tr.innerHTML = `
            <td>${matter.name}</td>
            <td>${matter.date}</td>
            <td>${matter.description}</td>
            <td>
                <button class="action-button complete-button" onclick="changeState('${matter.id}', 'finished')">完成</button>
            </td>
            <td>
                <button class="action-button cancel-button" onclick="changeState('${matter.id}', 'cancel')">取消</button>
            </td>
        `;

        matterTableBody.appendChild(tr);
    });
}

// Render mobile contact cards
function renderMobileList(matters) {
    console.log("Rendering Mobile Data");

    matters.forEach(matter => {
        const div = document.createElement("div");
        div.className = "mobile-contact-card";
        div.dataset.matterId = matter.id;

        div.innerHTML = `
          <div class="mobile-contact-info">
            <div><strong>姓名:</strong> ${matter.name}</div>
            <div><strong>时间:</strong> ${matter.date}</div>
            <div><strong>事件:</strong> ${matter.description}</div>
          </div>
          <div class="mobile-contact-actions">
            <button class="action-button complete-button" style="flex: 1; margin-right: 5px;" onclick="changeState('${matter.id}', 'finished')">完成</button>
            <button class="action-button cancel-button" style="flex: 1;" onclick="changeState('${matter.id}', 'cancel')">取消</button>
          </div>
        `;

        mobileContactList.appendChild(div);
    });
}

// Send POST request to change matter status
function changeState(matterId, action) {
    const actionText = action === 'finished' ? '完成' : '取消';
    const confirmMsg = `确认将事项标记为${actionText}？`;

    if (!confirm(confirmMsg)) return;

    fetch("/ContactManagementSystem/matter", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            matterId,
            action
        })
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(msg => { throw new Error(msg); });
            }
            alert(`事项已${actionText}`);
            updateMatter(); // 或者 window.location.reload();
        })
        .catch(err => {
            alert("操作失败: " + err.message);
        });
}


// Toggle sort direction on date header click
function toggleSortDirection() {
    sortDirection = (sortDirection === 'asc') ? 'desc' : 'asc';

    // Optional: Update header arrow indicators
    if (sortDirection === "asc") {
        dateHeader.textContent = "时间 ▲▼";
    } else {
        dateHeader.textContent = "时间 ▼▲";
    }

    updateMatter();
}

// Event listeners
matterSearchInput.addEventListener("input", debounce(() => {}, 400)); // Optional: can debounce updateMatter if instant search wanted
// matterStatusSelect.addEventListener("change", updateMatter);
searchButton.addEventListener("click", updateMatter);
dateHeader.addEventListener("click", toggleSortDirection);

// Initial load
document.addEventListener("DOMContentLoaded", updateMatter);

// Debounce helper function
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
