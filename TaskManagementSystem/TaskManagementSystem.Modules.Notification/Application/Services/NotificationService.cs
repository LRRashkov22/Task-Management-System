using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Collections.ObjectModel;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Notification.Application.Interfaces;
using TaskManagementSystem.Modules.Notification.Infrastructure.Hubs;
//SignalR
public class NotificationService : INotificationService
{
    private readonly TaskManagementDbContext context;

    private readonly IHubContext<NotificationHub> hubContext;

    public NotificationService(TaskManagementDbContext context, IHubContext<NotificationHub> hubContext)
    {
        this.context = context;
        this.hubContext = hubContext;
    }
    //SignalR
    public async Task SendNotificationAsync(int userId, string message)
    {
        var notification = new Notification
        {
            UserId = userId,
            Message = message
        };

        context.Notifications.Add(notification);

        await context.SaveChangesAsync();

        await hubContext
            .Clients
            .User(userId.ToString())
            .SendAsync("ReceiveNotification",
                new
                {
                    notification.Id,
                    notification.Message,
                    notification.CreatedAt
                });
    }

    public async Task NotifyTaskAssignedAsync(TaskItem task, IEnumerable<int> assignedUserIdss)
    {
        foreach (var memberId in assignedUserIdss)
        {
            await SendNotificationAsync(memberId,
                $"You were assigned to task: {task.Title}");
        }
    }
}