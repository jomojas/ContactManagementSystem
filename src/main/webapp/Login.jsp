<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: Arial, sans-serif;
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .center-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100%;
        }

        .login-form {
            background-color: #fff;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-sizing: border-box;
        }

        .login-form h2 {
            margin-bottom: 1.5rem;
            color: #333;
        }

        .form-group {
            margin-bottom: 1rem;
            text-align: left;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: bold;
            color: #555;
        }

        .form-group input[type="text"],
        .form-group input[type="password"] {
            width: 100%;
            padding: 14px;
            font-size: 16px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }

        button[type="submit"] {
            background-color: #007bff;
            color: white;
            padding: 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 18px;
            width: 100%;
            margin-top: 1rem;
        }

        button[type="submit"]:hover {
            background-color: #0056b3;
        }

        #errorMessage {
            margin-top: 1rem;
            font-size: 0.9em;
            color: red;
        }

        @media (max-width: 480px) {
            .login-form {
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="center-container">
        <div class="login-form">
            <h2>Login</h2>
            <form id="loginForm" onsubmit="return false;">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit">Login</button>
            </form>
            <p id="errorMessage" style="color: red;"></p>
        </div>
    </div>

    <script src="./js/Login.js"></script>
</body>
</html>