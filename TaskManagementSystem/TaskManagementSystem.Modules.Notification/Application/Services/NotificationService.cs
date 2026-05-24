using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
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
    //Helper
    public async Task<int> GetAdminIdAsync() {
        return await context.Users.AsNoTracking()
            .Where(m => m.Role == TaskManagementSystem.Data.Domain.Enums.Role.Admin)
            .Select(m => m.Id)
            .FirstOrDefaultAsync();
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



}