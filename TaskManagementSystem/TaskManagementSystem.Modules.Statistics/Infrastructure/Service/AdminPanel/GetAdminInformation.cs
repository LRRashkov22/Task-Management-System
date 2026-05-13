using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Statistics.Application.DTO_s;
using TaskManagementSystem.Modules.Statistics.Application.Interface;
namespace TaskManagementSystem.Modules.Statistics.Infrastructure.Service.AdminPanel;

public class GetAdminInformation : IGetAdminInformation {

    private readonly TaskManagementDbContext context;
    public GetAdminInformation(TaskManagementDbContext context)
    {
        this.context = context;
    }
    //Get List Of Employees And Managers for Employee/Manager Page with apopriate data
    public async Task<List<GetUsersDto>> GetAllUsersByRole(Role role)
    {
        if (role == Role.Employee)
        {
            //return all employees and their manager name
            return await context.Users
                .Include(u => u.Manager)
                .Where(u => u.Role == Role.Employee)
                .Select(u => new GetUsersDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    ManagerName = u.Manager != null ? u.Manager.Username : string.Empty
                }).ToListAsync();
        }
        //return all managers name and the number of team they own 
        return await context.Users
                .Where(u => u.Role == Role.Manager)
                .Select(u => new GetUsersDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    ManagerName = string.Empty,
                    teams = u.ManagedTeams.Count()
                }).ToListAsync();
    }

    //Get Information For Admin Dashboard Page
    public async Task<DashboardDto> GetAdminDashboardInformation() {
        var usersCount = await context.Users.AsNoTracking().Where(u => u.Role == Role.Employee).CountAsync();
        var managersCount = await context.Users.AsNoTracking().Where(m => m.Role == Role.Manager).CountAsync();
        var tasks = await context.TaskItems.AsNoTracking().CountAsync();
        var teams = await context.Teams.AsNoTracking().CountAsync();

        return new DashboardDto
        {
            FirstEntity = usersCount,
            SecondEntitu = managersCount,
            ThirdEntity = tasks,
            FourthEntity = teams
        };
    }
    public async Task<List<GetUsersDto>> GetSearchEmployees(string? search, int page = 1,
    int pageSize = 10)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize > 50 ? 50 : pageSize;

        var query = context.Users
            .AsNoTracking()
            .Where(u => u.Role == Role.Employee);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u =>
                u.Username.Contains(search));
        }

        return await query
            .OrderBy(u => u.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new GetUsersDto
            {
                Id = u.Id,
                Username = u.Username,
                ManagerName = u.Manager != null
                    ? u.Manager.Username
                    : string.Empty
            })
            .ToListAsync();
    }
}
