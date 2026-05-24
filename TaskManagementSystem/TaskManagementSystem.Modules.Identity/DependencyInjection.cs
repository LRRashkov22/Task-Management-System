using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using TaskManagementSystem.Modules.Identity.Application.Interfaces;
using TaskManagementSystem.Modules.Identity.Application.Services;
using TaskManagementSystem.Modules.Identity.Presentation;

namespace TaskManagementSystem.Modules.Identity;

public static class DependencyInjection
{
    //Controllers and DI containers
    public static IServiceCollection AddIdentityModule(this IServiceCollection services)
    {
        services.AddControllers()
            .PartManager.ApplicationParts.Add(
                new AssemblyPart(typeof(IdentityController).Assembly));

            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ICreateUser, CreateUserService>();
            services.AddScoped<IManageUsers, ManageUsersService>();

        return services;
    }


}