package com.ncst.contactManagementSystem.servlets;

import com.ncst.contactManagementSystem.util.DBUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.*;

@WebServlet("/matter")
public class MatterServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        String keyword = request.getParameter("keyword");
        String statusParam = request.getParameter("status");
        String direction = request.getParameter("direction");

        int status;
        if ("pending".equals(statusParam)) {
            status = 0;
        } else if ("completed".equals(statusParam)) {
            status = 1;
        } else if ("cancelled".equals(statusParam)) {
            status = 2;
        } else {
            status = 0;
        }

        System.out.println("keyword: " + keyword);
        try {
            System.out.println("Start Getting Matters");
            List<String[]> matterList = DBUtil.getMatter(status);

            // 临时缓存 ct_id -> ct_name 避免重复查询数据库
            Map<String, String> ctNameCache = new HashMap<>();

            // 关键词过滤：对 ct_name 和 matter 匹配
            Iterator<String[]> iter = matterList.iterator();
            while (iter.hasNext()) {
                String[] m = iter.next();
                String ctId = m[0];
                String matter = m[2];

                // 取出姓名（可能重复用，先查缓存）
                String ctName = ctNameCache.get(ctId);
                if (ctName == null) {
                    ctName = DBUtil.getContactName(ctId);
                    ctNameCache.put(ctId, ctName);
                }

                if (keyword != null && !keyword.isEmpty()) {
                    System.out.println(keyword);
                    System.out.println(matter);
                    System.out.println(ctName);
                    if (!ctName.contains(keyword) && !matter.contains(keyword)) {
                        iter.remove(); // 不匹配就删掉
                    }
                }
            }

            System.out.println("Start sorting matter by matter_time");
            // 排序：按 matter_time 排序（m[1]）
            matterList.sort((a, b) -> {
                String timeA = a[1];
                String timeB = b[1];
                int cmp = timeA.compareTo(timeB);
                return "desc".equalsIgnoreCase(direction) ? -cmp : cmp;
            });

            System.out.println("Start Constructing JSON response");
            // 构造 JSON 响应
            response.setContentType("application/json; charset=UTF-8");
            PrintWriter out = response.getWriter();
            out.print("[");

            for (int i = 0; i < matterList.size(); i++) {
                String[] m = matterList.get(i);
                String ctId = m[0];
                String time = m[1];
                String desc = m[2];
                String matterId = m[3];
                String ctName = ctNameCache.get(ctId);

                out.print(String.format(
                        "{\"id\":\"%s\", \"date\":\"%s\", \"description\":\"%s\", \"name\":\"%s\"}",
                        matterId, time, desc, ctName
                ));
                if (i < matterList.size() - 1) {
                    out.print(",");
                }
            }

            out.print("]");
            out.flush();

        } catch (SQLException e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "数据库错误: " + e.getMessage());
        }
    }


    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String matterId = request.getParameter("matterId");
        String action = request.getParameter("action");

        if (matterId == null || action == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "缺少参数");
            return;
        }

        try {
            if ("cancel".equalsIgnoreCase(action)) {
                DBUtil.deleteMatter(matterId);
            } else if ("finished".equalsIgnoreCase(action)) {
                DBUtil.finishMatter(matterId);
            } else {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "未知操作类型");
                return;
            }

            response.setStatus(HttpServletResponse.SC_OK);
        } catch (SQLException e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "数据库操作失败: " + e.getMessage());
        }
    }
}
