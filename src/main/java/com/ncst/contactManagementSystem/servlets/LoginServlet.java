package com.ncst.contactManagementSystem.servlets;

import com.ncst.contactManagementSystem.util.DBUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.File;
import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    private static final String IMAGE_ROOT = "D:/IntellijIDEA/project/images/";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");

        String userId = request.getParameter("username");
        String password = request.getParameter("password");

        if(userId == null) {
            System.out.println("Empty user");
        }

        if(password == null) {
            System.out.println("Empty user");
        }

        if (userId == null || password == null || userId.trim().isEmpty() || password.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"status\":\"fail\", \"message\":\"用户名和密码不能为空\"}");
            return;
        }

        try {
            String storedPassword = DBUtil.getUser(userId);

            if (storedPassword != null && storedPassword.equals(password)) {
                // 1. Invalidate old session if any
                HttpSession oldSession = request.getSession(false);
                if (oldSession != null) {
                    oldSession.invalidate(); // kill the old session
                }

                // 2. Create a new session
                HttpSession session = request.getSession(true); // start fresh
                session.setAttribute("userId", userId);
                session.setMaxInactiveInterval(30 * 60); // 30 minutes

                // 3. Create image folder for current user
                File userDir = new File(IMAGE_ROOT + userId);
                userDir.mkdir();  // Only creates the directory if it doesn't exist

                // 登录成功
                response.getWriter().write("{\"status\":\"success\"}");
            } else {
                // 登录失败
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
                response.getWriter().write("{\"status\":\"fail\", \"message\":\"用户名或密码不正确\"}");
            }

        } catch (SQLException e) {
            e.printStackTrace();

            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // 500
            response.getWriter().write("{\"status\":\"error\", \"message\":\"数据库错误，请稍后再试\"}");
        }

    }
}
