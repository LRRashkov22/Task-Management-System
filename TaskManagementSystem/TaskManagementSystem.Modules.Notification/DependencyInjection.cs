using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using TaskManagementSystem.Modules.Notification.Application.Interfaces;
using TaskManagementSystem.Modules.Notification.Application.Services;
using TaskManagementSystem.Modules.Notification.Infrastructure.Hubs;

namespace TaskManagementSystem.Modules.Notification;

public static class DependencyInjection
{
    public static IServiceCollection AddNotificationModule(this IServiceCollection services)
    {
        services.AddSignalR();

        services.AddControllers()
            .PartManager
            .ApplicationParts
            .Add(new AssemblyPart(typeof(NotificationHub).Assembly));


        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ITaskNotificationService, TaskNotificationService>();
        services.AddScoped<ITeamNotificationService, TeamNotificationService>();

        return services;
    }
}
