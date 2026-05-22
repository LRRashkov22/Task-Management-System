using Microsoft.AspNetCore.Identity;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Persistance;

namespace TaskManagementSystem.Api.Helpers
{
    public class ApplicationInitializer
    {
        public static void Initialize(WebApplication app)
        {
            InitializeIdentityRoles(app);
        }
        private static void InitializeIdentityRoles(WebApplication app)
        {
            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<TaskManagementDbContext>();

                if (!context.Users.Any(u => u.Role == Role.Admin))
                {
                    var admin = new User
                    {
                        Username = "admin",
                        Role = Role.Admin,
                        ManagerId = null,
                        Manager = null,
                    };

                    admin.PasswordHash = new PasswordHasher<User>()
                        .HashPassword(admin, "admin");

                    context.Users.Add(admin);
                    context.SaveChanges();
                }
            }
        }
    }
}
