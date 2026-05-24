using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Modules.Comments.Application.Interfaces;
using TaskManagementSystem.Modules.Comments.Application.Services;
using TaskManagementSystem.Modules.Comments.Presentation;

namespace TaskManagementSystem.Modules.Comments
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddCommentsModule(this IServiceCollection services)
        {
            services.AddControllers()
                .PartManager.ApplicationParts.Add(
                new AssemblyPart(typeof(CommentsController).Assembly));

            services.AddScoped<ICommentService, CommentService>();

            return services;
        }
    }
}
