import java.io.*;
import java.sql.*;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet("/SearchServlet")
public class SearchServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String semester = request.getParameter("semester");
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<html><body>");

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection("jdbc:mysql://localhost:3306/NJIT", "root", "Althaf1738@");
            PreparedStatement ps = con.prepareStatement("SELECT * FROM Courses WHERE Semester = ?");
            ps.setString(1, semester);
            ResultSet rs = ps.executeQuery();

            boolean found = false;
            out.println("<h3>Course List:</h3><ul>");
            while (rs.next()) {
                found = true;
                out.println("<li>" + rs.getString("CourseID") + " " + rs.getString("Semester") + " " + rs.getString("CourseName") + "</li>");
            }
            out.println("</ul>");
            if (!found) {
                out.println("<p>No courses found for the selected semester.</p>");
            }
            con.close();
        } catch (Exception e) {
            out.println("<p>Error: " + e.getMessage() + "</p>");
        }

        out.println("</body></html>");
    }
}
