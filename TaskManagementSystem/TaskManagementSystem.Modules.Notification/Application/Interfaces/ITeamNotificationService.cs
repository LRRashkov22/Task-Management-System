using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;

namespace TaskManagementSystem.Modules.Notification.Application.Interfaces
{
    public interface ITeamNotificationService
    {
        //Teams
        Task NotifyCreateTeamAsync(Team team, IEnumerable<int> memberIds, string managerName);
        Task NotifyTeamArchivedAsync(Team team); 
        Task NotifyTeamRecoveredAsync(Team team); 
        Task NotifyTeamTransferredAsync(Team team, int oldManagerId, int newManagerId); 
        Task NotifyTeamEditedAsync(Team team, IEnumerable<int> removedUsers, IEnumerable<int> addedUsers); 


    }
}
