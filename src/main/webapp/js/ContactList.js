/**
 * Contact List Management Script with Pagination and Weather Display
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
const changeCityBtn = document.querySelector('.change-city-link');
const locationCitySpan = document.querySelector('.location-city');
const weatherDisplay = document.querySelector('.weather-display');

let currentSearch = '';
let currentGender = 'all';
let currentPage = 1;
const pageSize = 7;
let totalPages = 1;

async function initContactList() {
    loadUserProfileImage();
    setupEventListeners();
    updateContacts();

    try {
        const res = await fetch('/ContactManagementSystem/GetCity');
        const cityData = await res.json();

        if (cityData.name && cityData.lat && cityData.lon) {
            locationCitySpan.textContent = cityData.name;
            loadWeather(cityData.name, cityData.lat, cityData.lon);
        } else {
            console.log("Fall back to original city");
            const fallbackCity = locationCitySpan?.textContent.trim();
            console.log(fallbackCity);
            const resolved = await resolveCityName(fallbackCity);
            console.log(resolved.name, resolved.lat, resolved.lon);
            if (fallbackCity) loadWeather(resolved.name, resolved.lat, resolved.lon);
        }
    } catch (e) {
        console.error("Failed to get session city:", e);
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

    changeCityBtn?.addEventListener('click', () => {
        showCityInputModal();
    });
}

function showCityInputModal() {
    // Inject input focus style dynamically
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        #cityInput:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 6px rgba(59,130,246,0.5);
        }
        #setCityBtn {
            background-color: #e0e7ff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        #setCityBtn:hover {
            background-color: #3b82f6;
            color: white;
        }
        #cancelCityBtn {
            background-color: #e0e7ff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        #cancelCityBtn:hover {
            background-color: #3b82f6;
            color: white;
        }
    `;
    document.head.appendChild(styleTag);

    // Create modal container
    const modal = document.createElement("div");
    modal.className = "city-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.5)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "1000";

    // Modal content
    modal.innerHTML = `
        <div class="city-modal-content" style="background:#fff; padding:20px; border-radius:5px; width:300px; text-align:center;">
            <h3>请输入城市名称</h3>
            <input type="text" id="cityInput" placeholder="请输入城市名称或英文名" style="width: 90%; padding: 8px; margin-bottom: 10px; border: 1.5px solid #ccc; border-radius: 4px;" />
            <div id="cityErrorMsg" style="color: red; margin-bottom: 10px; display: none;"></div>
            <button id="setCityBtn" style="margin-right: 10px; padding: 6px 12px;">设定</button>
            <button id="cancelCityBtn" style="padding: 6px 12px;">取消</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listener for "Set" button
    modal.querySelector('#setCityBtn').addEventListener('click', () => {
        validateCityAndSet(modal);
    });

    // Event listener for "Cancel" button
    modal.querySelector('#cancelCityBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}


async function resolveCityName(cityName) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1&accept-language=en`;

    console.log(cityName);
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'ContactManagementSystem/1.0 (jomojassen@gmail.com)'  // required by Nominatim
            }
        });

        if (!res.ok) throw new Error('Nominatim API request failed');

        const data = await res.json();
        if (data.length === 0) throw new Error('No matching city found');

        const city = data[0];
        return {
            name: city.display_name.split(',')[0], // Extract the main name
            lat: city.lat,
            lon: city.lon
        };
    } catch (err) {
        console.error("City resolution failed:", err);
        return null;
    }
}

async function validateCityAndSet() {
    const input = document.getElementById("cityInput").value.trim();
    const errorMsg = document.getElementById("cityErrorMsg");

    if (!input) return;

    const resolved = await resolveCityName(input);
    if (!resolved) {
        errorMsg.style.display = "block";
        errorMsg.textContent = "无效的城市名称，请重新输入";
        return;
    }

    // Save to session
    await fetch('/ContactManagementSystem/SetCity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `name=${encodeURIComponent(resolved.name)}&lat=${resolved.lat}&lon=${resolved.lon}`
    });

    // Update UI
    locationCitySpan.textContent = input;
    document.querySelector('.city-modal')?.remove();
    loadWeather(resolved.name, resolved.lat, resolved.lon);
}

function loadWeather(city, lat = null, lon = null) {
    let url = `/ContactManagementSystem/Weather`;
    if (lat !== null && lon !== null) {
        url += `?lat=${lat}&lon=${lon}`;
    } else {
        url += `?city=${encodeURIComponent(city)}`;
    }

    console.log(url);
    console.log("Now start fetching data");
    fetch(url)
      .then(res => res.text()) // 🔄 changed from .json() to .text()
      .then(text => {
        console.log("Raw weather response:", text); // 👈 check what's really returned
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("Response is not valid JSON:\n" + text);
        }

        if (!data.forecast) {
          throw new Error("No forecast field in JSON");
        }

        weatherDisplay.innerHTML = data.forecast.map(day => `
          <div class="weather-day">
            <div class="date">${day.date}</div>
            <div class="temp">${day.weather}</div>
            <div class="temp">${day.temp}</div>
          </div>
        `).join("");
      })
      .catch(err => console.error("Weather load failed:", err));
}

function updateContacts() {
    showLoadingState();

    fetch(`/ContactManagementSystem/contacts?searchText=${encodeURIComponent(currentSearch)}&genderFilter=${encodeURIComponent(currentGender)}&page=${currentPage}&pageSize=${pageSize}`)
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(data => {
            loadingMessage.textContent = '';
            const contacts = data.contacts || [];
            const total = data.total || 0;
            totalPages = Math.ceil(total / pageSize);
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
            if (ctId) window.location.href = `DetailCt.html?ctId=${encodeURIComponent(ctId)}&isDeleted=0`;
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
