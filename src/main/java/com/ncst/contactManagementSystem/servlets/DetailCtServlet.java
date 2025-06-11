package com.ncst.contactManagementSystem.servlets;

import com.ncst.contactManagementSystem.util.DBUtil;
import java.io.*;
import java.nio.file.*;
import java.sql.SQLException;
import javax.servlet.*;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/detailCt")
@MultipartConfig
public class DetailCtServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String ctId = request.getParameter("ctId");

        if (ctId == null || ctId.trim().isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing ctId");
            return;
        }

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not logged in");
            return;
        }
        String userId = (String) session.getAttribute("userId");

        String[] contact;
        try {
            contact = DBUtil.getOneContact(ctId, 0);
        } catch (SQLException e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error: " + e.getMessage());
            return;
        }

        if (contact == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Contact not found");
            return;
        }

        String picName = null;
        try {
            picName = DBUtil.getContactPic(ctId);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        if (picName == null || picName.isEmpty()) {
            picName = "default.jpg";
        }

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.print("{");
        out.printf("\"ctId\":\"%s\",", ctId);
        out.printf("\"userId\":\"%s\",", userId);
        out.printf("\"name\":\"%s\",", contact[0]);
        out.printf("\"gender\":\"%s\",", contact[1]);
        out.printf("\"email\":\"%s\",", contact[2]);
        out.printf("\"postalCode\":\"%s\",", contact[3]);
        out.printf("\"wechat\":\"%s\",", contact[4]);
        out.printf("\"qq\":\"%s\",", contact[5]);
        out.printf("\"address\":\"%s\",", contact[6]);
        out.printf("\"birthDate\":\"%s\",", contact[7]);
        out.printf("\"phoneNumber\":\"%s\",", contact[8]);
        out.printf("\"picName\":\"%s\"", picName);
        out.print("}");
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        String ctId = request.getParameter("ctId");
        if (ctId == null || ctId.trim().isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing ctId");
            return;
        }

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not logged in");
            return;
        }
        String userId = (String) session.getAttribute("userId");

        // Build info[] for updateContact
        String[] info = new String[9];
        info[0] = request.getParameter("name");
        info[1] = request.getParameter("gender");
        info[2] = request.getParameter("email");
        info[3] = request.getParameter("postalCode");
        info[4] = request.getParameter("wechat");
        info[5] = request.getParameter("qq");
        info[6] = request.getParameter("address");
        info[7] = request.getParameter("birthDate");
        info[8] = request.getParameter("phoneNumber");

//        System.out.println("Start updating contact info");
        boolean updated;
        try {
            updated = DBUtil.updateContact(info, ctId);
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to update contact: " + e.getMessage());
            return;
        }
//        System.out.println("updating contact info successfully");

//        System.out.println("Start Storing image");

        // Handle image file if uploaded
        Part photoPart = request.getPart("photo");
//        System.out.println("Get photo from parameter successfully");

        String contentDisp = photoPart.getHeader("content-disposition");
        String fileName = extractFileName(contentDisp);

        if (photoPart != null && fileName != null && !fileName.isEmpty()) {
//            System.out.println("Start Constructing image path");

            File userImageDir = new File("D:/IntellijIDEA/project/images", userId);
            if (!userImageDir.exists()) userImageDir.mkdirs();

            File savedFile = new File(userImageDir, fileName);

            try (InputStream in = photoPart.getInputStream();
                 OutputStream out = new FileOutputStream(savedFile)) {
                byte[] buffer = new byte[8192];
                int len;
                while ((len = in.read(buffer)) != -1) {
                    out.write(buffer, 0, len);
                }
            }

            // Update pic_name of contact, keep pic_id unchanged
            try {
                String picId = DBUtil.getContactPicID(ctId);
//                System.out.println("Start updating contact pic");
//                System.out.println(fileName);
//                System.out.println(picId);
//                System.out.println(ctId);
                DBUtil.updateContactPic(ctId, picId, fileName);
            } catch (Exception e) {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to update picture info: " + e.getMessage());
                return;
            }
        }

        response.setContentType("text/plain;charset=UTF-8");
        response.getWriter().write("Update successful");
    }

    private String extractFileName(String contentDisposition) {
        if (contentDisposition == null) return null;
        for (String cd : contentDisposition.split(";")) {
            cd = cd.trim();
            if (cd.startsWith("filename")) {
                String fileName = cd.substring(cd.indexOf('=') + 1).trim().replace("\"", "");
                return fileName.substring(fileName.lastIndexOf(File.separator) + 1);
            }
        }
        return null;
    }
}
