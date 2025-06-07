<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>黑名单 (Blacklist)</title>
    <style>
        /* General Body Styling (same as ContactList.html) */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f2f5;
            color: #333;
        }

        /* --- Header Section Styling (mostly same as ContactList.html, but action-buttons are removed) --- */
        .header {
            background-color: #fff;
            padding: 15px 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 20px;
        }

        .header-top-row,
        .header-bottom-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
            justify-content: space-between;
        }

        /* User Profile */
        .user-profile {
            display: flex;
            align-items: center;
            flex-shrink: 0;
        }
        .user-profile img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 10px;
            border: 2px solid #007bff;
            object-fit: cover;
        }
        .user-info .location-city {
            font-weight: bold;
            color: #555;
            display: block;
        }
        .user-info .change-city-link {
            font-size: 0.85em;
            color: #007bff;
            text-decoration: none;
        }
        .user-info .change-city-link:hover {
            text-decoration: underline;
        }

        /* Weather Display */
        .weather-display {
            display: flex;
            gap: 15px;
            flex-grow: 1;
            justify-content: center;
            flex-wrap: wrap;
        }
        .weather-day {
            text-align: center;
            padding: 5px 10px;
            border: 1px solid #eee;
            border-radius: 5px;
            background-color: #f9f9f9;
            flex-shrink: 0;
            min-width: 100px;
        }
        .weather-day .date {
            font-weight: bold;
            color: #333;
        }
        .weather-day .temp {
            font-size: 0.9em;
            color: #666;
        }

        /* Search Bar */
        .search-bar {
            display: flex;
            align-items: center;
            flex-grow: 1;
            max-width: 400px;
        }
        .search-bar input {
            flex-grow: 1;
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1em;
            margin-right: 5px;
        }
        .search-bar button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
        }
        .search-bar button:hover {
            background-color: #0056b3;
        }

        /* Gender Selector */
        .gender-selector {
            display: flex;
            align-items: center;
            gap: 5px;
            flex-shrink: 0;
        }
        .gender-selector label {
            font-weight: bold;
            color: #555;
        }
        .gender-selector select {
            padding: 8px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: #fff;
        }

        /* Removed .action-buttons styling */

        /* --- Main Content (Table) Styling (same as ContactList.html) --- */
        table {
            width: 90%;
            margin: 0 auto 30px auto;
            border-collapse: collapse;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            background-color: #fff;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px 15px;
            text-align: left;
        }
        th {
            background-color: #007bff;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
        }
        th.sortable {
            cursor: pointer;
            position: relative;
        }
        th.sortable::after {
            content: '';
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            border: 4px solid transparent;
            border-top-color: #fff;
            opacity: 0.5;
        }
        th.sortable.asc::after {
            border-bottom-color: #fff;
            border-top-color: transparent;
        }
        th.sortable.desc::after {
            border-top-color: #fff;
            border-bottom-color: transparent;
        }
        tbody tr:nth-child(even) {
            background-color: #f8f8f8;
        }
        tbody tr:hover {
            background-color: #f0f0f0;
        }
        #errorMessage {
            color: red;
            text-align: center;
            margin-top: 20px;
            font-weight: bold;
        }
        .loading-message {
            text-align: center;
            margin-top: 20px;
            font-style: italic;
            color: #666;
        }
        /* Table Action Button styling */
        .action-button {
            padding: 6px 12px;
            margin: 2px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
            color: white;
        }
        .details-button {
            background-color: #28a745; /* Green */
        }
        .details-button:hover {
            background-color: #218838;
        }
        /* Changed from block-button to unblock-button styling */
        .unblock-button {
            background-color: #007bff; /* Blue */
        }
        .unblock-button:hover {
            background-color: #0056b3;
        }


        /* Responsive adjustments for smaller screens (same as ContactList.html) */
        @media (max-width: 768px) {
            .header {
                padding: 10px;
            }
            .header-top-row,
            .header-bottom-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
            .user-profile, .weather-display, .search-bar, .gender-selector { /* No .action-buttons here */
                width: 100%;
                justify-content: center;
            }
            table {
                width: 98%;
                margin: 10px auto;
            }
            th, td {
                padding: 8px 10px;
                font-size: 0.9em;
            }
        }
        @media (max-width: 480px) {
            .weather-day {
                min-width: unset;
                flex-grow: 1;
            }
        }
    </style>
</head>
<body>
<div class="header">
    <div class="header-top-row">
        <div class="user-profile">
            <img src="https://via.placeholder.com/50" alt="User Photo">
            <div class="user-info">
                <span class="location-city">济州 (Jeju)</span>
                <a href="#" class="change-city-link">[更换城市 (Change City)]</a>
            </div>
        </div>

        <div class="weather-display">
            <div class="weather-day">
                <div class="date">今天12月15 (Today Dec 15)</div>
                <div class="temp">晴 (Clear)</div>
                <div class="temp">-14~0°C</div>
            </div>
            <div class="weather-day">
                <div class="date">明天12月16 (Tomorrow Dec 16)</div>
                <div class="temp">晴转多云 (Clear to Cloudy)</div>
                <div class="temp">-15°C~1°C</div>
            </div>
            <div class="weather-day">
                <div class="date">后天12月17 (Day after tomorrow Dec 17)</div>
                <div class="temp">多云转晴 (Cloudy to Clear)</div>
                <div class="temp">-13°C~-2°C</div>
            </div>
        </div>
    </div>

    <div class="header-bottom-row">
        <div class="search-bar">
            <input type="text" id="searchContact" placeholder="搜索 (Search)">
            <button type="button">
                <svg fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
            </button>
        </div>

        <div class="gender-selector">
            <label for="genderFilter">性别 (Gender):</label>
            <select id="genderFilter">
                <option value="all">全部 (All)</option>
                <option value="male">男 (Male)</option>
                <option value="female">女 (Female)</option>
            </select>
        </div>

    </div>
</div>

<h1 style="text-align: center; color: #007bff; margin-bottom: 20px;">黑名单 (Blacklist)</h1>

<div class="loading-message" id="loadingMessage">Loading contacts...</div>
<p id="errorMessage"></p>

<table id="contactTable">
    <thead>
    <tr>
        <th>姓名 (Name)</th>
        <th id="genderHeader" class="sortable">性别 (Gender)</th>
        <th>电话 (Phone Number)</th>
        <th>操作 (Operations)</th>
        <th>操作 (Operations)</th>
    </tr>
    </thead>
    <tbody>
    </tbody>
</table>

<script src="js/blackCtList.js"></script>
</body>
</html>