package com.example.taskservice.repository;

import com.example.taskservice.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Date;

// Repository for accessing Task data from the database
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserEmail(String email);
    List<Task> findByUserEmailAndDueDateBeforeAndStatusAndArchived(String userEmail, Date dueDate, String status, boolean archived);// Query to fetch tasks by user email
    List<Task> findByUserEmailAndDueDateBetweenAndStatusAndArchived(String userEmail, Date startDate, Date endDate, String status, boolean archived);
}
