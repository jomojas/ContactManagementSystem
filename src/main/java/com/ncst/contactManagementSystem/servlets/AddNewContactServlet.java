package com.ncst.contactManagementSystem.servlets;

import com.ncst.contactManagementSystem.util.DBUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.*;
import java.nio.file.Paths;
import java.sql.SQLException;

@WebServlet("/addContact")
@MultipartConfig // Enables file upload
public class AddNewContactServlet extends HttpServlet {

    private static final String IMAGE_ROOT = "D:/IntellijIDEA/project/images/";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        System.out.println("Calling Add Contact Servlet");
        // Set encoding to handle UTF-8
        request.setCharacterEncoding("UTF-8");

        // 1. Get logged-in user
        HttpSession session = request.getSession(false);
        String userId = (session != null) ? (String) session.getAttribute("userId") : null;
        if (userId == null) {
//            System.out.println("Empty USer");
            response.sendRedirect("Login.html");
            return;
        }

        System.out.println("Get data");
        try {
            // 2. Generate contact ID and image ID
            int newCtIdInt = DBUtil.getMaxContactID() + 1;
            String newCtId = String.valueOf(newCtIdInt);
            int newPicIdInt = DBUtil.getMaxContactPicID() + 1;
            String newPicId = String.valueOf(newPicIdInt);

            // 3. Get form fields
            String name = request.getParameter("name");
            String address = request.getParameter("address");
            String email = request.getParameter("email");
            String qq = request.getParameter("qq");
            String wechat = request.getParameter("wechat");
            String postalCode = request.getParameter("postalCode");
            String gender = request.getParameter("gender");
            String birthDate = request.getParameter("birthDate");
            String phoneNumber = request.getParameter("phoneNumber");

            System.out.println("gender:" + gender);
            System.out.println(newCtId);

            String[] contactInfo = {
                    name, address, postalCode, qq, wechat,
                    email, gender, birthDate, phoneNumber
            };

//            // 4. Store image file
//            Part photoPart = request.getPart("photo");
//            String submittedFileName = getFileName(photoPart);
//
//            String finalFileName;
//            if (submittedFileName == null || submittedFileName.isEmpty()) {
//                System.out.println("Use default image");
//                finalFileName = "default.jpg";
//            } else {
//                finalFileName = submittedFileName;
//                File userDir = new File(IMAGE_ROOT + userId);
//                if (!userDir.exists()) userDir.mkdirs();
//                photoPart.write(userDir.getAbsolutePath() + File.separator + finalFileName);
//            }
            Part photoPart = request.getPart("photo");
            String submittedFileName = (photoPart == null) ? null : getFileName(photoPart);

            String finalFileName;
            File userDir = new File(IMAGE_ROOT + userId);
            if (!userDir.exists()) userDir.mkdirs();

            if (submittedFileName == null || submittedFileName.isEmpty()) {
                System.out.println("Use default image");

                // 定义默认图片的路径（服务器上已有的默认图片）
                File defaultImageFile = new File(IMAGE_ROOT + "default.jpg");

                // 给用户目录里的默认图片命名，最好带上前缀，避免和其他用户冲突
                finalFileName = "default.jpg";
                File targetFile = new File(userDir, finalFileName);

                // 拷贝默认图片到用户目录
                try (InputStream in = new FileInputStream(defaultImageFile);
                     OutputStream out = new FileOutputStream(targetFile)) {

                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = in.read(buffer)) != -1) {
                        out.write(buffer, 0, len);
                    }

                } catch (IOException e) {
                    e.printStackTrace();
                    // 如果拷贝失败，可根据需要处理异常
                }

            } else {
                finalFileName = submittedFileName;
                try {
                    photoPart.write(userDir.getAbsolutePath() + File.separator + finalFileName);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }


            System.out.println("Store image successfully");



//            System.out.println("Insert Data Into Database");
            // 5. Insert into database
            boolean contactSaved = DBUtil.addContact(contactInfo, newCtId, userId);
            boolean photoSaved = DBUtil.addContactPic(newCtId, newPicId, finalFileName);

            if (contactSaved && photoSaved) {
                // Success: just send success text
//                System.out.println("Success, send success text");
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("success");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("添加联系人失败，请重试！");
            }

        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("数据库错误：" + e.getMessage());
        }
    }

    private String getFileName(Part part) {
        String contentDisp = part.getHeader("content-disposition");
        for (String cd : contentDisp.split(";")) {
            if (cd.trim().startsWith("filename")) {
                return cd.substring(cd.indexOf('=') + 1).trim().replace("\"", "");
            }
        }
        return null;
    }

}
