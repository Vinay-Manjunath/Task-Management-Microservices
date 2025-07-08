import React, { useEffect, useState } from 'react';
import { Button, Form, Navbar, Nav } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import './Tasks.css'; // Assuming your CSS file is named Tasks.css

export default function Tasks() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [taskData, setTaskData] = useState({
    id: '',
    taskName: '',
    description: '',
    dueDate: '',
    priority: 'Low',
    category: '',
    status: 'Pending',
  });
  const [showArchived, setShowArchived] = useState(false);
  const userEmail = sessionStorage.getItem('userEmail');
  console.log(userEmail)
  const [showNotifications, setShowNotifications] = useState(false); // Controls visibility
const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (userEmail) {
      fetchTasks();
    }
  }, [userEmail, showArchived]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://localhost:8081/tasks/user/${userEmail}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      const filteredTasks = showArchived ? data.filter(task => task.archived) : data.filter(task => !task.archived);
      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = async () => {
    if (!taskData.taskName || !taskData.dueDate || !taskData.status || !taskData.priority || !taskData.category) {
      alert('Please fill in all fields!');
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, userEmail }),
      });
      if (!response.ok) throw new Error('Failed to add task');
      setShowForm(false);
      setIsUpdate(false);
      setTaskData({ id: '', taskName: '', description: '', dueDate: '', priority: 'Low', category: '', status: 'Pending' });
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async () => {
    if (!taskData.taskName || !taskData.dueDate || !taskData.status || !taskData.priority || !taskData.category) {
      alert('Please fill in all fields!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/tasks/update/${taskData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error('Failed to update task');
      setShowForm(false);
      setIsUpdate(false);
      setTaskData({ id: '', taskName: '', description: '', dueDate: '', priority: 'Low', category: '', status: 'Pending' });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskClick = (task) => {
    setTaskData(task);
    setIsUpdate(true);
    setShowForm(true);
  };

  const toggleArchivedTasks = () => {
    setShowArchived(!showArchived);
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const url = currentStatus === 'Completed' 
      ? `http://localhost:8081/tasks/pending/${taskId}` 
      : `http://localhost:8081/tasks/complete/${taskId}`;
  
    try {
      const response = await fetch(url, { method: 'PUT' });
      if (!response.ok) throw new Error('Error toggling task status');
      fetchTasks(); // Fetch tasks again to update the list
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleArchiveTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:8081/tasks/archive/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      });
      if (response.ok) {
        fetchTasks();
      } else {
        console.error('Error archiving task');
      }
    } catch (error) {
      console.error('Error archiving task:', error);
    }
  };

  const handleUnarchiveTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:8081/tasks/unarchive/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: false }),
      });
      if (response.ok) {
        fetchTasks();
      } else {
        console.error('Error unarchiving task');
      }
    } catch (error) {
      console.error('Error unarchiving task:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userEmail');
    window.location.href = '/'; 
  };

  const toggleNotifications = async () => {
    try {
      if (showNotifications) {
        setShowNotifications(false); // Close if already open
        return;
      }
  
      // Fetch overdue notifications
      const overdueResponse = await fetch(`http://localhost:8084/notifications/overdue-notifications?userEmail=${encodeURIComponent(userEmail)}`);
      if (!overdueResponse.ok) throw new Error('Failed to fetch overdue notifications');
  
      const overdueData = await overdueResponse.json();
  
      // Fetch upcoming notifications
      const upcomingResponse = await fetch(`http://localhost:8084/notifications/upcoming-notifications?userEmail=${encodeURIComponent(userEmail)}`);
      if (!upcomingResponse.ok) throw new Error('Failed to fetch upcoming notifications');
  
      const upcomingData = await upcomingResponse.json();
  
      // Combine both overdue and upcoming notifications
      const allNotifications = [...overdueData, ...upcomingData];
  
      setNotifications(allNotifications); // Set both overdue and upcoming notifications
      setShowNotifications(true); // Show notifications after fetching
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };


  return (
    <div>
      {/* Navigation Bar */}
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#"><img src="/logo.png" alt="Logo" className="logo" /></Navbar.Brand>
        <Nav className="ml-auto">
          
          <div style={{ position: 'relative' }}>
  <Button variant="link" className="navb" onClick={toggleNotifications}>
    Notifications
  </Button>

  {showNotifications && (
    <div className="notification-overlay">
      <h5>🔔 Notifications</h5>
      <ul>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <li key={notification.id} className="notification-item">
              {notification.message}
            </li>
          ))
        ) : (
          <li>No notifications available</li>
        )}
      </ul>
    </div>
  )}
  <Button variant="link" className="navb" onClick={handleLogout}>Logout</Button>
</div>


        </Nav>
      </Navbar>

      <div className="task-container">
        <h2>📝 Your Tasks</h2>
        <Button variant="primary" onClick={() => setShowForm(true)} className="add-task-btn">
          + Add New Task
        </Button>

        <Button variant="info" onClick={toggleArchivedTasks} className="toggle-archived-btn">
          {showArchived ? 'Show Active Tasks' : 'Show Archived Tasks'}
        </Button>

        {showForm && (
          <div className="task-form-container">
            <h3>{isUpdate ? 'Update Task' : 'Add New Task'}</h3>
            <Form className="task-form">
              <Form.Group controlId="taskName">
                <Form.Label>Task Name</Form.Label>
                <Form.Control
                  type="text"
                  value={taskData.taskName}
                  onChange={(e) => setTaskData({ ...taskData, taskName: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="dueDate">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="priority">
                <Form.Label>Priority</Form.Label>
                <Form.Control
                  as="select"
                  value={taskData.priority}
                  onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                  required
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="category">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  value={taskData.category}
                  onChange={(e) => setTaskData({ ...taskData, category: e.target.value })}
                  required
                />
              </Form.Group>
              <Button variant="secondary" onClick={() => setShowForm(false)} className="cancel-btn">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={isUpdate ? handleUpdateTask : handleAddTask}
                className="submit-btn"
              >
                {isUpdate ? 'Update Task' : 'Add Task'}
              </Button>
            </Form>
          </div>
        )}

        <div className="task-list">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task.id} className="task-card">
                <h4>{task.taskName}</h4>
                <p><strong>Description:</strong> {task.description}</p>
                <p><strong>Due Date:</strong> {task.dueDate}</p>
                <p><strong>Status:</strong> {task.status}</p>
                <p><strong>Priority:</strong> {task.priority}</p>
                <p><strong>Category:</strong> {task.category}</p>
                {task.archived && <p><strong>Archived:</strong> Yes</p>}
                <div className="task-actions">
                  <Button variant="info" onClick={() => handleTaskClick(task)}>Update</Button>
                  <Button variant={task.status === 'Completed' ? 'warning' : 'success'} onClick={() => toggleTaskStatus(task.id, task.status)}>
                    {task.status === 'Completed' ? 'Mark Pending' : 'Completed'}
                  </Button>
                  {!task.archived && (
                    <Button variant="secondary" onClick={() => handleArchiveTask(task.id)}>Archive</Button>
                  )}
                  {task.archived && (
                    <Button variant="warning" onClick={() => handleUnarchiveTask(task.id)}>Unarchive</Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No tasks available. Start by adding a new task!</p>
          )}
        </div>
      </div>
    </div>
  );
}
