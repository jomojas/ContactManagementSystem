package com.ncst.contactManagementSystem.servlets;

import com.ncst.contactManagementSystem.util.DBUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.*;

@WebServlet("/register")
@MultipartConfig
public class RegisterServlet extends HttpServlet {

    private static final String IMAGE_ROOT = "D:/IntellijIDEA/project/images/";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        if (username == null || password == null || username.trim().isEmpty() || password.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"status\":\"fail\", \"message\":\"用户名和密码不能为空\"}");
            return;
        }

        try {
            int result = DBUtil.addUser(username, password);

            if (result == 0) {
                // Invalidate old session
                HttpSession oldSession = request.getSession(false);
                if (oldSession != null) oldSession.invalidate();

                // Create new session
                HttpSession session = request.getSession(true);
                session.setAttribute("userId", username);
                session.setMaxInactiveInterval(30 * 60); // 30 minutes

                // Create user image folder
                File userDir = new File(IMAGE_ROOT + username);
                if (!userDir.exists()) {
                    userDir.mkdirs();
                }

                // Save uploaded photo if exists
                Part photoPart = request.getPart("photo");
                if (photoPart != null && photoPart.getSize() > 0) {
                    String photoPath = IMAGE_ROOT + username + "/profile.jpg";
                    try (InputStream input = photoPart.getInputStream();
                         FileOutputStream output = new FileOutputStream(photoPath)) {
                        byte[] buffer = new byte[1024];
                        int bytesRead;
                        while ((bytesRead = input.read(buffer)) != -1) {
                            output.write(buffer, 0, bytesRead);
                        }
                    }

                    // Generate pic_id
                    int newPicId = DBUtil.getMaxUserPicID() + 1;

                    // Save user_pic record
                    boolean picStored = DBUtil.addUserPic(username, String.valueOf(newPicId), "profile.jpg");
                    if (!picStored) {
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        response.getWriter().write("{\"status\":\"fail\", \"message\":\"用户头像信息保存失败\"}");
                        return;
                    }
                }

                response.getWriter().write("{\"status\":\"success\"}");

            } else if (result == 1) {
                response.setStatus(HttpServletResponse.SC_CONFLICT); // Username exists
                response.getWriter().write("{\"status\":\"fail\", \"message\":\"用户名已存在\"}");

            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // DB error
                response.getWriter().write("{\"status\":\"error\", \"message\":\"数据库错误，请稍后再试\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"status\":\"error\", \"message\":\"服务器内部错误\"}");
        }
    }
}
