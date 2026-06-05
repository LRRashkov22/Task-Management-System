using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using TaskManagementSystem.Modules.Statistics.Presentation;
using TaskManagementSystem.Modules.Statistics.Application.Interfaces;
using TaskManagementSystem.Modules.Statistics.Application.Services.ManagerPanel;
using TaskManagementSystem.Modules.Statistics.Application.Services.AdminPanel;
using TaskManagementSystem.Modules.Statistics.Application.Services.EmployeePanel;
namespace TaskManagementSystem.Modules.Statistics;

public static class DependencyInjection
{
    public static IServiceCollection AddStasticsModule(this IServiceCollection services)
    {
        services.AddControllers()
            .PartManager.ApplicationParts.Add(
                new AssemblyPart(typeof(AdminInformationController).Assembly));

        services.AddScoped<IGetAdminInformation, GetAdminInformation>();
        services.AddScoped<IGetManagerInformation, GetManagerInformation>();
        services.AddScoped<IGetEmployeeInformation, GetEmployeeInformation>();

        return services;
    }
}
