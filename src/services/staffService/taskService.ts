import { apiClient } from '../../config/api';
import { ApiResponse, ApiTask, TaskRequest } from '../../types/appointment';

export class TaskService {
  
  // ✅ Get all tasks
  static async getAllTasks(): Promise<ApiTask[]> {
    try {
      console.log("📝 Fetching all tasks...");
      
      const response = await apiClient.get<ApiResponse<ApiTask[]>>("/tasks");
      
      if (response.data.code === 200) {
        console.log("✅ Fetched tasks:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch tasks:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching tasks:", error);
      return [];
    }
  }

  // ✅ Get task by ID
  static async getTaskById(taskId: string): Promise<ApiTask | null> {
    try {
      console.log(`📝 Fetching task: ${taskId}`);
      
      const response = await apiClient.get<ApiResponse<ApiTask>>(`/tasks/${taskId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Fetched task:", response.data.result);
        return response.data.result;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to fetch task ${taskId}:`, error);
      return null;
    }
  }

  // ✅ Get tasks by order detail ID
  static async getTasksByOrderDetailId(orderDetailId: string): Promise<ApiTask[]> {
    try {
      console.log(`📝 Fetching tasks for order detail: ${orderDetailId}`);
      
      const response = await apiClient.get<ApiResponse<ApiTask[]>>(`/tasks/order-detail/${orderDetailId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Fetched order detail tasks:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch order detail tasks:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching order detail tasks:", error);
      return [];
    }
  }

  // ✅ Get tasks by DNA service ID
  static async getTasksByDnaServiceId(dnaServiceId: string): Promise<ApiTask[]> {
    try {
      console.log(`📝 Fetching tasks for DNA service: ${dnaServiceId}`);
      
      const response = await apiClient.get<ApiResponse<ApiTask[]>>(`/tasks/dna-service/${dnaServiceId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Fetched DNA service tasks:", response.data.result.length);
        return response.data.result;
      } else {
        console.warn("⚠️ Failed to fetch DNA service tasks:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching DNA service tasks:", error);
      return [];
    }
  }

  // ✅ Create task
  static async createTask(taskData: TaskRequest): Promise<ApiTask | null> {
    try {
      console.log("📝 Creating task...");

      const response = await apiClient.post<ApiResponse<ApiTask>>("/tasks", taskData);

      if (response.data.code === 200) {
        console.log("✅ Task created successfully");
        return response.data.result;
      } else {
        console.error("❌ Failed to create task:", response.data.message);
        return null;
      }

    } catch (error) {
      console.error("❌ Error creating task:", error);
      return null;
    }
  }

  // ✅ Update task
  static async updateTask(taskId: string, taskData: Partial<TaskRequest>): Promise<ApiTask | null> {
    try {
      console.log(`📝 Updating task: ${taskId}`);
      
      const response = await apiClient.put<ApiResponse<ApiTask>>(`/tasks/${taskId}`, taskData);
      
      if (response.data.code === 200) {
        console.log("✅ Task updated successfully");
        return response.data.result;
      } else {
        console.error("❌ Failed to update task:", response.data.message);
        return null;
      }
    } catch (error) {
      console.error("❌ Error updating task:", error);
      return null;
    }
  }

  // ✅ Delete task
  static async deleteTask(taskId: string): Promise<boolean> {
    try {
      console.log(`📝 Deleting task: ${taskId}`);
      
      const response = await apiClient.delete(`/tasks/${taskId}`);
      
      if (response.data.code === 200) {
        console.log("✅ Task deleted successfully");
        return true;
      } else {
        console.error("❌ Failed to delete task:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("❌ Error deleting task:", error);
      return false;
    }
  }

  // ✅ Update task status (convenience method)
  static async updateTaskStatus(taskId: string, status: string, notes?: string): Promise<boolean> {
    const updateData: Partial<TaskRequest> = {
      status: status,
      notes: notes || '',
    };

    if (status === 'COMPLETED') {
      updateData.completedDate = new Date().toISOString();
    }

    const updatedTask = await this.updateTask(taskId, updateData);
    return updatedTask !== null;
  }
}