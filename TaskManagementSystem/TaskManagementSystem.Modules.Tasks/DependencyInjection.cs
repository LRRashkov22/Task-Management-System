using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using TaskManagementSystem.Modules.Tasks.Infrastructure.Service;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Modules.Tasks.Application.Interface;
using TaskManagementSystem.Modules.Tasks.Presentation;

namespace TaskManagementSystem.Modules.Tasks
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddTaskModule(this IServiceCollection services)
        {
            services.AddControllers()
                .PartManager.ApplicationParts.Add(
                    new AssemblyPart(typeof(ManageTasksController).Assembly));

            services.AddScoped<IManageTasks, ManageTasks>();

            return services;
        }
    }
}
