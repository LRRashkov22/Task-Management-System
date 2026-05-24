using Scalar.AspNetCore;

namespace TaskManagementSystem.Api.Extensions
{
    public static class MiddlewareExtensions
    {
        public static void UseApiMiddleware(this WebApplication app)
        {
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.MapScalarApiReference();
            }
            app.UseHttpsRedirection();

            app.UseCors("CorsPolicy");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
        }
    
    }
}
