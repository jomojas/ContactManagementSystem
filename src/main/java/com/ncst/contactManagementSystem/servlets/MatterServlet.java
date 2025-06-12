package com.ncst.contactManagementSystem.servlets;

import com.ncst.contactManagementSystem.util.DBUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.Collections;
import java.util.List;

@WebServlet("/matter")
public class MatterServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        System.out.println("in MatterServlet");
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");

        HttpSession session = request.getSession(false);
        String userId = (session != null) ? (String) session.getAttribute("userId") : null;

        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"未登录，请重新登录。\"}");
            return;
        }

        String keyword = request.getParameter("keyword");
        String statusParam = request.getParameter("status");
        String direction = request.getParameter("direction");
        String pageParam = request.getParameter("page");
        String pageSizeParam = request.getParameter("pageSize");

        int status;
        switch (statusParam) {
            case "pending": status = 0; break;
            case "cancelled": status = 1; break;
            case "completed": status = 2; break;
            default: status = 3; break;
        }

        int page = (pageParam != null) ? Integer.parseInt(pageParam) : 1;
        int pageSize = (pageSizeParam != null) ? Integer.parseInt(pageSizeParam) : 10;

        try {
            System.out.println("Start getting matters");
            List<String[]> matters = DBUtil.getFilteredMatter(userId, keyword, status, page, pageSize);
            int total = DBUtil.countFilteredMatter(userId, keyword, status);

            if ("desc".equalsIgnoreCase(direction)) {
                Collections.reverse(matters);
            }

            PrintWriter out = response.getWriter();
            StringBuilder json = new StringBuilder();
            json.append("{\"data\":[");

            for (int i = 0; i < matters.size(); i++) {
                String[] m = matters.get(i);
                String ctId = m[0];
                String time = m[1];
                String desc = m[2];
                String matterId = m[3];
                String matterStatus = m[4];

                String ctName = DBUtil.getContactName(ctId);  //  Fetch contact name

                json.append(String.format(
                        "{\"id\":\"%s\", \"date\":\"%s\", \"description\":\"%s\", \"name\":\"%s\", \"status\":\"%s\"}",
                        matterId, time, desc, ctName, matterStatus
                ));
                if (i < matters.size() - 1) {
                    json.append(",");
                }
            }

            json.append("],\"total\":").append(total).append("}");
            out.print(json);
            out.flush();


        } catch (SQLException e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "数据库错误: " + e.getMessage());
        }
    }



    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String matterId = request.getParameter("matterId");
        String action = request.getParameter("action");

        if (matterId == null || action == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "缺少参数");
            return;
        }

        try {
            if ("cancel".equalsIgnoreCase(action)) {
                DBUtil.deleteMatter(matterId);
            } else if ("finished".equalsIgnoreCase(action)) {
                DBUtil.finishMatter(matterId);
            } else {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "未知操作类型");
                return;
            }

            response.setStatus(HttpServletResponse.SC_OK);
        } catch (SQLException e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "数据库操作失败: " + e.getMessage());
        }
    }
}
