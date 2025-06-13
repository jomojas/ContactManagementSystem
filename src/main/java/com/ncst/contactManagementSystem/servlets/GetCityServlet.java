package com.ncst.contactManagementSystem.servlets;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import org.json.JSONObject;

@WebServlet("/GetCity")
public class GetCityServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession();
        String name = (String) session.getAttribute("cityName");
        String lat = (String) session.getAttribute("cityLat");
        String lon = (String) session.getAttribute("cityLon");

        response.setContentType("application/json; charset=UTF-8");
        JSONObject result = new JSONObject();
        if (name != null && lat != null && lon != null) {
            result.put("name", name);
            result.put("lat", lat);
            result.put("lon", lon);
        } else {
            result.put("name", JSONObject.NULL);
        }
        response.getWriter().write(result.toString());
    }
}
