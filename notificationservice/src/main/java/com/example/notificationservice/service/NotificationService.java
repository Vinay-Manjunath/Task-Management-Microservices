package com.example.notificationservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private RestTemplate restTemplate;

    // Notify users about upcoming task deadlines
    public void notifyUpcomingDeadlines() {
        List<Map<String, Object>> dueTasks = fetchTasks("/tasks/overdue");
        for (Map<String, Object> task : dueTasks) {
            String email = task.get("userEmail").toString();
            String taskName = task.get("taskName").toString();
            String dueDate = task.get("dueDate").toString();

            String message = String.format(
                    "Reminder: Your task '%s' is due on %s. Please ensure timely completion.", taskName, dueDate);

            sendEmailNotification(email, "Task Due Reminder", message);
        }
    }

    // Notify users about overdue tasks
    public void notifyOverdueTasks() {
        List<Map<String, Object>> overdueTasks = fetchTasks("/tasks/overdue");
        for (Map<String, Object> task : overdueTasks) {
            String email = task.get("userEmail").toString();
            String taskName = task.get("taskName").toString();

            String message = String.format(
                    "Alert: Your task '%s' is overdue. Please address it as soon as possible.", taskName);

            sendEmailNotification(email, "Task Overdue Alert", message);
        }
    }

    // Fetch tasks from Task Service
    private List<Map<String, Object>> fetchTasks(String endpoint) {
        String url = "http://localhost:8081" + endpoint;
        return restTemplate.getForObject(url, List.class);
    }

    // Send email notification
    public void sendEmailNotification(String to, String subject, String message) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(message, false);

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }


    public List<Map<String, String>> getOverdueTaskNotifications(String userEmail) {
        // Fetch overdue tasks for the specific user from the '/tasks/overdue' endpoint
        List<Map<String, Object>> overdueTasks = fetchTasks("/tasks/overdue?userEmail=" + userEmail);
        List<Map<String, String>> notifications = new ArrayList<>();

        for (Map<String, Object> task : overdueTasks) {
            String taskName = task.get("taskName").toString();

            // Construct the notification message
            String message = String.format(
                    "Alert: Your task '%s' is overdue. Please address it as soon as possible.", taskName);

            // Add notification for the specific task
            notifications.add(Map.of(
                    "taskName", taskName,
                    "message", message
            ));
        }

        return notifications;
    }

    public List<Map<String, String>> getUpcomingTaskNotifications(String userEmail) {
        // Fetch upcoming tasks for the specific user from the '/tasks/upcoming' endpoint
        List<Map<String, Object>> upcomingTasks = fetchTasks("/tasks/upcoming?userEmail=" + userEmail);
        List<Map<String, String>> notifications = new ArrayList<>();

        for (Map<String, Object> task : upcomingTasks) {
            String taskName = task.get("taskName").toString();
            String dueDate = task.get("dueDate").toString();

            // Construct the notification message
            String message = String.format(
                    "Reminder: Your task '%s' is due on %s. Please prepare accordingly.", taskName, dueDate);

            // Add notification for the specific task
            notifications.add(Map.of(
                    "taskName", taskName,
                    "message", message
            ));
        }

        return notifications;
    }



}
