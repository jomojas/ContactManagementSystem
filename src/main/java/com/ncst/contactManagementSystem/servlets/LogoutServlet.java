package com.ncst.contactManagementSystem.servlets;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;

@WebServlet("/logout")
public class LogoutServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false); // don't create if doesn't exist
        if (session != null) {
            session.invalidate(); // clear session
        }

        response.setStatus(HttpServletResponse.SC_OK);
    }
}
