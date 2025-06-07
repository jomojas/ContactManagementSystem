package com.ncst.contactManagementSystem.servlets;

import com.ncst.contactManagementSystem.util.DBUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;

@WebServlet("/blockContact")
public class BlockContactServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/plain; charset=UTF-8");

        String ctId = request.getParameter("ctId");

        if (ctId == null || ctId.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            try (PrintWriter out = response.getWriter()) {
                out.print("联系人ID无效 (Invalid contact ID)");
            }
            return;
        }

        try {
            boolean success = DBUtil.deleteContact(ctId);
            if (success) {
                response.setStatus(HttpServletResponse.SC_OK);
                try (PrintWriter out = response.getWriter()) {
                    out.print("联系人已成功拉黑 (Contact blocked)");
                }
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                try (PrintWriter out = response.getWriter()) {
                    out.print("未找到联系人或操作失败 (Contact not found or update failed)");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            try (PrintWriter out = response.getWriter()) {
                out.print("服务器错误 (Server error)");
            }
        }
    }
}
