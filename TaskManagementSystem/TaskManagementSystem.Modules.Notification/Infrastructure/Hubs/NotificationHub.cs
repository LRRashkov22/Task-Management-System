using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TaskManagementSystem.Modules.Notification.Infrastructure.Hubs;

[Authorize]
public class NotificationHub : Hub
{
}