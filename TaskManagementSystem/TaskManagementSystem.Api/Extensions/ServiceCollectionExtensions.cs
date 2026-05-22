using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TaskManagementSystem.Data;
using TaskManagementSystem.Modules.Identity;
using TaskManagementSystem.Modules.Statistics;
using TaskManagementSystem.Modules.Tasks;
using TaskManagementSystem.Modules.Teams;

namespace TaskManagementSystem.Api.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
        {
            //services.AddControllers()
            //    .AddApplicationPart(
            //        typeof(TaskManagementSystem.Modules.Identity.Presentation.IdentityController).Assembly);
            services.AddOpenApi();

            //Adding Modules (Controllers And DI)-------------------------------------------------
            services.AddControllers();
            services.AddIdentityModule();
            services.AddTeamsModule();
            services.AddStasticsModule();
            services.AddTaskModule();
            //------------------------------------------------------------------------------------

            services.AddData(configuration);

            //services.AddDbContext<TMSDbContext>(options =>
            //    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

            //JWT Authentication configuration-----------------------------------------------------

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = configuration["AppSettings:Issuer"],
                        ValidAudience = configuration["AppSettings:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(configuration["AppSettings:Token"]!))
                    };
                });

            //--------------------------------------------------------------------------------------
            services.AddCors(options =>
            {
                options.AddPolicy("frontend",
                    policy => policy
                        .WithOrigins("http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
            });
            return services;
        }
    }
}
