using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Persistance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using TaskManagementSystem.Data.Options;
using Microsoft.Extensions.Options;
namespace TaskManagementSystem.Data
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddData(this IServiceCollection services, IOptions<DatabaseOptions> config)
        {
            DatabaseOptions dbConfig = config.Value;

            services.AddDbContext<TaskManagementDbContext>(options =>
                options.UseNpgsql(dbConfig.DefaultConnection));

            return services;

        }

    }

}
