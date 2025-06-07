<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>联系人详情/编辑 (Contact Details/Edit)</title>
    <style>
        /* General Body Styling */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f2f5;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
            box-sizing: border-box;
        }

        .container {
            background-color: #fff;
            padding: 25px 35px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
            box-sizing: border-box;
        }

        h1 {
            text-align: center;
            color: #007bff;
            margin-bottom: 30px;
            font-size: 1.8em;
        }

        /* Profile Photo Display/Upload */
        .profile-photo-upload {
            text-align: center;
            margin-bottom: 30px;
        }
        .profile-photo-upload label {
            cursor: pointer;
            display: inline-block;
            position: relative;
        }
        .profile-photo-upload img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #007bff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            transition: transform 0.2s ease-in-out;
        }
        .profile-photo-upload img:hover {
            transform: scale(1.05);
        }
        .profile-photo-upload input[type="file"] {
            display: none; /* Hide the default file input */
        }
        /* Optional: Add an overlay icon for changing photo */
        .profile-photo-upload label::after {
            content: '&#x21bb;'; /* Unicode for refresh/upload icon */
            font-size: 1.5em;
            color: white;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            padding: 5px;
            position: absolute;
            bottom: 5px;
            right: 5px;
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
        }
        .profile-photo-upload label:hover::after {
            opacity: 1;
        }


        /* Form Grid Layout */
        .form-grid {
            display: grid;
            grid-template-columns: 1fr; /* Single column by default */
            gap: 20px 25px;
        }

        @media (min-width: 600px) {
            .form-grid {
                grid-template-columns: 1fr 1fr; /* Two columns */
            }
            .form-group.full-width {
                grid-column: span 2;
            }
            .form-group.gender-birth {
                grid-column: span 2;
                display: flex;
                justify-content: space-between;
                gap: 15px;
            }
            .form-group.gender-birth > div {
                flex: 1;
                min-width: 150px;
            }
        }

        /* Form Group Styling */
        .form-group {
            position: relative;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #555;
            font-size: 0.95em;
        }

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="tel"],
        .form-group input[type="date"],
        .form-group select { /* Removed textarea from here */
            width: 100%;
            padding: 10px 12px 10px 40px; /* Left padding for icon */
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
            font-size: 1em;
            transition: border-color 0.2s;
        }
        .form-group input:focus,
        .form-group select:focus {
            border-color: #007bff;
            outline: none;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        /* Required field indicator */
        .form-group label.required::after {
            content: '*';
            color: red;
            margin-left: 4px;
        }

        /* Input Icons */
        .form-group .input-icon {
            position: absolute;
            left: 12px;
            top: 38px; /* Adjust based on label height */
            color: #888;
            font-size: 1.2em;
        }
        /* No specific adjustment for textarea icon needed anymore */
        .form-group.gender-birth > div .input-icon {
             top: 38px;
        }


        /* Buttons Section */
        .button-group {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 40px;
        }

        .action-button {
            padding: 12px 25px;
            border: none;
            border-radius: 5px;
            font-size: 1.1em;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
            min-width: 120px;
        }

        .update-button {
            background-color: #007bff; /* Blue for Update */
            color: white;
        }
        .update-button:hover {
            background-color: #0056b3;
        }

        .matter-button {
            background-color: #28a745; /* Green for Matter */
            color: white;
        }
        .matter-button:hover {
            background-color: #218838;
        }

        #loadingMessage, #errorMessage, #successMessage {
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
    <h1>联系人详细信息/编辑 (Contact Details/Edit)</h1>

    <div class="profile-photo-upload">
        <label for="profilePhotoInput">
            <img id="profilePhotoPreview" src="https://via.placeholder.com/120/CCCCCC/FFFFFF?text=No+Photo" alt="Profile Photo">
            <input type="file" id="profilePhotoInput" name="profilePhoto" accept="image/*">
        </label>
    </div>

    <div id="loadingMessage">Loading contact details...</div>
    <p id="errorMessage"></p>
    <p id="successMessage"></p>

    <form id="contactDetailForm" enctype="multipart/form-data">
        <input type="hidden" id="contactId" name="id">

        <div class="form-grid" id="contactDetailsGrid">
            <div class="form-group">
                <label for="name" class="required"><i class="input-icon">&#128100;</i> 姓名 (Name):</label>
                <input type="text" id="name" name="name" placeholder="请输入姓名" required>
            </div>

            <div class="form-group full-width">
                <label for="address" class="required"><i class="input-icon">&#127963;</i> 地址 (Address):</label>
                <input type="text" id="address" name="address" placeholder="请输入地址" required>
            </div>

            <div class="form-group">
                <label for="email" class="required"><i class="input-icon">&#9993;</i> 邮箱 (Email):</label>
                <input type="email" id="email" name="email" placeholder="请输入邮箱" required>
            </div>

            <div class="form-group">
                <label for="qq" class="required"><i class="input-icon">Q</i> QQ:</label>
                <input type="text" id="qq" name="qq" placeholder="请输入QQ号码" required>
            </div>

            <div class="form-group">
                <label for="wechat" class="required"><i class="input-icon">W</i> 微信 (WeChat):</label>
                <input type="text" id="wechat" name="wechat" placeholder="请输入微信号" required>
            </div>

            <div class="form-group">
                <label for="postalCode"><i class="input-icon">&#9992;</i> 邮编 (Postal Code):</label>
                <input type="text" id="postalCode" name="postalCode" placeholder="请输入邮政编码">
            </div>

            <div class="form-group gender-birth">
                <div>
                    <label for="gender" class="required"><i class="input-icon">&#9794;</i> 性别 (Gender):</label>
                    <select id="gender" name="gender" required>
                        <option value="">请选择 (Select)</option>
                        <option value="Male">男 (Male)</option>
                        <option value="Female">女 (Female)</option>
                        <option value="Other">其他 (Other)</option>
                    </select>
                </div>
                <div>
                    <label for="birthDate"><i class="input-icon">&#127874;</i> 出生日期 (Birth Date):</label>
                    <input type="date" id="birthDate" name="birthDate">
                </div>
            </div>

            <div class="form-group">
                <label for="phoneNumber" class="required"><i class="input-icon">&#128222;</i> 电话 (Phone Number):</label>
                <input type="tel" id="phoneNumber" name="phoneNumber" placeholder="请输入电话号码" required>
            </div>
        </div>

        <div class="button-group">
            <button type="submit" class="action-button update-button" id="updateContactBtn">更新 (Update)</button>
            <button type="button" class="action-button matter-button" id="matterContactBtn">事项 (Matter)</button>
        </div>
    </form>
</div>

<script src="js/contactDetail.js"></script>
</body>
</html>