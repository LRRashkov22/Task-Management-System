using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using TaskManagementSystem.Modules.Logs.Application.Interfaces;
using TaskManagementSystem.Modules.Logs.Application.Services;
using TaskManagementSystem.Modules.Logs.Presentation;

namespace TaskManagementSystem.Modules.Logs;

public static class DependencyInjection
{
    public static IServiceCollection AddLogsModule(this IServiceCollection services)
    {
        services.AddControllers()
            .PartManager.ApplicationParts.Add(
                new AssemblyPart(typeof(LogsController).Assembly));
        services.AddScoped<ICRUDLogService, CRUDLogService>();
        services.AddScoped<ITaskLogger, TaskLogger>();

        return services;
    }
}
