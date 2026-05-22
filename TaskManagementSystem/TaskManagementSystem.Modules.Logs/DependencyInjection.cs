using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using TaskManagementSystem.Modules.Logs.Presentation;
using TaskManagementSystem.Modules.Logs.Application.Interfaces;
using TaskManagementSystem.Modules.Logs.Application.Services;

namespace TaskManagementSystem.Modules.Teams;

public static class DependencyInjection
{
    public static IServiceCollection AddTeamsModule(this IServiceCollection services)
    {
        services.AddControllers()
            .PartManager.ApplicationParts.Add(
                new AssemblyPart(typeof(LogsController).Assembly));
        services.AddScoped<ICRUDLogService, CRUDLogService>();

        return services;
    }
}
