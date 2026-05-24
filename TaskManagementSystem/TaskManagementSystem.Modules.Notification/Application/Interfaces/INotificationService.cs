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
        Task<int> GetAdminIdAsync();
        Task<(bool?, string?)> MarkAsReadAsync(int userid, int notificationId);
        Task<(bool?, string?)> MarkAsReadAllAsync(int userid);


    }
}
