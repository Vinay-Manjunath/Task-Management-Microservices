package com.example.taskservice.controller;

import com.example.taskservice.model.Task;
import com.example.taskservice.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin
@RestController
@RequestMapping("/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // Endpoint to create a task
    @PostMapping("/create")
    public String createTask(@RequestBody Task task) {
        taskService.createTask(task); // Call service to save task
        return "Task created successfully!";
    }

    // Endpoint to get tasks by user email
    @GetMapping("/user/{email}")
    public List<Task> getTasksByUserEmail(@PathVariable String email) {
        return taskService.getTasksByUserEmail(email);
    }

    // Endpoint to update a task
    @PutMapping("/update/{taskId}")
    public String updateTask(@PathVariable Long taskId, @RequestBody Task task) {
        return taskService.updateTask(taskId, task);
    }

    // Endpoint to archive a task
    @PutMapping("/archive/{taskId}")
    public String archiveTask(@PathVariable Long taskId) {
        return taskService.archiveTask(taskId);
    }

    @GetMapping("/overdue")
    public List<Map<String, Object>> getOverdueTasks(@RequestParam String userEmail) {
        // Fetch overdue tasks for the specific user
        List<Task> overdueTasks = taskService.getTasksOverdue(userEmail);

        // Map each task to a map with required fields
        return overdueTasks.stream().map(task -> Map.<String, Object>of(
                "taskName", task.getTaskName(),
                "userEmail", task.getUserEmail(),
                "dueDate", task.getDueDate()
        )).collect(Collectors.toList());
    }

    @PutMapping("/complete/{taskId}")
    public String completeTask(@PathVariable Long taskId) {
        return taskService.updateTaskStatus(taskId, "Completed");
    }

    @PutMapping("/pending/{taskId}")
    public String pendingTask(@PathVariable Long taskId) {
        return taskService.updateTaskStatus(taskId, "Pending");
    }

    @PutMapping("/unarchive/{taskId}")
    public String unarchiveTask(@PathVariable Long taskId) {
        return taskService.unarchiveTask(taskId);
    }

    @GetMapping("/upcoming")
    public List<Map<String, Object>> getUpcomingTasks(@RequestParam String userEmail) {
        // Fetch upcoming tasks for the specific user
        List<Task> upcomingTasks = taskService.getTasksUpcoming(userEmail);

        // Map each task to a map with required fields
        return upcomingTasks.stream().map(task -> Map.<String, Object>of(
                "taskName", task.getTaskName(),
                "userEmail", task.getUserEmail(),
                "dueDate", task.getDueDate()
        )).collect(Collectors.toList());
    }

}
