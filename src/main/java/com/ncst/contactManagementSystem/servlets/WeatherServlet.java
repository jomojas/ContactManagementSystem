package com.ncst.contactManagementSystem.servlets;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.*;
import java.net.*;
import java.util.*;
import org.json.*;

@WebServlet("/Weather")
public class WeatherServlet extends HttpServlet {

    private static final String API_KEY = "d2d71a7731f7bc54722b9867652ff9df";

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");

        String city = request.getParameter("city");
        String lat = request.getParameter("lat");
        String lon = request.getParameter("lon");

        // If city provided but no coordinates, try resolving lat/lon via geocoding API
        if ((lat == null || lon == null) && city != null && !city.trim().isEmpty()) {
            String geoUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" +
                    URLEncoder.encode(city, "UTF-8") +
                    "&limit=1&appid=" + API_KEY;

            try {
                HttpURLConnection geoConn = (HttpURLConnection) new URL(geoUrl).openConnection();
                geoConn.setRequestMethod("GET");

                int geoStatus = geoConn.getResponseCode();
                if (geoStatus != 200) {
                    sendJsonError(response, HttpServletResponse.SC_BAD_GATEWAY, "Failed to resolve coordinates");
                    return;
                }

                StringBuilder geoJson = new StringBuilder();
                try (Scanner geoScanner = new Scanner(geoConn.getInputStream())) {
                    while (geoScanner.hasNext()) geoJson.append(geoScanner.nextLine());
                }

                JSONArray geoArray = new JSONArray(geoJson.toString());
                if (geoArray.length() == 0) {
                    sendJsonError(response, HttpServletResponse.SC_BAD_REQUEST, "City not found in geocoding API");
                    return;
                }

                JSONObject geo = geoArray.getJSONObject(0);
                lat = String.valueOf(geo.getDouble("lat"));
                lon = String.valueOf(geo.getDouble("lon"));

            } catch (Exception e) {
                e.printStackTrace();
                sendJsonError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Geocoding failed");
                return;
            }
        }

        if (lat == null || lon == null) {
            sendJsonError(response, HttpServletResponse.SC_BAD_REQUEST, "Missing city or coordinates");
            return;
        }

        String apiUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" +
                URLEncoder.encode(lat, "UTF-8") +
                "&lon=" + URLEncoder.encode(lon, "UTF-8") +
                "&appid=" + API_KEY +
                "&units=metric&lang=zh_cn";
        try {
            URL url = new URL(apiUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            int status = conn.getResponseCode();
            InputStream is = (status == 200) ? conn.getInputStream() : conn.getErrorStream();
            StringBuilder jsonBuilder = new StringBuilder();

            try (Scanner scanner = new Scanner(is)) {
                while (scanner.hasNext()) {
                    jsonBuilder.append(scanner.nextLine());
                }
            }

            JSONObject raw = new JSONObject(jsonBuilder.toString());

            if (!"200".equals(raw.optString("cod"))) {
                sendJsonError(response, HttpServletResponse.SC_BAD_GATEWAY, "OpenWeatherMap Error: " + raw.optString("message", "Unknown error"));
                return;
            }

            JSONArray list = raw.getJSONArray("list");
            Map<String, JSONObject> dailyMap = new LinkedHashMap<>();

            for (int i = 0; i < list.length(); i++) {
                JSONObject entry = list.getJSONObject(i);
                String dateTime = entry.getString("dt_txt");
                String date = dateTime.split(" ")[0];

                if (!dailyMap.containsKey(date)) {
                    JSONObject forecast = new JSONObject();
                    forecast.put("date", date);
                    forecast.put("weather", entry.getJSONArray("weather").getJSONObject(0).getString("description"));
                    forecast.put("temp", entry.getJSONObject("main").getDouble("temp") + "°C");
                    dailyMap.put(date, forecast);
                }

                if (dailyMap.size() >= 5) break;
            }

            JSONObject result = new JSONObject();
            result.put("forecast", new JSONArray(dailyMap.values()));

            response.setContentType("application/json; charset=UTF-8");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(result.toString());

        } catch (Exception e) {
            e.printStackTrace();
            sendJsonError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Weather data fetch failed");
        }
    }

    private void sendJsonError(HttpServletResponse response, int statusCode, String message) throws IOException {
        response.setStatus(statusCode);
        response.setContentType("application/json; charset=UTF-8");
        JSONObject error = new JSONObject();
        error.put("error", message);
        response.getWriter().write(error.toString());
    }
}