using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using TaskManagementSystem.API.Controllers;
using TaskManagementSystem.Modules.WorkSessions.Application.Interfaces;
using TaskManagementSystem.Modules.WorkSessions.Application.Services;

namespace TaskManagementSystem.Modules.WorkSessions
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddWorkSessionsModule(this IServiceCollection services)
        {
            services.AddControllers()
            .PartManager.ApplicationParts.Add(
                new AssemblyPart(typeof(WorkSessionsController).Assembly));

            services.AddScoped<IWorkSessionService, WorkSessionService>();

            return services;
        }
    }
}
