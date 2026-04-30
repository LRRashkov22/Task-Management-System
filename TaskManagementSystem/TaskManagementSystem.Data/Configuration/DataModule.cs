using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Persistance;
using Microsoft.EntityFrameworkCore;
namespace TaskManagementSystem.Data.Configuration
{
    public static class DataModule
    {
        public static IServiceCollection AddData(this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContext<TMSDbContext>(options =>
                options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

            return services;

        }

    }

}
