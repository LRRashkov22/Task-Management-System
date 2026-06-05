using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;

namespace TaskManagementSystem.Modules.Notification.Application.Interfaces
{
    public interface ITaskNotificationService
    {
        Task NotifyTaskAssignedAsync(TaskItem task, IEnumerable<int> assignedUserIdss, string ManagerName);
        Task NotifyTaskRecoverAsync(TaskItem task);
        Task NotifyTaskArchivedAsync(TaskItem task, int userid);
        Task NotifyTaskTransferedAsync(TaskItem task, IEnumerable<int> oldAssignedUsers);
        Task NotifyTaskEditAsync(TaskItem task, IEnumerable<int> removedUsers, IEnumerable<int> addedUsers);
        Task NotifyCommentAddedAsync(TaskItem task, IEnumerable<int> asssignedUsers, string AuthorName);
        Task NotifyCommentMentionAsync(TaskItem task, string TaggerName, IEnumerable<int> MentionedUsers);
    }
}
