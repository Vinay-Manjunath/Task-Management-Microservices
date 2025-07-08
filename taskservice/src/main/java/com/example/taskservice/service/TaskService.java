package com.example.taskservice.service;

import com.example.taskservice.model.Task;
import com.example.taskservice.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Calendar;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    // Create a task and associate it with a user based on email
    public void createTask(Task task) {
        // Save task to the database
        taskRepository.save(task);
    }

    // Fetch tasks by user email
    public List<Task> getTasksByUserEmail(String email) {
        return taskRepository.findByUserEmail(email);
    }

    // Update a task
    public String updateTask(Long taskId, Task taskDetails) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task != null) {
            // Update the task fields
            task.setTaskName(taskDetails.getTaskName());
            task.setDescription(taskDetails.getDescription());
            task.setPriority(taskDetails.getPriority());
            task.setDueDate(taskDetails.getDueDate());

            // Save the updated task
            taskRepository.save(task);

            return "Task updated successfully!";
        } else {
            return "Task not found!";
        }
    }

    public String updateTaskStatus(Long taskId, String status) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task != null) {
            task.setStatus(status); // Set status to Completed or Pending
            taskRepository.save(task);
            return "Task status updated to " + status + " successfully!";
        } else {
            return "Task not found!";
        }
    }

    // Mark task as completed
    public String completeTask(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task != null) {
            task.setStatus("Completed");
            taskRepository.save(task);
            return "Task completed successfully!";
        } else {
            return "Task not found!";
        }
    }

    // Archive task
    public String archiveTask(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task != null) {
            task.setArchived(true);
            taskRepository.save(task);
            return "Task archived successfully!";
        } else {
            return "Task not found!";
        }
    }

    public List<Task> getTasksNearDeadline(String userEmail) {
        Calendar calendar = Calendar.getInstance();
        Date today = calendar.getTime(); // Current date

        calendar.add(Calendar.DAY_OF_MONTH, 3); // Add 3 days to today
        Date upcomingDeadline = calendar.getTime(); // Date after 3 days

        // Query tasks for the specific user with status "Pending" and archived = false
        return taskRepository.findByUserEmailAndDueDateBetweenAndStatusAndArchived(userEmail, today, upcomingDeadline, "Pending", false);
    }

    public String unarchiveTask(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task != null) {
            task.setArchived(false); // Set task as unarchived
            taskRepository.save(task);
            return "Task unarchived successfully!";
        } else {
            return "Task not found!";
        }
    }

    public List<Task> getTasksOverdue(String userEmail) {
        Calendar calendar = Calendar.getInstance();
        Date today = calendar.getTime(); // Current date

        // Query tasks for the specific user with status "Pending", archived = false, and due date before today
        return taskRepository.findByUserEmailAndDueDateBeforeAndStatusAndArchived(userEmail, today, "Pending", false);
    }

    public List<Task> getTasksUpcoming(String userEmail) {
        Calendar calendar = Calendar.getInstance();
        Date today = calendar.getTime(); // Current date

        calendar.add(Calendar.DAY_OF_MONTH, 3); // Add 3 days to today
        Date upcomingDeadline = calendar.getTime(); // Date after 3 days

        // Query tasks for the specific user with status "Pending", archived = false, and due date between today and the upcoming deadline
        return taskRepository.findByUserEmailAndDueDateBetweenAndStatusAndArchived(userEmail, today, upcomingDeadline, "Pending", false);
    }

}
