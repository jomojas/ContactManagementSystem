package com.ncst.contactManagementSystem.util;

import java.sql.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class DBUtil {

    private static final String DB_URL = "jdbc:mysql://localhost:3306/contact_management_system?serverTimezone=UTC&useUnicode=true&characterEncoding=UTF-8";
    private static final String USER = "root";
    private static final String PASS = "020121";

    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            return DriverManager.getConnection(DB_URL, USER, PASS);
        } catch (ClassNotFoundException e) {
            throw new SQLException("JDBC Driver not found", e);
        }
    }

    public static void close(Connection conn) {
        if (conn != null) {
            try { conn.close(); } catch (SQLException e) { e.printStackTrace(); }
        }
    }

    // 1. Get user password
    public static String getUser(String userId) throws SQLException {
        String sql = "SELECT user_password FROM user_info WHERE user_id = ?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, userId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getString("user_password");
            }
        }
        return null;
    }

    // 2. Get user picture
    public static String getUserPic(String userId) throws SQLException {
        String sql = "SELECT pic_name FROM user_pic WHERE user_id = ?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, userId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getString("pic_name");
            }
        }
        return null;
    }

    // 3. Get total pages of contacts
    public static int getTotalContactPage(String userId, int perPage, int status) throws SQLException {
        String sql = "SELECT COUNT(*) FROM contact_info WHERE user_id = ? AND ct_delete = ?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, userId);
            stmt.setInt(2, status);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                int total = rs.getInt(1);
                return (int) Math.ceil(total / (double) perPage);
            }
        }
        return 0;
    }

    // 4. Get contacts
    public static List<String[]> getContact(String userId, int page, int perPage, int status) throws SQLException {
        String sql = "SELECT ct_name, ct_mf, ct_phone, ct_id FROM contact_info WHERE user_id = ? AND ct_delete = ? LIMIT ?, ?";
        List<String[]> list = new ArrayList<>();
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, userId);
            stmt.setInt(2, status);
            stmt.setInt(3, (page - 1) * perPage);
            stmt.setInt(4, perPage);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new String[]{rs.getString("ct_name"), rs.getString("ct_mf"), rs.getString("ct_phone"), rs.getString("ct_id")});
            }
        }
        return list;
    }

    // 5. Get one contact details
    public static String[] getOneContact(String ctId, int status) throws SQLException {
        String sql = "SELECT ct_name, ct_mf, ct_em, ct_yb, ct_wx, ct_qq, ct_ad, ct_birth, ct_phone FROM contact_info WHERE ct_id = ? AND ct_delete = ?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, ctId);
            stmt.setInt(2, status);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new String[]{
                        rs.getString("ct_name"), rs.getString("ct_mf"), rs.getString("ct_em"),
                        rs.getString("ct_yb"), rs.getString("ct_wx"), rs.getString("ct_qq"),
                        rs.getString("ct_ad"), rs.getString("ct_birth"), rs.getString("ct_phone")
                };
            }
        }
        return null;
    }

    // 6. Get contact picture
    public static String getContactPic(String ctId) throws SQLException {
        String sql = "SELECT pic_name FROM contact_pic WHERE ct_id = ?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, ctId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getString("pic_name");
            }
        }
        return null;
    }

    // 7. Get max contact ID
    public static int getMaxContactID() throws SQLException {
        String sql = "SELECT MAX(CAST(ct_id AS UNSIGNED)) FROM contact_info";
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        }
        return 0;
    }

    // 8. Get max contact picture ID
    public static int getMaxContactPicID() throws SQLException {
        String sql = "SELECT MAX(CAST(pic_id AS UNSIGNED)) FROM contact_pic";
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        }
        return 0;
    }

    // 9. Update contact
    public static boolean updateContact(String[] info, String ctId) throws SQLException {
        String sql = "UPDATE contact_info SET ct_name=?, ct_mf=?, ct_em=?, ct_yb=?, ct_wx=?, ct_qq=?, ct_ad=?, ct_birth=?, ct_phone=? WHERE ct_id=?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            for (int i = 0; i < info.length; i++) stmt.setString(i + 1, info[i]);
            stmt.setString(10, ctId);
            return stmt.executeUpdate() > 0;
        }
    }

    // 10. Update contact picture
    public static boolean updateContactPic(String ctId, String picId, String picName) throws SQLException {
        String sql = "UPDATE contact_pic SET pic_name=? WHERE ct_id=? AND pic_id=?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, picName);
            stmt.setString(2, ctId);
            stmt.setString(3, picId);
            System.out.println("Updating contact picture successfully");
            return stmt.executeUpdate() > 0;
        }
    }

    // 11. Add contact
    public static boolean addContact(String[] info, String ctId, String userId) throws SQLException {
        String sql = "INSERT INTO contact_info VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, userId);
            stmt.setString(2, ctId);
            for (int i = 0; i < info.length; i++) stmt.setString(i + 3, info[i]);
            return stmt.executeUpdate() > 0;
        }
    }

    // 12. Add contact picture
    public static boolean addContactPic(String ctId, String picId, String picName) throws SQLException {
        String sql = "INSERT INTO contact_pic VALUES (?, ?, ?)";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, ctId);
            stmt.setString(2, picId);
            stmt.setString(3, picName);
            return stmt.executeUpdate() > 0;
        }
    }

    // 13. Delete contact (soft delete)
    public static boolean deleteContact(String ctId) throws SQLException {
        String sql = "UPDATE contact_info SET ct_delete = 1 WHERE ct_id = ?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, ctId);
            return stmt.executeUpdate() > 0;
        }
    }

    // 14. Restore contact from blacklist
    public static boolean cancelDeleteContact(String ctId) throws SQLException {
        String sql = "UPDATE contact_info SET ct_delete = 0 WHERE ct_id = ?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, ctId);
            return stmt.executeUpdate() > 0;
        }
    }

    // 15. Get all user matters
    public static List<String[]> getMatterUser(String userId, int status) throws SQLException {
        String sql = "SELECT ci.ct_name, matter_time, matter FROM contact_matter cm JOIN contact_info ci ON cm.ct_id = ci.ct_id WHERE ci.user_id = ? AND matter_delete = ?";
        List<String[]> list = new ArrayList<>();
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, userId);
            stmt.setInt(2, status);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new String[]{rs.getString(1), rs.getString(2), rs.getString(3)});
            }
        }
        return list;
    }

    // 16. Get all matters of a status
    public static List<String[]> getMatter(int status) throws SQLException {
        String sql = "SELECT ct_id, matter_time, matter, matter_id FROM contact_matter WHERE matter_delete = ?";
        List<String[]> list = new ArrayList<>();
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, status);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new String[]{
                        rs.getString("ct_id"),
                        rs.getString("matter_time"),
                        rs.getString("matter"),
                        rs.getString("matter_id")
                });
            }
        }
        return list;
    }


    public static List<String[]> getFilteredMatter(String userId, String searchText, int status, int currentPage, int pageSize) throws SQLException {
        List<String[]> result = new ArrayList<>();
        List<String> ctIdList = new ArrayList<>();

        try (Connection conn = getConnection()) {
            // 1. 查找匹配的联系人 ct_id
            if (searchText != null && !searchText.trim().isEmpty()) {
                String contactSql = "SELECT ct_id FROM contact_info WHERE ct_name LIKE ?";
                try (PreparedStatement ps = conn.prepareStatement(contactSql)) {
                    ps.setString(1, "%" + searchText + "%");
                    ResultSet rs = ps.executeQuery();
                    while (rs.next()) {
                        ctIdList.add(rs.getString("ct_id"));
                    }
                }
            }

            // 2. 构建查询语句 contact_matter 表
            StringBuilder matterSql = new StringBuilder("SELECT ct_id, matter_time, matter, matter_id, matter_delete FROM contact_matter WHERE 1=1");
            List<Object> params = new ArrayList<>();

            if (status != 3) { // 非 all
                matterSql.append(" AND matter_delete = ?");
                params.add(status);
            }

            if (searchText != null && !searchText.trim().isEmpty()) {
                matterSql.append(" AND (");
                matterSql.append("matter LIKE ?");
                params.add("%" + searchText + "%");

                if (!ctIdList.isEmpty()) {
                    matterSql.append(" OR ct_id IN (");
                    matterSql.append(String.join(",", Collections.nCopies(ctIdList.size(), "?")));
                    matterSql.append(")");
                    params.addAll(ctIdList);
                }

                matterSql.append(")");
            }

            // 分页
            matterSql.append(" ORDER BY matter_time ASC LIMIT ?, ?");
            int offset = (currentPage - 1) * pageSize;
            params.add(offset);
            params.add(pageSize);

            try (PreparedStatement ps = conn.prepareStatement(matterSql.toString())) {
                int index = 1;
                for (Object value : params) {
                    if (value instanceof Integer) {
                        ps.setInt(index++, (Integer) value);
                    } else {
                        ps.setString(index++, value.toString());
                    }
                }

                ResultSet rs = ps.executeQuery();
                while (rs.next()) {
                    result.add(new String[]{
                            rs.getString("ct_id"),
                            rs.getString("matter_time"),
                            rs.getString("matter"),
                            rs.getString("matter_id"),
                            rs.getString("matter_delete")
                    });
                }
            }
        }

        return result;
    }



    public static int countFilteredMatter(String userId, String keyword, int status) throws SQLException {
        int total = 0;
        List<String> ctIdList = new ArrayList<>();

        try (Connection conn = getConnection()) {
            // 1. 查找匹配联系人 ct_id
            if (keyword != null && !keyword.trim().isEmpty()) {
                String contactSql = "SELECT ct_id FROM contact_info WHERE user_id = ? AND ct_name LIKE ?";
                try (PreparedStatement ps = conn.prepareStatement(contactSql)) {
                    ps.setString(1, userId);
                    ps.setString(2, "%" + keyword + "%");
                    ResultSet rs = ps.executeQuery();
                    while (rs.next()) {
                        ctIdList.add(rs.getString("ct_id"));
                    }
                }
            }

            // 2. 构建计数查询 contact_matter 表
            StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM contact_matter WHERE 1=1");
            List<Object> params = new ArrayList<>();

            if (status != 3) { // 3 means all statuses
                sql.append(" AND matter_delete = ?");
                params.add(status);
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                sql.append(" AND (");
                sql.append("matter LIKE ?");
                params.add("%" + keyword + "%");

                if (!ctIdList.isEmpty()) {
                    sql.append(" OR ct_id IN (");
                    sql.append(String.join(",", Collections.nCopies(ctIdList.size(), "?")));
                    sql.append(")");
                    params.addAll(ctIdList);
                }

                sql.append(")");
            }

            try (PreparedStatement ps = conn.prepareStatement(sql.toString())) {
                for (int i = 0; i < params.size(); i++) {
                    Object param = params.get(i);
                    if (param instanceof Integer) {
                        ps.setInt(i + 1, (Integer) param);
                    } else {
                        ps.setString(i + 1, param.toString());
                    }
                }

                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    total = rs.getInt(1);
                }
            }
        }

        return total;
    }


    // 17. Delete matter
    public static boolean deleteMatter(String matterId) throws SQLException {
        String sql = "UPDATE contact_matter SET matter_delete = 1 WHERE matter_id = ?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, matterId);
            return stmt.executeUpdate() > 0;
        }
    }

    // Finish Matter
    public static void finishMatter(String matterId) throws SQLException {
        String sql = "UPDATE contact_matter SET matter_delete = 2 WHERE matter_id = ?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, matterId);
            stmt.executeUpdate();
        }
    }

    // 18. Add matter
    public static boolean addMatter(String matterId, String matterTime, String matter, String ctId) throws SQLException {
        String sql = "INSERT INTO contact_matter VALUES (?, ?, ?, ?, 0)";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, ctId);
            stmt.setString(2, matterId);
            stmt.setString(3, matterTime);
            stmt.setString(4, matter);
            return stmt.executeUpdate() > 0;
        }
    }

    // 19. Get max matter ID
    public static int getMaxMatterID() throws SQLException {
        String sql = "SELECT MAX(CAST(matter_id AS UNSIGNED)) FROM contact_matter";
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        }
        return 0;
    }

    // Get Filtered Contacts according to user's condition
    public static List<String[]> getFilteredContact(String userId, String searchText, String genderFilter, int offset, int pageSize, int status)
            throws SQLException {

        String sql = "SELECT ct_name, ct_mf, ct_phone, ct_id FROM contact_info WHERE user_id = ? AND ct_delete = ?";
        List<String> params = new ArrayList<>();
        params.add(userId);
        params.add(String.valueOf(status));

        // Add search text filter (name or phone)
        if (searchText != null && !searchText.trim().isEmpty()) {
            sql += " AND (ct_name LIKE ? OR ct_phone LIKE ?)";
            params.add("%" + searchText + "%");
            params.add("%" + searchText + "%");
        }

        // Add gender filter
        if (genderFilter != null && !genderFilter.equals("all")) {
            sql += " AND ct_mf = ?";
            params.add(genderFilter.equals("male") ? "男" : "女");
        }

        // Add pagination
        sql += " LIMIT ?, ?";
        params.add(String.valueOf(offset));
        params.add(String.valueOf(pageSize));

//        System.out.println(sql);
//        System.out.println(params);
        System.out.println("Starting Getting Data From Database");
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            for (int i = 0; i < params.size(); i++) {
                String param = params.get(i);

                if (i == 1 || i >= params.size() - 2) {
                    // index 1 is status; last 2 are offset and pageSize — all should be integers
                    stmt.setInt(i + 1, Integer.parseInt(param));
                } else {
                    stmt.setString(i + 1, param);
                }
            }


            System.out.println(sql);
            System.out.println(params);
            ResultSet rs = stmt.executeQuery();
            List<String[]> contacts = new ArrayList<>();
            System.out.println("Start Constructing Contacts");
            while (rs.next()) {
                contacts.add(new String[]{
                        rs.getString("ct_name"),
                        rs.getString("ct_mf"),
                        rs.getString("ct_phone"),
                        rs.getString("ct_id")
                });
            }
            System.out.println("Getting Data Successfully");
            return contacts;
        }
    }

    // Count Filtered Contact Number
    public static int countFilteredContact(String userId, String searchText, String genderFilter, int status) throws SQLException {
        String sql = "SELECT COUNT(*) FROM contact_info WHERE user_id = ? AND ct_delete = ?";
        List<String> params = new ArrayList<>();
        params.add(userId);
        params.add(String.valueOf(status));

        if (searchText != null && !searchText.trim().isEmpty()) {
            sql += " AND (ct_name LIKE ? OR ct_phone LIKE ?)";
            params.add("%" + searchText + "%");
            params.add("%" + searchText + "%");
        }

        if (genderFilter != null && !genderFilter.equals("all")) {
            sql += " AND ct_mf = ?";
            params.add(genderFilter.equals("male") ? "男" : "女");
        }

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            for (int i = 0; i < params.size(); i++) {
                String param = params.get(i);
                if (i == 1) {
                    stmt.setInt(i + 1, Integer.parseInt(param)); // ct_delete
                } else {
                    stmt.setString(i + 1, param);
                }
            }

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1);
            }
            return 0;
        }
    }



    // Get pic_id of ct_id
    public static String getContactPicID(String ctId) throws SQLException {
        String sql = "SELECT pic_id FROM contact_pic WHERE ct_id = ?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, ctId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("pic_id");
                }
            }
        }
        return null;
    }

    // get contact name
    public static String getContactName(String ctId) throws SQLException {
        String sql = "SELECT ct_name FROM contact_info WHERE ct_id = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, ctId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("ct_name");
                }
            }
        }
        return null;
    }

}
