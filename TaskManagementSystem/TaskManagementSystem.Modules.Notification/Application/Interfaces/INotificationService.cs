using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;

namespace TaskManagementSystem.Modules.Notification.Application.Interfaces
{
    public interface INotificationService
    {
        Task SendNotificationAsync(int userId, string message);
        Task NotifyTaskAssignedAsync(TaskItem task, IEnumerable<int> assignedUserIdss);
    }
}
