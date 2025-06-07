package com.ncst.contactManagementSystem.servlets;

import com.ncst.contactManagementSystem.util.DBUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

@WebServlet("/contacts")
public class ContactServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        // Get user from session
        HttpSession session = request.getSession(false);
        String userId = (session != null) ? (String) session.getAttribute("userId") : null;

        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"未登录，请重新登录。\"}");
            return;
        }

        try {
            List<String[]> contacts;

            if (hasFilterParameters(request)) {
                String searchText = request.getParameter("searchText");
                String genderFilter = request.getParameter("genderFilter");
                contacts = DBUtil.getFilteredContact(userId, searchText, genderFilter);
            } else {
                contacts = DBUtil.getContact(userId, 1, 100, 0); // all contacts
            }

            sendJsonResponse(response, contacts);

        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"数据库错误: " + e.getMessage() + "\"}");
        }
    }

    private boolean hasFilterParameters(HttpServletRequest request) {
        return request.getParameter("searchText") != null ||
                request.getParameter("genderFilter") != null;
    }

    private void sendJsonResponse(HttpServletResponse response, List<String[]> contacts)
            throws IOException {
        response.setContentType("application/json");
        String json = convertToJson(contacts);
        response.getWriter().write(json);
    }

    private String convertToJson(List<String[]> contacts) {
        StringBuilder json = new StringBuilder("[");
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
        json.append("]");
        return json.toString();
    }

    private String escapeJson(String str) {
        return str == null ? "" : str.replace("\"", "\\\"").replace("\n", "\\n");
    }
}
