using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Modules.Identity.Application.Interfaces;
using TaskManagementSystem.Data.Persistance;

namespace TaskManagementSystem.Modules.Identity.Infrastructure.Service
{
    public class AuthService(TMSDbContext context, IConfiguration configuration) : IAuthService
    {
    }
}
