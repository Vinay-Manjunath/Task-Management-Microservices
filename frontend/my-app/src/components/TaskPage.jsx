import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Low');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('Pending');
  const [showArchived, setShowArchived] = useState(false); // State to control showing archived tasks
  const userEmail = sessionStorage.getItem('userEmail'); // Retrieve user email from session storage

  // Fetch tasks on component mount or when userEmail changes
  useEffect(() => {
    if (userEmail) {
      fetchTasks();
    }
  }, [userEmail, showArchived]); // Adding showArchived to fetch when toggling

  /** Fetch Tasks */
  const fetchTasks = async () => {
    try {
      const response = await fetch(`/tasks/user/${userEmail}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      
      // Filter tasks based on whether archived tasks should be shown
      const filteredTasks = showArchived ? data.filter(task => task.archived) : data.filter(task => !task.archived);
      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  /** Add New Task */
  const handleAddTask = async () => {
    if (!taskName || !dueDate || !status || !priority || !category) {
      alert('Please fill in all fields!');
      return;
    }

    const newTask = { taskName, description, dueDate, priority, category, status, userEmail };

    try {
      const response = await fetch('/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error('Failed to add task');
      setShowAddModal(false);
      clearForm();
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  /** Update Task */
  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    const updatedTask = { taskName, description, dueDate, priority, category, status };

    try {
      const response = await fetch(`/tasks/update/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (!response.ok) throw new Error('Failed to update task');
      setShowUpdateModal(false);
      clearForm();
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  /** Toggle Task Status between Pending and Completed */
  const toggleTaskStatus = async (taskId, currentStatus) => {
    const url = currentStatus === 'Completed' 
      ? `tasks/pending/${taskId}` 
      : `tasks/complete/${taskId}`;
  
    try {
      const response = await fetch(url, { method: 'PUT' });
      if (!response.ok) throw new Error('Error toggling task status');
      fetchTasks(); // Fetch tasks again to update the list
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  /** Archive Task */
  const handleArchiveTask = async (taskId) => {
    try {
      await fetch(`tasks/archive/${taskId}`, { method: 'PUT' });
      fetchTasks();
    } catch (error) {
      console.error('Error archiving task:', error);
    }
  };

  /** Unarchive Task */
  const handleUnarchiveTask = async (taskId) => {
    try {
      await fetch(`tasks/unarchive/${taskId}`, { method: 'PUT' });
      fetchTasks();
    } catch (error) {
      console.error('Error unarchiving task:', error);
    }
  };

  /** Open Update Modal */
  const openUpdateModal = (task) => {
    setSelectedTask(task);
    setTaskName(task.taskName);
    setDescription(task.description);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setCategory(task.category);
    setStatus(task.status); // Don't update the status in the modal
    setShowUpdateModal(true);
  };

  /** Toggle Archived Tasks */
  const toggleArchivedTasks = () => {
    setShowArchived(!showArchived);
  };

  /** Clear Form Fields */
  const clearForm = () => {
    setTaskName('');
    setDescription('');
    setDueDate('');
    setPriority('Low');
    setCategory('');
    setStatus('Pending');
    setSelectedTask(null);
  };

  return (
    <div className="task-container">
      <h2>📝 Your Tasks</h2>
      <Button variant="primary" onClick={() => setShowAddModal(true)}>
        + Add New Task
      </Button>

      {/* Toggle Archived Tasks Button */}
      <Button variant="info" onClick={toggleArchivedTasks}>
        {showArchived ? 'Show Active Tasks' : 'Show Archived Tasks'}
      </Button>

      {/* Task List */}
      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="task">
              <h4>{task.taskName}</h4>
              <p><strong>Description:</strong> {task.description}</p>
              <p><strong>Due Date:</strong> {task.dueDate}</p>
              <p><strong>Status:</strong> {task.status}</p>
              <p><strong>Priority:</strong> {task.priority}</p>
              <p><strong>Category:</strong> {task.category}</p>
              {task.archived && <p><strong>Archived:</strong> Yes</p>} {/* Show if archived */}
              <div className="task-actions">
                <Button variant="info" onClick={() => openUpdateModal(task)}>Update</Button>
                {!task.archived && (
                  <Button
                    variant={task.status === 'Completed' ? 'warning' : 'success'}
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                  >
                    {task.status === 'Completed' ? 'Mark Pending' : 'Complete'}
                  </Button>
                )}
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

      {/* Add Task Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="taskName">
              <Form.Label>Task Name</Form.Label>
              <Form.Control
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="dueDate">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="priority">
              <Form.Label>Priority</Form.Label>
              <Form.Control
                as="select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddTask}>Add Task</Button>
        </Modal.Footer>
      </Modal>

      {/* Update Task Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="taskName">
              <Form.Label>Task Name</Form.Label>
              <Form.Control
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="dueDate">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="priority">
              <Form.Label>Priority</Form.Label>
              <Form.Control
                as="select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleUpdateTask}>Update Task</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
