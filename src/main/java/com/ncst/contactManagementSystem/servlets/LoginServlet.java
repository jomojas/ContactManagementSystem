package com.ncst.contactManagementSystem.servlets;

import com.ncst.contactManagementSystem.util.DBUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
//        response.setContentType("text/html;charset=UTF-8");
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

//            response.setContentType("application/json;charset=UTF-8");

            if (storedPassword != null && storedPassword.equals(password)) {
                HttpSession session = request.getSession();
                session.setAttribute("userId", userId);
                session.setMaxInactiveInterval(30 * 60); // 30分钟

                // 登录成功
                response.getWriter().write("{\"status\":\"success\"}");
            } else {
                // 登录失败
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
                response.getWriter().write("{\"status\":\"fail\", \"message\":\"用户名或密码不正确\"}");
            }

        } catch (SQLException e) {
            e.printStackTrace();

//            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // 500
            response.getWriter().write("{\"status\":\"error\", \"message\":\"数据库错误，请稍后再试\"}");
        }

    }
}
