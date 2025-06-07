<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>联系人事项提醒 (Contact Matter Reminder)</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f2f5;
            color: #333;
        }

        .header {
            background-color: #fff;
            padding: 15px 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            text-align: center;
        }

        h1 {
            color: #007bff;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 1.8em;
        }

        .controls {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            justify-content: center;
            align-items: center;
            margin-bottom: 25px;
            padding: 0 20px;
        }

        .search-container {
            display: flex;
            flex-grow: 1;
            max-width: 400px;
        }
        .search-container input {
            flex-grow: 1;
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1em;
            margin-right: 5px;
        }
        .search-container button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .search-container button:hover {
            background-color: #0056b3;
        }
        .search-container button svg {
            width: 20px;
            height: 20px;
        }

        /* The .add-matter-button styling block is now technically unused,
           but kept for clarity if it were to be re-added later.
           The button itself is removed from the HTML below. */
        .add-matter-button {
            background-color: #28a745; /* Green for Add */
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1em;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .add-matter-button:hover {
            background-color: #218838;
        }
        .add-matter-button svg {
            width: 20px;
            height: 20px;
            margin-right: 5px;
        }

        .status-filter label {
            font-weight: bold;
            color: #555;
            margin-right: 5px;
        }
        .status-filter select {
            padding: 8px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: #fff;
        }

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
        .action-button {
            padding: 6px 12px;
            margin: 2px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
            color: white;
        }
        .cancel-button {
            background-color: #dc3545; /* Red */
        }
        .cancel-button:hover {
            background-color: #c82333;
        }
        .complete-button {
            background-color: #007bff; /* Blue */
        }
        .complete-button:hover {
            background-color: #0056b3;
        }
        .status-completed {
            color: #28a745; /* Green for completed */
            font-weight: bold;
        }
        .status-cancelled {
            color: #dc3545; /* Red for cancelled */
            font-weight: bold;
            text-decoration: line-through;
        }

        /* Pagination Styling */
        .pagination-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-top: 20px;
            margin-bottom: 20px;
        }
        .pagination-controls button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
        }
        .pagination-controls button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        .pagination-controls button:hover:not(:disabled) {
            background-color: #0056b3;
        }
        .pagination-controls span {
            font-weight: bold;
            color: #555;
        }

        #loadingMessage, #errorMessage {
            text-align: center;
            margin-top: 20px;
            font-weight: bold;
        }
        #errorMessage {
            color: red;
        }

        @media (max-width: 768px) {
            .controls {
                flex-direction: column;
                align-items: stretch;
            }
            .search-container {
                width: 100%;
                margin-bottom: 10px;
            }
            /* The .add-matter-button was removed, so this rule is also technically unused */
            /* .add-matter-button, */
            .status-filter {
                width: 100%;
                justify-content: center;
            }
            table {
                width: 98%;
            }
            th, td {
                padding: 10px 8px;
                font-size: 0.9em;
            }
        }
    </style>
</head>
<body>
<div class="header">
    <h1>联系人事项提醒 (Contact Matter Reminder)</h1>
    <div class="controls">
        <div class="search-container">
            <input type="text" id="matterSearch" placeholder="搜索 (Search by name or event)">
            <button type="button">
                <svg fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
            </button>
        </div>

        <div class="status-filter">
            <label for="matterStatusFilter">状态 (Status):</label>
            <select id="matterStatusFilter">
                <option value="all">全部 (All)</option>
                <option value="pending">待完成 (To be done)</option>
                <option value="completed">完成 (Completed)</option>
                <option value="cancelled">取消 (Cancelled)</option>
            </select>
        </div>
    </div>
</div>

<div class="loading-message" id="loadingMessage">加载事项中... (Loading matters...)</div>
<p id="errorMessage"></p>

<table id="matterTable">
    <thead>
    <tr>
        <th>姓名 (Name)</th>
        <th id="dateHeader" class="sortable">时间 (Date)</th>
        <th>事件 (Event)</th>
        <th>操作 (Operations)</th>
        <th>操作 (Operations)</th>
    </tr>
    </thead>
    <tbody>
    </tbody>
</table>

<div class="pagination-controls">
    <button id="prevPageBtn" disabled>上一页 (Previous)</button>
    <span id="pageInfo">第 1 页 (Page 1)</span>
    <button id="nextPageBtn">下一页 (Next)</button>
</div>

<script src="js/contactMatter.js"></script>
</body>
</html>