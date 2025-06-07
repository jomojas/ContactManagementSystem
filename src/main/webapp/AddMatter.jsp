<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>添加联系人事项 (Add Contact Matter)</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
            padding: 20px;
            box-sizing: border-box;
        }
        .container {
            background-color: #fff;
            padding: 30px 40px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
            text-align: center;
        }
        h1 {
            color: #007bff;
            margin-bottom: 30px;
            font-size: 1.8em;
        }

        /* Contact Profile Display */
        .contact-profile-display {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .contact-profile-display img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #007bff;
            margin-right: 15px;
        }
        .contact-profile-display span {
            font-size: 1.5em;
            font-weight: bold;
            color: #333;
        }

        /* Form Styling */
        .form-group {
            position: relative;
            margin-bottom: 25px;
            text-align: left;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #555;
            font-size: 1em;
        }
        .form-group input[type="date"],
        .form-group input[type="text"] {
            width: calc(100% - 50px); /* Adjust for icon padding */
            padding: 12px 15px 12px 40px; /* Left padding for icon */
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
            font-size: 1.1em;
            transition: border-color 0.2s;
        }
        .form-group input:focus {
            border-color: #007bff;
            outline: none;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        .form-group .input-icon {
            position: absolute;
            left: 12px;
            top: 40px; /* Adjust based on label height */
            color: #888;
            font-size: 1.2em;
        }

        /* Button Styling */
        .add-button {
            background-color: #dc3545; /* Red as in image */
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1.2em;
            font-weight: bold;
            transition: background-color 0.2s;
            margin-top: 20px;
            width: 100%;
        }
        .add-button:hover {
            background-color: #c82333;
        }

        #errorMessage, #successMessage {
            text-align: center;
            margin-top: 20px;
            font-weight: bold;
        }
        #errorMessage {
            color: red;
        }
        #successMessage {
            color: green;
        }
    </style>
</head>
<body>
<div class="container">
    <h1>联系人事项添加 (Add Contact Matter)</h1>

    <div class="contact-profile-display">
        <img id="contactPhoto" src="https://via.placeholder.com/80/CCCCCC/FFFFFF?text=?" alt="Contact Photo">
        <span id="contactName"></span>
    </div>

    <form id="addMatterForm">
        <input type="hidden" id="contactId" name="contactId">

        <div class="form-group">
            <label for="matterDate"><i class="input-icon">&#128197;</i> 日期 (Date):</label>
            <input type="date" id="matterDate" name="matterDate" required>
        </div>

        <div class="form-group">
            <label for="matterDescription"><i class="input-icon">&#9993;</i> 事件 (Event):</label>
            <input type="text" id="matterDescription" name="matterDescription" placeholder="请输入事件描述" required>
        </div>

        <button type="submit" class="add-button">添加 (Add)</button>
    </form>

    <p id="errorMessage"></p>
    <p id="successMessage"></p>
</div>

<script src="js/addMatter.js"></script>
</body>
</html>