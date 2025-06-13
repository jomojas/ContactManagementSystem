package com.ncst.contactManagementSystem.servlets;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebServlet("/SetCity")
public class SetCityServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String name = request.getParameter("name");
        String lat = request.getParameter("lat");
        String lon = request.getParameter("lon");

        if (name != null && lat != null && lon != null) {
            HttpSession session = request.getSession();
            session.setAttribute("cityName", name);
            session.setAttribute("cityLat", lat);
            session.setAttribute("cityLon", lon);
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing parameters");
        }
    }
}
