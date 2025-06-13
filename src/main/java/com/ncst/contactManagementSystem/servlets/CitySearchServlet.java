package com.ncst.contactManagementSystem.servlets;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.*;
import java.net.*;
import java.util.Scanner;
import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/CitySearch")
public class CitySearchServlet extends HttpServlet {

    private static final String API_KEY = "d2d71a7731f7bc54722b9867652ff9df";

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String query = request.getParameter("q");
        if (query == null || query.trim().isEmpty()) {
            sendError(response, "Missing city name");
            return;
        }

        String apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" +
                URLEncoder.encode(query, "UTF-8") +
                "&limit=1&appid=" + API_KEY;

        HttpURLConnection conn = (HttpURLConnection) new URL(apiUrl).openConnection();
        conn.setRequestMethod("GET");

        StringBuilder json = new StringBuilder();
        try (Scanner scanner = new Scanner(conn.getInputStream())) {
            while (scanner.hasNext()) {
                json.append(scanner.nextLine());
            }
        }

        JSONArray array = new JSONArray(json.toString());
        JSONObject result = new JSONObject();

        if (array.length() > 0) {
            JSONObject city = array.getJSONObject(0);
            result.put("valid", true);
            result.put("name", city.getString("name"));
            result.put("lat", city.getDouble("lat"));
            result.put("lon", city.getDouble("lon"));
            result.put("country", city.optString("country"));
        } else {
            result.put("valid", false);
        }

        response.setContentType("application/json; charset=UTF-8");
        response.getWriter().write(result.toString());
    }

    private void sendError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        JSONObject error = new JSONObject();
        error.put("error", message);
        response.getWriter().write(error.toString());
    }
}

