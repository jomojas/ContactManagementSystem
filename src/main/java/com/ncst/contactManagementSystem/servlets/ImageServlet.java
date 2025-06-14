package com.ncst.contactManagementSystem.servlets;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.*;

@WebServlet("/image")
public class ImageServlet extends HttpServlet {

    // Adjust to match your storage path
    private static final String BASE_IMAGE_PATH = "D:/IntellijIDEA/project/images";

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String user = request.getParameter("user");
        String file = request.getParameter("file");

        if (user == null || file == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing user or file parameter.");
            return;
        }

        // Full path to requested image
        File imageFile = new File(BASE_IMAGE_PATH + "/" + user + "/" + file);

        // If not found, use default fallback
        if (!imageFile.exists() || !imageFile.isFile()) {
            imageFile = new File(BASE_IMAGE_PATH + "/default/default.jpg");
            if (!imageFile.exists()) {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Image not found.");
                return;
            }
        }

        // Set correct content type
        String mimeType = getServletContext().getMimeType(imageFile.getName());
        if (mimeType == null) {
            mimeType = "application/octet-stream";
        }

        response.setContentType(mimeType);
        response.setContentLength((int) imageFile.length());

        // Send image content to client
        try (FileInputStream fis = new FileInputStream(imageFile);
             OutputStream out = response.getOutputStream()) {
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
    }
}
