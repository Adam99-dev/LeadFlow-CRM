import { createContext, useCallback, useContext, useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useWorkspace } from "./WorkspaceContext";

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { workspace } = useWorkspace();
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllTasks = async () => {
    if (!workspace?.id) {
      return { success: false, message: "No workspace selected" };
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest("/api/tasks", { workspaceScoped: true });
      if (data.success) setTasks(data.tasks);
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getLeadTasks = useCallback(async (leadId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/api/leads/${leadId}/tasks`, {
        workspaceScoped: true,
      });
      if (data.success) setTasks(data.tasks);
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getTask = async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/api/tasks/${taskId}`, {
        workspaceScoped: true,
      });
      if (data.success) setTask(data.task);
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    const { leadId, ...payload } = taskData;
    if (!leadId) {
      return { success: false, message: "leadId is required" };
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/api/leads/${leadId}/tasks`, {
        method: "POST",
        body: payload,
        workspaceScoped: true,
      });

      if (data.success) {
        setTasks((prev) => [data.task, ...prev]);
      }
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: taskData,
        workspaceScoped: true,
      });

      const updated = data.task;
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === parseInt(taskId, 10) ? updated : t)),
        );
        if (task?.id === parseInt(taskId, 10)) setTask(updated);
      }
      return { ...data, updatedTask: updated };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        body: { status },
        workspaceScoped: true,
      });

      if (data.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === parseInt(taskId, 10) ? data.task : t)),
        );
        if (task?.id === parseInt(taskId, 10)) setTask(data.task);
      }
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/api/tasks/${taskId}`, {
        method: "DELETE",
        workspaceScoped: true,
      });

      if (data.success) {
        setTasks((prev) => prev.filter((t) => t.id !== parseInt(taskId, 10)));
        if (task?.id === parseInt(taskId, 10)) setTask(null);
      }
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get tasks assigned to a specific user
   * @param {string} userId - The ID of the user
   * @returns {Promise<{success: boolean, tasks?: Array, message?: string}>}
   */
  const getTaskByUserId = useCallback(async (userId) => {
    if (!userId) {
      return { success: false, message: "userId is required" };
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/api/tasks/user/${userId}`, {
        workspaceScoped: true,
      });
      
      if (data.success) {
        setTasks(data.tasks);
      }
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getTasksByLead = (leadId) =>
    tasks.filter((t) => t.leadId === parseInt(leadId, 10));

  return (
    <TaskContext.Provider
      value={{
        tasks,
        task,
        loading,
        error,
        getAllTasks,
        getLeadTasks,
        getTask,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        getTaskByUserId,
        getUserTask: getTaskByUserId,
        getTasksByLead,
        getTasksByAssignee: (assigneeId) =>
          tasks.filter((t) => t.assignedToId === assigneeId),
        getTasksByStatus: (status) => tasks.filter((t) => t.status === status),
        clearError: () => setError(null),
        resetState: () => {
          setTasks([]);
          setTask(null);
          setError(null);
        },
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
