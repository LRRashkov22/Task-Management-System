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

public class CreateUserService : ICreateUser
{
    private readonly TaskManagementDbContext context;
    public CreateUserService(TaskManagementDbContext context)
   {
        this.context = context;
    }
    public async Task<(User? user, string? error)> RegisterUser(CreateUserDto request)
    {
        var (_, nameError) = await HelperCheckNameFunc(request);

        if (nameError != null)
        {
            return (null, nameError);
        }

        var (_, passError) = await HelperCheckPassFunc(request);

        if (passError != null)
        {
            return (null, passError);
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

    public async Task<(User? user, string? error)> HelperCheckNameFunc(CreateUserDto request) {
        //Username tests
        if (await context.Users.AnyAsync(u => u.Username == request.Username)) return (null, "User already exists");
        if (request.Username.Length < 3) return (null, "Username must be at least 3 characters long");
        if (request.Username.Length > 20) return (null, "Username must be maximum 20 characters long");
        if (string.IsNullOrEmpty(request.Username)) return (null, "Username cannot be empty");
        if (request.Username.Any(ch => !char.IsLetterOrDigit(ch))) return (null, "Username cannot contain special symbols");
        if (request.Username.Any(ch => char.IsDigit(ch))) return (null, "Username cannot contain digits");
    return (null, null);
    }

    public async Task<(User? user, string? error)> HelperCheckPassFunc(CreateUserDto request)
    {
        //Password tests
        if (string.IsNullOrEmpty(request.Password) ||
           request.Password.Length < 8 ||
           request.Password.Length > 30 ||
           !request.Password.Any(char.IsUpper) ||
           !request.Password.Any(char.IsLower) ||
           !request.Password.Any(char.IsDigit) ||
           !request.Password.Any(ch => !char.IsLetterOrDigit(ch)))
            return (null, "Password:" +
                 "\n must be at least 8 characters long" +
                 "\n must be maximum 30 characters long" +
                 "\n must contain at least one uppercase, lowercase letter, digit and special character");
        return (null, null);
    }

}
