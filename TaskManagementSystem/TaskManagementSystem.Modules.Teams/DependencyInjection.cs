using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using TaskManagementSystem.Modules.Teams.Application.Interfaces;
using TaskManagementSystem.Modules.Teams.Application.Services;
using TaskManagementSystem.Modules.Teams.Presentation;

namespace TaskManagementSystem.Modules.Teams;

public static class DependencyInjection
{
    public static IServiceCollection AddTeamsModule(this IServiceCollection services)
    {
        services.AddControllers()
            .PartManager.ApplicationParts.Add(
                new AssemblyPart(typeof(TeamsController).Assembly));
        services.AddScoped<ICRUDTeamService, CRUDTeamService>();

        return services;
    }
}
