package com.ncst.contactManagementSystem.servlets;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/getUserId")
public class GetUserIdServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Set response content type to JSON
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession(false);
        String userId = (session != null) ? (String) session.getAttribute("userId") : null;

        PrintWriter out = response.getWriter();

        if (userId != null) {
            out.print("{\"userId\": \"" + escapeJson(userId) + "\"}");
        } else {
            out.print("{\"userId\": null}");
        }

        out.flush();
    }

    // Simple JSON escape for safety
    private String escapeJson(String str) {
        return str.replace("\"", "\\\"");
    }
}
