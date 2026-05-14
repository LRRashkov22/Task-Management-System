using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Identity.Application.UserDto_s;
using TaskManagementSystem.Modules.Identity.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Immutable;
namespace TaskManagementSystem.Modules.Identity.Infrastructure.Service;

public class ManageUsersService : IManageUsers
{
    private readonly TaskManagementDbContext context;
    public ManageUsersService(TaskManagementDbContext context)
    {
        this.context = context;
    }


    public async Task<EditUserDto?> EditUser(EditUserDto request)
    {
        var user =  await context.Users.FirstOrDefaultAsync(u => u.Id == request.Id);
        if (user == null) return null;
        if (request.Username == null) return null;
        if (request.ManagerId != null) { 
        var manager = await context.Users.FirstOrDefaultAsync(u => u.Id == request.ManagerId);
            if (manager == null) return null;
        }
        user.Username = request.Username ?? user.Username;
        user.ManagerId = request.ManagerId ?? user.ManagerId;
        await context.SaveChangesAsync();
        return new EditUserDto { ManagerId = user.ManagerId, Username = user.Username };
    }
        public async Task<bool> DeleteUser(DeleteDto request)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == request.Id);
        if (user == null) return false;
        context.Users.Remove(user);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task Logout(int userId)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await context.SaveChangesAsync();
        }
    }

}
