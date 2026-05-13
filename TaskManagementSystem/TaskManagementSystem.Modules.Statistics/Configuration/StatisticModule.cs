using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using TaskManagementSystem.Modules.Statistics.Application.Interface;
using TaskManagementSystem.Modules.Statistics.Infrastructure.Service.AdminPanel;
using TaskManagementSystem.Modules.Statistics.Presentation;
using TaskManagementSystem.Modules.Statistics.Infrastructure.Service.NewFolder;
namespace TaskManagementSystem.Modules.Statistics.Configuration;

public static class StatisticsModule
{
    public static IServiceCollection AddStasticsModule(this IServiceCollection services)
    {
        services.AddControllers()
            .PartManager.ApplicationParts.Add(
                new AssemblyPart(typeof(AdminInformationController).Assembly));

        services.AddScoped<IGetAdminInformation, GetAdminInformation>();
        services.AddScoped<IGetManagerInformation, GetManagerInformation>();

        return services;
    }
}