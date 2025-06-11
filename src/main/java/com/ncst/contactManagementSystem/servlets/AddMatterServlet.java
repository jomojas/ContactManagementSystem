package com.ncst.contactManagementSystem.servlets;

import com.ncst.contactManagementSystem.util.DBUtil;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import javax.servlet.annotation.MultipartConfig;


@MultipartConfig
@WebServlet("/addMatter")
public class AddMatterServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        String ctId = request.getParameter("ctId");
        String matterTime = request.getParameter("matterDate");
        String matter = request.getParameter("matterDescription");

        response.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = response.getWriter();

        System.out.println(ctId);
        System.out.println(matterTime);
        System.out.println(matter);
        if (ctId == null || matterTime == null || matter == null ||
                ctId.trim().isEmpty() || matterTime.trim().isEmpty() || matter.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("缺少必要参数");
            return;
        }

        try {
            int maxId = DBUtil.getMaxMatterID();
            int newMatterId = maxId + 1;

            boolean added = DBUtil.addMatter(String.valueOf(newMatterId), matterTime, matter, ctId);
            if (added) {
                out.print("事项添加成功");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("数据库插入失败");
            }

        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("服务器错误：" + e.getMessage());
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");

        String ctId = request.getParameter("ctId");
        HttpSession session = request.getSession(false);

        if (ctId == null || ctId.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"ctId 参数缺失\"}");
            return;
        }

        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"用户未登录\"}");
            return;
        }

        String userId = (String) session.getAttribute("userId");

        try {
            String picName = DBUtil.getContactPic(ctId);
            String contactName = DBUtil.getContactName(ctId);

            if (picName == null) picName = "default.jpg";
            if (contactName == null) contactName = "未知";

            String json = String.format(
                    "{\"userId\":\"%s\", \"picName\":\"%s\", \"contactName\":\"%s\"}",
                    escapeJson(userId), escapeJson(picName), escapeJson(contactName)
            );

            response.getWriter().write(json);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"服务器内部错误: " + e.getMessage() + "\"}");
        }
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
