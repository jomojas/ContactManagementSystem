package com.ncst.contactManagementSystem.servlets;

import com.ncst.contactManagementSystem.util.DBUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;

@WebServlet("/restoreContact")
public class RestoreContactServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");

        String ctId = request.getParameter("ctid"); // Note: lowercase 'id' to match JS code

        if (ctId == null || ctId.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            sendJsonResponse(response, false, "联系人ID无效");
            return;
        }

        try {
            // Call DBUtil to restore the contact
            boolean success = DBUtil.cancelDeleteContact(ctId);

            if (success) {
                sendJsonResponse(response, true, "联系人已成功还原");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                sendJsonResponse(response, false, "还原失败: 联系人不存在或已被还原");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            sendJsonResponse(response, false, "服务器错误: " + e.getMessage());
        }
    }

    private void sendJsonResponse(HttpServletResponse response, boolean success, String message)
            throws IOException {
        String jsonResponse = String.format("{\"success\": %b, \"message\": \"%s\"}",
                success, message);

        try (PrintWriter out = response.getWriter()) {
            out.print(jsonResponse);
        }
    }
}