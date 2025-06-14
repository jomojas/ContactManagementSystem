package com.ncst.contactManagementSystem.servlets;

import com.ncst.contactManagementSystem.util.DBUtil;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Collections;
import java.util.List;

@WebServlet("/blockedContacts")
public class BlockContactListServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession(false);
        String userId = (session != null) ? (String) session.getAttribute("userId") : null;

        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"未登录，请重新登录。\"}");
            return;
        }

        try {
            String searchText = request.getParameter("searchText");
            String genderFilter = request.getParameter("genderFilter");
            String pageParam = request.getParameter("page");
            String pageSizeParam = request.getParameter("pageSize");
            String direction = request.getParameter("direction");

            int page = (pageParam != null) ? Integer.parseInt(pageParam) : 1;
            int pageSize = (pageSizeParam != null) ? Integer.parseInt(pageSizeParam) : 10;
            int offset = (page - 1) * pageSize;

            List<String[]> blockedContacts = DBUtil.getFilteredContact(userId, searchText, genderFilter, offset, pageSize, 1);
            int total = DBUtil.countFilteredContact(userId, searchText, genderFilter, 1);

            if ("desc".equalsIgnoreCase(direction)) {
                Collections.reverse(blockedContacts);
            }

            sendJsonResponse(response, blockedContacts, total);

        } catch (SQLException | NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"数据库错误: " + e.getMessage() + "\"}");
        }
    }

    private void sendJsonResponse(HttpServletResponse response, List<String[]> contacts, int total)
            throws IOException {
        response.setContentType("application/json");
        String json = convertToJson(contacts, total);
        response.getWriter().write(json);
    }

    private String convertToJson(List<String[]> contacts, int total) {
        StringBuilder json = new StringBuilder("{");
        json.append("\"total\":").append(total).append(",\"contacts\":[");

        for (int i = 0; i < contacts.size(); i++) {
            String[] contact = contacts.get(i);
            json.append("[");
            for (int j = 0; j < contact.length; j++) {
                json.append("\"").append(escapeJson(contact[j])).append("\"");
                if (j < contact.length - 1) json.append(",");
            }
            json.append("]");
            if (i < contacts.size() - 1) json.append(",");
        }

        json.append("]}");
        return json.toString();
    }

    private String escapeJson(String str) {
        return str == null ? "" : str.replace("\"", "\\\"").replace("\n", "\\n");
    }
}
