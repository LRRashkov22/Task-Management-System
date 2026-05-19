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
        if(request.Username.Length > 19) return null;

        if (!string.IsNullOrWhiteSpace(request.Username))
        {
            var usernameExists = await context.Users
                .AsNoTracking() 
                .AnyAsync(u =>
                    u.Username == request.Username &&
                    u.Id != request.Id);

            if (usernameExists)
                return null;

            user.Username = request.Username;
        }
        if (request.ManagerId != null) { 
        var manager = await context.Users.FirstOrDefaultAsync(u => u.Id == request.ManagerId);
            if (manager == null) return null;
        }
        user.Username = request.Username ?? user.Username;
        user.ManagerId = request.ManagerId ?? user.ManagerId;
        await context.SaveChangesAsync();
        return new EditUserDto { ManagerId = user.ManagerId, Username = user.Username };
    }
    public async Task<(bool status, string? error)> DeleteEmployeeAsync(int employeeId)
    {
        var employee = await context.Users
            .FirstOrDefaultAsync(u =>
                u.Id == employeeId &&
                u.Role == Role.Employee);

        if (employee == null)
            return (false, "Employee not found");

        context.Users.Remove(employee);

        await context.SaveChangesAsync();

        return (true, null);
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

    public async Task<(bool status, string? error)> TransferOwnershipAsync(TransferManagerOwnershipDto request)
    {
        if (request.CurrentManagerId == request.NewManagerId)
            return (false, "Cannot transfer to same manager");

        var currentManager = await context.Users
            .FirstOrDefaultAsync(u =>
                u.Id == request.CurrentManagerId &&
                u.Role == Role.Manager);

        if (currentManager == null)
            return (false, "Current manager not found");

        var newManager = await context.Users
            .FirstOrDefaultAsync(u =>
                u.Id == request.NewManagerId &&
                u.Role == Role.Manager);

        if (newManager == null)
            return (false, "New manager not found");

        await using var transaction =
            await context.Database.BeginTransactionAsync();

        try
        {
            // transfer employees
            var employees = await context.Users
                .Where(u => u.ManagerId == request.CurrentManagerId)
                .ToListAsync();

            foreach (var employee in employees)
            {
                employee.ManagerId = request.NewManagerId;
            }

            // transfer teams
            var teams = await context.Teams
                .Where(t => t.ManagerId == request.CurrentManagerId)
                .ToListAsync();

            foreach (var team in teams)
            {
                team.ManagerId = request.NewManagerId;
            }

            // transfer created tasks
            var tasks = await context.TaskItems
                .Where(t => t.CreatedById == request.CurrentManagerId)
                .ToListAsync();

            foreach (var task in tasks)
            {
                task.CreatedById = request.NewManagerId;
            }

            await context.SaveChangesAsync();

            await transaction.CommitAsync();

            return (true, null);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return (false, "Transfer failed");
        }
    }

    public async Task<(bool status, string? error)> ForceDeleteManagerAsync(int managerId)
    {
        var manager = await context.Users
            .FirstOrDefaultAsync(u =>
                u.Id == managerId &&
                u.Role == Role.Manager);
        if (manager == null)
            return (false, "Manager not found");

        context.Users.Remove(manager);

        await context.SaveChangesAsync();

        return (true, null);
    }

}
