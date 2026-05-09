using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Identity.Application.Interfaces;
using TaskManagementSystem.Modules.Identity.Application.UserDto_s;
using TaskManagementSystem.Data.Domain.Enums;
namespace TaskManagementSystem.Modules.Identity.Infrastructure.Service;

public class CreateUserService(TMSDbContext context) : ICreateUser
{

    public async Task<(User? user, string? error)> RegisterUser(CreateUserDto request)
    {
        var (validationUser, error) = await HelperCheckFunc(request);

        if (error != null)
        {
            return (null, error);
        }
        var user = new User();
        var hashedPassword = new PasswordHasher<User>().HashPassword(user, request.Password);
        user.Username = request.Username;
        user.PasswordHash = hashedPassword;
        user.CreatedAt = DateTime.UtcNow;

        if (request.Role == Data.Domain.Enums.Role.Manager)
        {
            user.Role = Data.Domain.Enums.Role.Manager;
            user.Manager = null;
            user.ManagerId = null;
        }
        else {
            user.Role = Data.Domain.Enums.Role.Employee;
            user.ManagerId = context.Users.Where(u => u.Role == Data.Domain.Enums.Role.Manager && u.Id == request.ManagerId).FirstOrDefault()?.Id;
        }
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return (user, null);
    }
    public async Task<List<GetUsersDto>> GetAllUsersByRole(Role role)
    {
        return await context.Users.Where(m => m.Role == role).Select(m => new GetUsersDto { Id = m.Id, Username = m.Username }).ToListAsync();
    }

    public async Task<(User? user, string? error)> HelperCheckFunc(CreateUserDto request) {
        //Username tests
        if (await context.Users.AnyAsync(u => u.Username == request.Username)) return (null, "User already exists");
        if (request.Username.Length < 3) return (null, "Username must be at least 3 characters long");
        if (request.Username.Length > 20) return (null, "Username must be maximum 20 characters long");
        if (string.IsNullOrEmpty(request.Username)) return (null, "Username cannot be empty");
        if (request.Username.Any(ch => !char.IsLetterOrDigit(ch))) return (null, "Username cannot contain special symbols");
        if (request.Username.Any(ch => char.IsDigit(ch))) return (null, "Username cannot contain digits");
        //Password tests
        if (string.IsNullOrEmpty(request.Password)) return (null, "Password cannot be empty");
        if (request.Password.Length < 8) return (null, "Password must be at least 8 characters long");
        if (request.Password.Length > 30) return (null, "Password must be maximum 30 characters long");
        if (!request.Password.Any(char.IsUpper)) return (null, "Password must contain at least one uppercase letter");
        if (!request.Password.Any(char.IsLower)) return (null, "Password must contain at least one lowercase letter");
        if (!request.Password.Any(char.IsDigit)) return (null, "Password must contain at least one digit");
        if (!request.Password.Any(ch => !char.IsLetterOrDigit(ch))) return (null, "Password must contain at least one special character");
    return (null, null);
    }

}
